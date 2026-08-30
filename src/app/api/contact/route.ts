import { NextRequest, NextResponse } from "next/server";
import { isMailConfigured, sendContactEmail } from "@/lib/mail";
import { formTokenError } from "@/lib/form-token";

export const runtime = "nodejs";

const MAX = {
  name: 120,
  email: 200,
  phone: 40,
  service: 200,
  message: 5000,
  locale: 8,
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function str(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimited(ip: string) {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || now > current.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_PER_WINDOW;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": "900" } });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success so they stop.
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const tokenProblem = formTokenError(str(body.formToken, 200));
  if (tokenProblem) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const payload = {
    name: str(body.name, MAX.name),
    email: str(body.email, MAX.email),
    phone: str(body.phone, MAX.phone) || undefined,
    service: str(body.service, MAX.service) || undefined,
    message: str(body.message, MAX.message),
    locale: str(body.locale, MAX.locale) || undefined,
  };

  if (!payload.name || !payload.email || !payload.message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }
  if (!isEmail(payload.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  }
  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured on the server" },
      { status: 503 },
    );
  }

  try {
    await sendContactEmail(payload);
  } catch (error) {
    console.error("Contact email failed:", error);
    // Return the SMTP failure *kind* — not the message, which can echo the
    // address and server banner. "Failed to send email" alone gives whoever
    // is debugging no way to tell a wrong password from a blocked port.
    const code = typeof error === "object" && error && "code" in error ? String((error as { code: unknown }).code) : undefined;
    const reason =
      code === "EAUTH" ? "authentication rejected"
      : code === "ECONNECTION" || code === "ESOCKET" ? "could not connect"
      : code === "ETIMEDOUT" || code === "ECONNRESET" ? "connection timed out"
      : code === "EENVELOPE"
        // nodemailer records which SMTP verb was refused: MAIL FROM carries the
        // sender, RCPT TO the recipient. Knowing which one halves the search.
        ? (typeof error === "object" && error && "command" in error && String((error as { command: unknown }).command) === "RCPT TO"
            ? "recipient address refused"
            : "sender address refused")
      : undefined;
    return NextResponse.json(
      { error: "Failed to send email", ...(reason ? { reason, code } : {}) },
      { status: 502 },
    );
  }

  const apiBase = process.env.API_BASE_URL || "https://api.globaluntoldstory.com/api/v1";
  try {
    await fetch(`${apiBase}/contact`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Contact CMS copy failed:", error);
  }

  return NextResponse.json({ ok: true });
}

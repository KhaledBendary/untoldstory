import { NextRequest, NextResponse } from "next/server";
import { isMailConfigured, sendContactEmail } from "@/lib/mail";
import { formTokenError } from "@/lib/form-token";
import { addMessage, markMessageEmailed } from "@/lib/db/repo";

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

  // Capture the lead in the database FIRST — it must survive even if the email
  // notification fails or SMTP is misconfigured. This is the record of truth;
  // the dashboard inbox reads it. The email is only a notification on top.
  let messageId: number | null = null;
  try {
    messageId = await addMessage(payload);
  } catch (error) {
    console.error("Contact DB store failed:", error);
  }

  // Notify by email (best-effort). A failure here never loses the lead.
  let emailed = false;
  if (isMailConfigured()) {
    try {
      await sendContactEmail(payload);
      emailed = true;
    } catch (error) {
      console.error("Contact email failed:", error);
    }
  }
  if (emailed && messageId) {
    try { await markMessageEmailed(messageId); } catch { /* the row exists; the flag is cosmetic */ }
  }

  // Only if we could neither store nor email is the message truly lost.
  if (messageId === null && !emailed) {
    return NextResponse.json({ error: "Could not receive your message, please try again" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

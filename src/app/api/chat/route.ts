import { NextRequest, NextResponse } from "next/server";
import { nouranChat, nouranConfigured, type ChatMessage } from "@/lib/nouran";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";

export const runtime = "nodejs";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, { count: number; resetAt: number }>();

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

export async function POST(request: NextRequest) {
  if (!nouranConfigured()) {
    return NextResponse.json({ error: "Chat is not configured" }, { status: 503 });
  }

  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": "900" } });
  }

  let body: { messages?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const locale = isLocale(String(body.locale)) ? String(body.locale) : DEFAULT_LOCALE;

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const history: ChatMessage[] = rawMessages
    .slice(-MAX_MESSAGES)
    .map((m): ChatMessage | null => {
      if (!m || typeof m !== "object") return null;
      const role = (m as { role?: unknown }).role;
      const content = (m as { content?: unknown }).content;
      if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
      return { role, content: content.slice(0, MAX_MESSAGE_CHARS) };
    })
    .filter((m): m is ChatMessage => m !== null);

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Missing a visitor message" }, { status: 422 });
  }

  try {
    const result = await nouranChat(history, locale);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Nouran chat failed:", error);
    return NextResponse.json({ error: "Nouran is unavailable right now, please try again" }, { status: 502 });
  }
}

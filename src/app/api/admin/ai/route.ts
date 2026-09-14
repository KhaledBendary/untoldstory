import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { aiConfigured, aiSeo, aiImprove, aiSummarize, AIError } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 30;

const ERROR_AR: Record<string, string> = {
  "not-configured": "مساعد الكتابة مش متظبط بعد (ANTHROPIC_API_KEY)",
  "bad-key": "مفتاح الـ AI غير صحيح",
  "empty-input": "مفيش نص أشتغل عليه",
  parse: "الرد جه بشكل مش متوقع — جرّب تاني",
  empty: "مفيش رد — جرّب تاني",
};
const msg = (code: string) => ERROR_AR[code] || "حصل خطأ في مساعد الكتابة — جرّب تاني";

/** The editor's writing assistant: draft SEO, improve text, or summarize. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  if (!aiConfigured()) {
    return NextResponse.json({ error: msg("not-configured") }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const lang = body?.lang === "ar" ? "ar" : "en";

  try {
    if (action === "seo") {
      const out = await aiSeo({ title: String(body?.title || ""), body: String(body?.body || ""), lang });
      return NextResponse.json({ ok: true, ...out });
    }
    if (action === "improve") {
      const text = await aiImprove({ text: String(body?.text || ""), lang });
      return NextResponse.json({ ok: true, text });
    }
    if (action === "summarize") {
      const text = await aiSummarize({ text: String(body?.text || ""), lang });
      return NextResponse.json({ ok: true, text });
    }
    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (e) {
    const code = e instanceof AIError ? e.message : "unknown";
    const status = code === "not-configured" ? 503 : code === "bad-key" ? 502 : 500;
    return NextResponse.json({ error: msg(code) }, { status });
  }
}

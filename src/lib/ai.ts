import "server-only";

/**
 * A thin wrapper over the Anthropic Messages API for the editor's writing
 * assistant: draft SEO metadata, polish a paragraph, or shorten text into an
 * excerpt. Keyed by ANTHROPIC_API_KEY (the user adds it to the environment; it
 * never lives in the repo). Without the key every helper reports "not
 * configured" and the editor simply hides the buttons.
 *
 * The model is deliberately small and fast — this is short-form marketing copy,
 * not long reasoning. Override with AI_MODEL if needed.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.AI_MODEL || "claude-haiku-4-5-20251001";

export const aiConfigured = (): boolean => Boolean(process.env.ANTHROPIC_API_KEY);

export class AIError extends Error {}

async function callClaude(system: string, user: string, maxTokens = 700): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new AIError("not-configured");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Anthropic API error", res.status, detail.slice(0, 300));
    throw new AIError(res.status === 401 ? "bad-key" : `http-${res.status}`);
  }

  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (json.content || []).filter((b) => b.type === "text").map((b) => b.text || "").join("").trim();
  if (!text) throw new AIError("empty");
  return text;
}

const LANG_NAME: Record<string, string> = { en: "English", ar: "Arabic (Egyptian, natural marketing tone)" };
function langName(lang: string): string {
  return LANG_NAME[lang] || "English";
}

const BRAND =
  "The brand is Global Untold Story, a film and video production studio working across Egypt and the wider MENA region. " +
  "Tone: confident, cinematic, human — never generic or buzzword-heavy.";

/** Draft an SEO meta title (≤60 chars) and description (≤155 chars) from the item. */
export async function aiSeo(input: { title: string; body: string; lang: string }): Promise<{ title: string; description: string }> {
  const system =
    `You write SEO metadata for a website. ${BRAND} ` +
    `Write in ${langName(input.lang)}. Return ONLY valid JSON of the form ` +
    `{"title":"...","description":"..."} with no code fence and no extra text. ` +
    `The title must be at most 60 characters and the description at most 155 characters, ` +
    `both compelling and specific to the content, not clickbait.`;
  const user = `Content title: ${input.title || "(none)"}\n\nContent body (may be HTML, ignore tags):\n${(input.body || "").slice(0, 4000)}`;
  const raw = await callClaude(system, user, 400);
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/,"").trim();
  try {
    const obj = JSON.parse(cleaned) as { title?: string; description?: string };
    return { title: (obj.title || "").trim(), description: (obj.description || "").trim() };
  } catch {
    throw new AIError("parse");
  }
}

/** Polish a piece of text without changing its meaning or language. */
export async function aiImprove(input: { text: string; lang: string }): Promise<string> {
  if (!input.text.trim()) throw new AIError("empty-input");
  const system =
    `You are a copy editor. ${BRAND} ` +
    `Improve the clarity, flow and impact of the text the user gives you, keeping the same language (${langName(input.lang)}), ` +
    `the same meaning, and roughly the same length. Preserve any HTML tags exactly. ` +
    `Return ONLY the improved text, with no preamble or quotes.`;
  return callClaude(system, input.text.slice(0, 6000), 1200);
}

/** Summarize text into a short excerpt (1–2 sentences). */
export async function aiSummarize(input: { text: string; lang: string }): Promise<string> {
  if (!input.text.trim()) throw new AIError("empty-input");
  const system =
    `You write short marketing excerpts. ${BRAND} ` +
    `Summarize the text into one or two sentences in ${langName(input.lang)}, suitable as a preview/excerpt. ` +
    `Strip any HTML. Return ONLY the summary, no preamble or quotes.`;
  return callClaude(system, input.text.slice(0, 6000), 300);
}

import "server-only";

/**
 * Machine translation of the seven indexed languages from English.
 *
 * English and Arabic are authored by hand in the dashboard; fr, de, es, it, pt,
 * ru and tr are generated from the English on save so the whole site stays
 * translated without anyone touching them. Google Cloud Translation v2 is the
 * provider (set GOOGLE_TRANSLATE_API_KEY). HTML fields are sent with format:html
 * so tags survive; plain fields as text.
 *
 * Everything here is best-effort: a missing key or a failed call throws, and the
 * caller saves the English/Arabic anyway. Translation never blocks a save.
 */

export const MACHINE_LOCALES = ["fr", "de", "es", "it", "pt", "ru", "tr", "zh", "ja", "ko", "pl", "sw"] as const;
export type MachineLocale = (typeof MACHINE_LOCALES)[number];

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

// Keep each request under Google's payload limits: cap the batch by count and by
// total characters, so a few long article bodies don't overflow one call.
const MAX_ITEMS_PER_REQUEST = 100;
const MAX_CHARS_PER_REQUEST = 25_000;

/**
 * Provider is chosen by whichever key is set, in this order:
 *   OPENAI_API_KEY (GPT) → ANTHROPIC_API_KEY (Claude) → GOOGLE_TRANSLATE_API_KEY.
 * LLM translation reads more naturally for marketing copy than Google Translate.
 */
export const translationConfigured = (): boolean =>
  Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_TRANSLATE_API_KEY);

const LOCALE_NAMES: Record<string, string> = {
  fr: "French", de: "German", es: "Spanish", it: "Italian", pt: "Portuguese", ru: "Russian",
  tr: "Turkish", zh: "Simplified Chinese", ja: "Japanese", ko: "Korean", pl: "Polish", sw: "Swahili",
};

/** Translate a batch of strings to one language via an LLM, preserving HTML. */
function llmPrompt(q: string[], target: string, format: "text" | "html"): string {
  const lang = LOCALE_NAMES[target] || target;
  return [
    `Translate each string in the JSON array below from English to ${lang}.`,
    format === "html" ? "The strings are HTML — translate only the human-readable text and keep every HTML tag, attribute and entity exactly as-is." : "The strings are plain text.",
    "Keep brand names, URLs and email addresses unchanged. Do not add or remove items.",
    `Return ONLY a JSON array of ${q.length} translated strings in the same order — no explanation, no code fence.`,
    "",
    JSON.stringify(q),
  ].join("\n");
}

function parseArray(raw: string, n: number): string[] {
  let s = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/,"").trim();
  const start = s.indexOf("["); const end = s.lastIndexOf("]");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  const arr = JSON.parse(s);
  if (!Array.isArray(arr) || arr.length !== n) throw new Error("LLM translation: array length mismatch");
  return arr.map((x) => String(x));
}

async function openaiTranslate(q: string[], target: string, format: "text" | "html"): Promise<string[]> {
  const key = process.env.OPENAI_API_KEY!;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a professional website localizer. Output only what is asked." },
        { role: "user", content: llmPrompt(q, target, format) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return parseArray(json.choices?.[0]?.message?.content || "", q.length);
}

async function anthropicTranslate(q: string[], target: string, format: "text" | "html"): Promise<string[]> {
  const key = process.env.ANTHROPIC_API_KEY!;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_TRANSLATE_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [{ role: "user", content: llmPrompt(q, target, format) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (json.content || []).filter((b) => b.type === "text").map((b) => b.text || "").join("");
  return parseArray(text, q.length);
}

async function googleTranslate(q: string[], target: string, format: "text" | "html"): Promise<string[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY!;
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, source: "en", target, format }),
  });
  if (!res.ok) throw new Error(`Google Translate ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { data?: { translations?: { translatedText: string }[] } };
  const out = json.data?.translations?.map((t) => t.translatedText);
  if (!out || out.length !== q.length) throw new Error("Google Translate: unexpected response shape");
  return out;
}

/** Dispatch one batch to the configured provider. */
function providerTranslate(q: string[], target: string, format: "text" | "html"): Promise<string[]> {
  if (process.env.OPENAI_API_KEY) return openaiTranslate(q, target, format);
  if (process.env.ANTHROPIC_API_KEY) return anthropicTranslate(q, target, format);
  if (process.env.GOOGLE_TRANSLATE_API_KEY) return googleTranslate(q, target, format);
  throw new Error("No translation provider configured (OPENAI_API_KEY / ANTHROPIC_API_KEY / GOOGLE_TRANSLATE_API_KEY)");
}

export type FieldToTranslate = { key: string; format: "text" | "html"; text: string };

function chunk(fields: FieldToTranslate[]): FieldToTranslate[][] {
  const out: FieldToTranslate[][] = [];
  let cur: FieldToTranslate[] = [];
  let chars = 0;
  for (const f of fields) {
    if (cur.length && (cur.length >= MAX_ITEMS_PER_REQUEST || chars + f.text.length > MAX_CHARS_PER_REQUEST)) {
      out.push(cur); cur = []; chars = 0;
    }
    cur.push(f); chars += f.text.length;
  }
  if (cur.length) out.push(cur);
  return out;
}

/**
 * Translate the given English fields into all seven machine locales.
 * Returns result[fieldKey][locale] = translatedText. Empty fields are ignored.
 */
export async function translateFields(fields: FieldToTranslate[]): Promise<Record<string, Record<MachineLocale, string>>> {
  const out: Record<string, Record<string, string>> = {};
  const nonEmpty = fields.filter((f) => f.text && f.text.trim());
  if (!nonEmpty.length) return out as Record<string, Record<MachineLocale, string>>;
  // Pre-create each field's bucket so parallel workers never race to init it.
  for (const f of nonEmpty) out[f.key] = {};

  // One task per (locale, format-chunk). Running them sequentially blows the
  // serverless timeout (12 locales × slow LLM calls), so run with bounded
  // concurrency instead — wall time drops to roughly the slowest single call.
  type Task = { target: MachineLocale; format: "text" | "html"; part: FieldToTranslate[] };
  const tasks: Task[] = [];
  for (const target of MACHINE_LOCALES) {
    for (const format of ["text", "html"] as const) {
      const group = nonEmpty.filter((f) => f.format === format);
      for (const part of chunk(group)) tasks.push({ target, format, part });
    }
  }

  const CONCURRENCY = 6;
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const t = tasks[next++];
      const translated = await providerTranslate(t.part.map((f) => f.text), t.target, t.format);
      t.part.forEach((f, i) => { out[f.key][t.target] = translated[i]; });
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker));
  return out as Record<string, Record<MachineLocale, string>>;
}

import "server-only";

/**
 * Machine translation of the site's languages.
 *
 * English and Arabic are the two hand-authored languages — but "hand-authored"
 * only means a person may write either one; if only one of them is filled in,
 * the other is machine-translated too (see translatePair, used from apply.ts)
 * so Arabic is never silently left as an English copy. The other twelve
 * locales are always generated from the English on save.
 *
 * Provider is GPT, Claude or Google Translate — whichever key is configured
 * (see providerTranslate below). HTML fields are translated with format:html so
 * tags survive; plain fields as text.
 *
 * Everything here is best-effort: a missing key or a failed call throws, and the
 * caller saves whatever the editor wrote anyway. Translation never blocks a save.
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
  en: "English", ar: "Arabic",
  fr: "French", de: "German", es: "Spanish", it: "Italian", pt: "Portuguese", ru: "Russian",
  tr: "Turkish", zh: "Simplified Chinese", ja: "Japanese", ko: "Korean", pl: "Polish", sw: "Swahili",
};

/** Translate a batch of strings from one language to another via an LLM, preserving HTML. */
function llmPrompt(q: string[], target: string, format: "text" | "html", source: string): string {
  const from = LOCALE_NAMES[source] || source;
  const to = LOCALE_NAMES[target] || target;
  return [
    `Translate each string in the JSON array below from ${from} to ${to}.`,
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Parse OpenAI's "Please try again in 6.827s" hint out of a 429 body, or fall back to a fixed wait. */
function retryDelayMs(body: string, attempt: number): number {
  const m = body.match(/try again in ([\d.]+)s/i);
  return m ? Math.ceil(parseFloat(m[1]) * 1000) + 500 : 4000 * (attempt + 1);
}

async function openaiTranslate(q: string[], target: string, format: "text" | "html", source: string, attempt = 0): Promise<string[]> {
  const key = process.env.OPENAI_API_KEY!;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      // Without an explicit cap, a long article body could get cut off by the
      // model's own default output limit, breaking the JSON array mid-string
      // — surfacing as an opaque "array length mismatch" that discarded the
      // whole batch (including sibling fields that translated fine) before
      // partial-result handling existed. Generous enough for a full post body.
      max_tokens: 16000,
      messages: [
        { role: "system", content: "You are a professional website localizer. Output only what is asked." },
        { role: "user", content: llmPrompt(q, target, format, source) },
      ],
    }),
  });
  if (res.status === 429 && attempt < 4) {
    const body = await res.text();
    await sleep(retryDelayMs(body, attempt));
    return openaiTranslate(q, target, format, source, attempt + 1);
  }
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string }; finish_reason?: string }[] };
  const choice = json.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error(`OpenAI response was cut off (too long for max_tokens) — try a shorter field or split it`);
  }
  return parseArray(choice?.message?.content || "", q.length);
}

async function anthropicTranslate(q: string[], target: string, format: "text" | "html", source: string): Promise<string[]> {
  const key = process.env.ANTHROPIC_API_KEY!;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_TRANSLATE_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 8000,
      messages: [{ role: "user", content: llmPrompt(q, target, format, source) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (json.content || []).filter((b) => b.type === "text").map((b) => b.text || "").join("");
  return parseArray(text, q.length);
}

async function googleTranslate(q: string[], target: string, format: "text" | "html", source: string): Promise<string[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY!;
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, source, target, format }),
  });
  if (!res.ok) throw new Error(`Google Translate ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { data?: { translations?: { translatedText: string }[] } };
  const out = json.data?.translations?.map((t) => t.translatedText);
  if (!out || out.length !== q.length) throw new Error("Google Translate: unexpected response shape");
  return out;
}

/** Dispatch one batch to the configured provider. Source defaults to English. */
function providerTranslate(q: string[], target: string, format: "text" | "html", source: string = "en"): Promise<string[]> {
  if (process.env.OPENAI_API_KEY) return openaiTranslate(q, target, format, source);
  if (process.env.ANTHROPIC_API_KEY) return anthropicTranslate(q, target, format, source);
  if (process.env.GOOGLE_TRANSLATE_API_KEY) return googleTranslate(q, target, format, source);
  throw new Error("No translation provider configured (OPENAI_API_KEY / ANTHROPIC_API_KEY / GOOGLE_TRANSLATE_API_KEY)");
}

export type FieldToTranslate = { key: string; format: "text" | "html"; text: string };

/**
 * Thrown when some but not all requested translations succeeded — carries
 * whatever DID complete so a caller (see apply.ts) can save that instead of
 * discarding it. Before this existed, one bad chunk (e.g. an oversized HTML
 * body the model truncated into malformed JSON) threw partway through a
 * batch and silently dropped every OTHER field or locale already translated
 * in the same call — the likely explanation for "the title translated but
 * the body didn't" on the same save.
 */
export class PartialTranslateError extends Error {
  constructor(message: string, public partial: Record<string, unknown>) {
    super(message);
    this.name = "PartialTranslateError";
  }
}

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
export async function translateFields(
  fields: FieldToTranslate[],
  only?: readonly string[],
): Promise<Record<string, Record<MachineLocale, string>>> {
  const out: Record<string, Record<string, string>> = {};
  const nonEmpty = fields.filter((f) => f.text && f.text.trim());
  if (!nonEmpty.length) return out as Record<string, Record<MachineLocale, string>>;
  // Pre-create each field's bucket so parallel workers never race to init it.
  for (const f of nonEmpty) out[f.key] = {};
  const targets = only && only.length ? MACHINE_LOCALES.filter((l) => only.includes(l)) : MACHINE_LOCALES;

  // One task per (locale, format-chunk). Running them sequentially blows the
  // serverless timeout (12 locales × slow LLM calls), so run with bounded
  // concurrency instead — wall time drops to roughly the slowest single call.
  type Task = { target: MachineLocale; format: "text" | "html"; part: FieldToTranslate[] };
  const tasks: Task[] = [];
  for (const target of targets) {
    for (const format of ["text", "html"] as const) {
      const group = nonEmpty.filter((f) => f.format === format);
      for (const part of chunk(group)) tasks.push({ target, format, part });
    }
  }

  // Lower than the locale count on purpose — 12 parallel OpenAI calls landing
  // in the same instant is what exceeded a real account's per-minute token
  // quota (429) on the first bulk run. Retries absorb the rest.
  const CONCURRENCY = 5;
  let next = 0;
  // Each task's failure is caught here, not left to reject Promise.all: one
  // bad task (a stuck 429, a malformed response) used to throw and discard
  // every OTHER task's already-completed translation from the same call.
  const failures: string[] = [];
  async function worker() {
    while (next < tasks.length) {
      const t = tasks[next++];
      try {
        const translated = await providerTranslate(t.part.map((f) => f.text), t.target, t.format);
        t.part.forEach((f, i) => { out[f.key][t.target] = translated[i]; });
      } catch (e) {
        failures.push(`${t.target} (${t.part.map((f) => f.key).join(",")}): ${(e as Error).message || e}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker));
  if (failures.length) throw new PartialTranslateError(failures.join(" | "), out);
  return out as Record<string, Record<MachineLocale, string>>;
}

/**
 * Translate a batch of fields from one language to another (e.g. English→Arabic
 * or Arabic→English), independent of the 12 machine locales above. Used to keep
 * the two hand-authored languages in sync when only one was written.
 * Returns { fieldKey: translatedText }.
 */
export async function translatePair(fields: FieldToTranslate[], source: string, target: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const nonEmpty = fields.filter((f) => f.text && f.text.trim());
  if (!nonEmpty.length) return out;
  const failures: string[] = [];
  for (const format of ["text", "html"] as const) {
    const group = nonEmpty.filter((f) => f.format === format);
    for (const part of chunk(group)) {
      try {
        const translated = await providerTranslate(part.map((f) => f.text), target, format, source);
        part.forEach((f, i) => { out[f.key] = translated[i]; });
      } catch (e) {
        // One chunk failing (e.g. a large HTML body the model truncated into
        // malformed JSON) no longer discards every other field's result —
        // keep going and report only what actually failed.
        failures.push(`${format} (${part.map((f) => f.key).join(",")}): ${(e as Error).message || e}`);
      }
    }
  }
  if (failures.length) throw new PartialTranslateError(failures.join(" | "), out);
  return out;
}

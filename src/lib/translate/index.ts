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

export const MACHINE_LOCALES = ["fr", "de", "es", "it", "pt", "ru", "tr"] as const;
export type MachineLocale = (typeof MACHINE_LOCALES)[number];

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

// Keep each request under Google's payload limits: cap the batch by count and by
// total characters, so a few long article bodies don't overflow one call.
const MAX_ITEMS_PER_REQUEST = 100;
const MAX_CHARS_PER_REQUEST = 25_000;

export const translationConfigured = (): boolean => Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);

async function googleTranslate(q: string[], target: string, format: "text" | "html"): Promise<string[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("GOOGLE_TRANSLATE_API_KEY not set");
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

  for (const target of MACHINE_LOCALES) {
    for (const format of ["text", "html"] as const) {
      const group = nonEmpty.filter((f) => f.format === format);
      for (const part of chunk(group)) {
        const translated = await googleTranslate(part.map((f) => f.text), target, format);
        part.forEach((f, i) => { (out[f.key] ??= {})[target] = translated[i]; });
      }
    }
  }
  return out as Record<string, Record<MachineLocale, string>>;
}

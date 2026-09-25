import "server-only";
import { MACHINE_LOCALES, translateFields, translatePair, translationConfigured, type FieldToTranslate, type MachineLocale } from "@/lib/translate";
import type { ContentType } from "@/lib/admin/content-types";
import type { Dict } from "@/lib/content-validate";
import { getPath, type SingletonField } from "@/lib/admin/singleton-fields";
import type { Singleton } from "@/lib/db/repo";

/**
 * Fill in whichever of English/Arabic is missing from the other, in place.
 * Either language may be the one a person actually wrote — if only English was
 * filled in, Arabic is machine-translated from it, and vice versa, so Arabic is
 * never silently left as an English copy (the old behavior when it was assumed
 * a person would always write both by hand). Runs before the machine-locale
 * pass, which needs English filled in to work from.
 */
async function syncEnglishArabic(def: ContentType, data: Record<string, Dict>): Promise<{ warning?: string }> {
  const toAr: FieldToTranslate[] = [];
  const toEn: FieldToTranslate[] = [];
  for (const field of def.i18n) {
    if (field.noTranslate) continue; // keywords, canonical URLs, flags — never translate
    const en = data[field.key]?.en?.trim();
    const ar = data[field.key]?.ar?.trim();
    const format = field.type === "html" ? "html" : "text";
    if (en && !ar) toAr.push({ key: field.key, format, text: en });
    else if (ar && !en) toEn.push({ key: field.key, format, text: ar });
  }
  if (!toAr.length && !toEn.length) return {};
  try {
    if (toAr.length) {
      const filled = await translatePair(toAr, "en", "ar");
      for (const [key, text] of Object.entries(filled)) data[key] = { ...data[key], ar: text };
    }
    if (toEn.length) {
      const filled = await translatePair(toEn, "ar", "en");
      for (const [key, text] of Object.entries(filled)) data[key] = { ...data[key], en: text };
    }
    return {};
  } catch (e) {
    // Best-effort: leave whichever language is still missing rather than fail
    // the whole save — but surface it, unlike before, so a broken key doesn't
    // look like a silent no-op to the editor.
    const detail = (e as Error).message || "";
    console.error("English/Arabic sync failed:", e);
    return { warning: `فشلت مزامنة الإنجليزي/العربي — ${detail.slice(0, 300)}` };
  }
}

/**
 * A URL-safe slug from a title, preserving the script it's written in (Arabic,
 * Cyrillic, CJK, ...) instead of forcing everything to ASCII. Deliberately does
 * NOT decompose-and-strip combining marks to drop Latin accents (é → e): that
 * same step corrupts Japanese, which encodes voicing (ジ vs シ) as a base
 * character plus a combining mark — NFKD-then-strip silently turned ジ into シ,
 * a different, wrong character, not just an unaccented one. \p{M} is kept for
 * exactly that reason, so accented Latin and every non-Latin script pass
 * through as real, correct slug characters.
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{M}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Regenerate data.slugs — a per-locale slug computed from each locale's title,
 * kept alongside the record's real (English/canonical) `slug` column. Not
 * wired into routing yet: this only generates and stores the translated
 * slugs so they're ready for that separately, without touching any live URL.
 */
function updateSlugs(def: ContentType, data: Record<string, Dict>): void {
  const titleField = def.i18n.find((f) => f.key === "title");
  if (!titleField) return;
  const titles = data[titleField.key];
  if (!titles) return;
  const slugs: Dict = { ...(data.slugs as Dict | undefined) };
  for (const [locale, text] of Object.entries(titles)) {
    if (text && text.trim()) slugs[locale] = slugify(text);
  }
  if (Object.keys(slugs).length) data.slugs = slugs;
}

/**
 * Fill the twelve machine languages of a content record from its English, in
 * place. Only fields whose English actually changed (or that are missing a
 * translation) are sent, so an unchanged save costs nothing and a body isn't
 * re-translated on every edit of a title.
 *
 * Best-effort: returns a human warning instead of throwing, so the caller still
 * saves whatever the editor wrote when translation is unconfigured or fails.
 */
export async function applyMachineTranslations(
  def: ContentType,
  data: Record<string, Dict>, // { fieldKey: { en, ar, ... } } — mutated in place
  existing: Record<string, Dict> | undefined,
  only?: readonly string[], // limit to these locales (e.g. one language at a time)
): Promise<{ warning?: string }> {
  const checkLocales = only && only.length ? only : MACHINE_LOCALES;

  // Single-locale calls (the per-language "translate" button) target one
  // machine locale at a time and shouldn't re-run this on every call.
  let arWarning: string | undefined;
  if ((!only || only.includes("ar") || only.includes("en")) && translationConfigured()) {
    arWarning = (await syncEnglishArabic(def, data)).warning;
  }

  const toTranslate: FieldToTranslate[] = [];
  for (const field of def.i18n) {
    if (field.noTranslate) continue; // keywords, canonical URLs, flags — never translate
    const en = data[field.key]?.en?.trim();
    if (!en) continue;
    const prevEn = existing?.[field.key]?.en;
    const missing = checkLocales.some((loc) => !existing?.[field.key]?.[loc]);
    if (en === prevEn && !missing) continue; // unchanged and already translated
    toTranslate.push({ key: field.key, format: field.type === "html" ? "html" : "text", text: data[field.key].en });
  }
  if (!toTranslate.length) { updateSlugs(def, data); return { warning: arWarning }; }
  if (!translationConfigured()) {
    updateSlugs(def, data);
    return { warning: arWarning || "الترجمة الآلية مش متظبطة — اتحفظ زي ما اتكتب بس" };
  }
  try {
    const results = await translateFields(toTranslate, only);
    for (const [key, dict] of Object.entries(results)) data[key] = { ...data[key], ...dict };
    updateSlugs(def, data);
    return { warning: arWarning };
  } catch (e) {
    const detail = (e as Error).message || "";
    console.error("Machine translation failed:", e);
    updateSlugs(def, data);
    const warning = `فشلت الترجمة الآلية — ${detail.slice(0, 300)}`;
    return { warning: arWarning ? `${arWarning} | ${warning}` : warning };
  }
}

/**
 * Translate the translatable fields of a list of block items into all seven
 * machine languages at once. `itemsEn[i]` holds the English text of each
 * translatable field for item i. Returns perLocale[locale][i] = { field: text },
 * falling back to the English text for any field the provider left empty. On a
 * missing key or failure it returns a warning and no translations, so the caller
 * copies the English across (never blocking the save).
 */
export async function translateBlockItems(
  itemsEn: Record<string, string>[],
  fields: { key: string; format: "text" | "html" }[],
): Promise<{ perLocale: Record<MachineLocale, Record<string, string>[]>; warning?: string }> {
  const empty = {} as Record<MachineLocale, Record<string, string>[]>;
  if (!itemsEn.length || !fields.length) return { perLocale: empty };
  if (!translationConfigured()) {
    return { perLocale: empty, warning: "الترجمة الآلية مش متظبطة — اللغات التلقائية بتاخد نسخة الإنجليزي" };
  }
  const toTranslate: FieldToTranslate[] = [];
  itemsEn.forEach((item, i) => {
    for (const f of fields) {
      const text = item[f.key];
      if (text && text.trim()) toTranslate.push({ key: `${i}::${f.key}`, format: f.format, text });
    }
  });
  try {
    const results = await translateFields(toTranslate);
    const perLocale = {} as Record<MachineLocale, Record<string, string>[]>;
    for (const loc of MACHINE_LOCALES) {
      perLocale[loc] = itemsEn.map((item, i) => {
        const out: Record<string, string> = {};
        for (const f of fields) out[f.key] = results[`${i}::${f.key}`]?.[loc] ?? item[f.key] ?? "";
        return out;
      });
    }
    return { perLocale };
  } catch (e) {
    console.error("Machine translation (block) failed:", e);
    return { perLocale: empty, warning: "فشلت الترجمة الآلية — اللغات التلقائية بتاخد نسخة الإنجليزي مؤقتاً" };
  }
}

/**
 * Fill in whichever of English/Arabic is missing from the other, for edited
 * singleton paths — same idea as syncEnglishArabic above, but over the
 * {path, values} shape the singleton editor sends instead of a content record.
 */
async function syncEnglishArabicSingleton(
  edits: { path: string; values: Record<string, string> }[],
  fieldByPath: Map<string, SingletonField>,
): Promise<{ warning?: string }> {
  const toAr: FieldToTranslate[] = [];
  const toEn: FieldToTranslate[] = [];
  for (const e of edits) {
    const field = fieldByPath.get(e.path);
    if (!field || field.ltr) continue; // technical value — keep identical across languages
    const en = e.values.en?.trim();
    const ar = e.values.ar?.trim();
    if (en && !ar) toAr.push({ key: e.path, format: "text", text: en });
    else if (ar && !en) toEn.push({ key: e.path, format: "text", text: ar });
  }
  if (!toAr.length && !toEn.length) return {};
  const byPath = new Map(edits.map((e) => [e.path, e]));
  try {
    if (toAr.length) {
      const filled = await translatePair(toAr, "en", "ar");
      for (const [path, text] of Object.entries(filled)) {
        const edit = byPath.get(path);
        if (edit) edit.values.ar = text;
      }
    }
    if (toEn.length) {
      const filled = await translatePair(toEn, "ar", "en");
      for (const [path, text] of Object.entries(filled)) {
        const edit = byPath.get(path);
        if (edit) edit.values.en = text;
      }
    }
    return {};
  } catch (e) {
    const detail = (e as Error).message || "";
    console.error("English/Arabic sync (singleton) failed:", e);
    return { warning: `فشلت مزامنة الإنجليزي/العربي — ${detail.slice(0, 300)}` };
  }
}

/**
 * Generate the seven machine languages for edited singleton paths, in place.
 * Technical values (emails, phones, social URLs — the ltr fields) are never
 * translated. Each edit's `values` map gains fr…tr when its English changed or
 * a translation is missing. Best-effort, same as the collections path.
 */
export async function applySingletonTranslations(
  edits: { path: string; values: Record<string, string> }[],
  fieldByPath: Map<string, SingletonField>,
  existing: Singleton | null,
): Promise<{ warning?: string }> {
  let arWarning: string | undefined;
  if (translationConfigured()) {
    arWarning = (await syncEnglishArabicSingleton(edits, fieldByPath)).warning;
  }

  const toTranslate: FieldToTranslate[] = [];
  const byPath = new Map(edits.map((e) => [e.path, e]));
  for (const e of edits) {
    const field = fieldByPath.get(e.path);
    if (!field || field.ltr) continue; // technical value — keep identical across languages
    const en = e.values.en?.trim();
    if (!en) continue;
    const prevEn = getPath(existing?.en, e.path);
    const missing = MACHINE_LOCALES.some((loc) => !getPath(existing?.[loc], e.path));
    if (en === prevEn && !missing) continue;
    toTranslate.push({ key: e.path, format: "text", text: e.values.en });
  }
  if (!toTranslate.length) return { warning: arWarning };
  if (!translationConfigured()) {
    return { warning: arWarning || "الترجمة الآلية مش متظبطة — اتحفظ الإنجليزي والعربي بس" };
  }
  try {
    const results = await translateFields(toTranslate);
    for (const [path, dict] of Object.entries(results)) {
      const edit = byPath.get(path);
      if (edit) Object.assign(edit.values, dict);
    }
    return { warning: arWarning };
  } catch (e) {
    console.error("Machine translation (singleton) failed:", e);
    const warning = "فشلت الترجمة الآلية — اتحفظ الإنجليزي والعربي، تقدر تحفظ تاني بعد شوية";
    return { warning: arWarning ? `${arWarning} | ${warning}` : warning };
  }
}

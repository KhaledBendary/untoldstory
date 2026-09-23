import "server-only";
import { MACHINE_LOCALES, translateFields, translationConfigured, type FieldToTranslate, type MachineLocale } from "@/lib/translate";
import type { ContentType } from "@/lib/admin/content-types";
import type { Dict } from "@/lib/content-validate";
import { getPath, type SingletonField } from "@/lib/admin/singleton-fields";
import type { Singleton } from "@/lib/db/repo";

/**
 * Fill the seven machine languages of a content record from its English, in
 * place, before it is saved. Only fields whose English actually changed (or
 * that are missing a translation) are sent, so an unchanged save costs nothing
 * and a body isn't re-translated on every edit of a title.
 *
 * Best-effort: returns a human warning instead of throwing, so the caller still
 * saves the English and Arabic when translation is unconfigured or fails.
 */
export async function applyMachineTranslations(
  def: ContentType,
  data: Record<string, Dict>, // { fieldKey: { en, ar, ... } } — mutated in place
  existing: Record<string, Dict> | undefined,
): Promise<{ warning?: string }> {
  const toTranslate: FieldToTranslate[] = [];
  for (const field of def.i18n) {
    if (field.noTranslate) continue; // keywords, canonical URLs, flags — never translate
    const en = data[field.key]?.en?.trim();
    if (!en) continue;
    const prevEn = existing?.[field.key]?.en;
    const missing = MACHINE_LOCALES.some((loc) => !existing?.[field.key]?.[loc]);
    if (en === prevEn && !missing) continue; // unchanged and already translated
    toTranslate.push({ key: field.key, format: field.type === "html" ? "html" : "text", text: data[field.key].en });
  }
  if (!toTranslate.length) return {};
  if (!translationConfigured()) {
    return { warning: "الترجمة الآلية مش متظبطة (GOOGLE_TRANSLATE_API_KEY) — اتحفظ الإنجليزي والعربي بس" };
  }
  try {
    const results = await translateFields(toTranslate);
    for (const [key, dict] of Object.entries(results)) data[key] = { ...data[key], ...dict };
    return {};
  } catch (e) {
    console.error("Machine translation failed:", e);
    return { warning: "فشلت الترجمة الآلية — اتحفظ الإنجليزي والعربي، تقدر تحفظ تاني بعد شوية عشان تتولّد" };
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
    return { perLocale: empty, warning: "الترجمة الآلية مش متظبطة (GOOGLE_TRANSLATE_API_KEY) — اللغات التلقائية بتاخد نسخة الإنجليزي" };
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
  if (!toTranslate.length) return {};
  if (!translationConfigured()) {
    return { warning: "الترجمة الآلية مش متظبطة (GOOGLE_TRANSLATE_API_KEY) — اتحفظ الإنجليزي والعربي بس" };
  }
  try {
    const results = await translateFields(toTranslate);
    for (const [path, dict] of Object.entries(results)) {
      const edit = byPath.get(path);
      if (edit) Object.assign(edit.values, dict);
    }
    return {};
  } catch (e) {
    console.error("Machine translation (singleton) failed:", e);
    return { warning: "فشلت الترجمة الآلية — اتحفظ الإنجليزي والعربي، تقدر تحفظ تاني بعد شوية" };
  }
}

import type { ContentType } from "@/lib/admin/content-types";
import type { Dict } from "@/lib/content-validate";

/**
 * SEO metadata is stored nested and per-locale inside a record's `data`:
 *   data.seo = { en: { metaTitle, metaDescription, ogImageUrl, … }, ar: {…}, … }
 * but the editor treats "seo.metaTitle" / "seo.metaDescription" as ordinary
 * per-locale fields ({ en, ar, … }) so validation and machine translation work
 * on them like any other. These helpers convert between the two shapes and never
 * touch the other seo sub-keys (ogTitle, ogImageUrl…) an item may already carry.
 */
type SeoDoc = Record<string, Record<string, string>>; // { locale: { subkey: value } }

const seoSub = (key: string): string | null => (key.startsWith("seo.") ? key.slice(4) : null);

/** Flatten the nested seo doc into editor field dicts, e.g. seo.metaTitle -> {en,ar}. */
export function extractSeoForEditor(seo: SeoDoc | undefined, def: ContentType): Record<string, Dict> {
  const out: Record<string, Dict> = {};
  for (const f of def.i18n) {
    const sub = seoSub(f.key);
    if (!sub) continue;
    const dict: Dict = {};
    for (const [loc, obj] of Object.entries(seo ?? {})) {
      const v = obj?.[sub];
      if (v != null) dict[loc] = v;
    }
    out[f.key] = dict;
  }
  return out;
}

/**
 * Fold the flat seo.* fields in `data` back into a nested, per-locale `data.seo`,
 * deep-merged onto whatever seo the record already had, then drop the flat keys.
 * Mutates `data` in place.
 */
export function assembleSeo(data: Record<string, Dict>, existingSeo: SeoDoc | undefined) {
  const flatKeys = Object.keys(data).filter((k) => seoSub(k));
  if (!flatKeys.length) return;

  const seo: SeoDoc = {};
  for (const [loc, obj] of Object.entries(existingSeo ?? {})) seo[loc] = { ...obj };
  for (const key of flatKeys) {
    const sub = seoSub(key)!;
    for (const [loc, val] of Object.entries(data[key] ?? {})) {
      (seo[loc] ??= {})[sub] = val;
    }
    delete data[key];
  }
  (data as Record<string, unknown>).seo = seo;
}

import "server-only";
import { MACHINE_LOCALES } from "@/lib/translate";
import { applyMachineTranslations } from "@/lib/translate/apply";
import { extractSeoForEditor, assembleSeo } from "@/lib/admin/seo-fields";
import { saveByType } from "@/lib/db/repo";
import type { ContentType } from "@/lib/admin/content-types";

export type Dict = Record<string, string>;
export type Row = Record<string, unknown> & { slug: string; data: Record<string, Dict> };
export type CType = "services" | "projects" | "posts";

/** (Re)generate machine languages for one item from its English (optionally one locale). */
export async function translateOne(type: CType, def: ContentType, row: Row, only?: readonly string[], force = false): Promise<{ ok: boolean; warning?: string; data?: Record<string, Dict> }> {
  const seo = (row.data as { seo?: Record<string, Record<string, string>> })?.seo;
  const data: Record<string, Dict> = {};
  for (const field of def.i18n) {
    if (field.key.startsWith("seo.")) continue;
    data[field.key] = { ...(row.data[field.key] || {}) };
  }
  Object.assign(data, extractSeoForEditor(seo as never, def));
  // Snapshot before translation mutates `data` — passing this (instead of
  // undefined) lets applyMachineTranslations skip locales a field already has,
  // instead of resending every field of every item on every bulk run. That
  // "always retranslate everything" behavior is what blew through OpenAI's
  // per-minute token quota (429) the first time this ran against real data.
  const existingFlat: Record<string, Dict> = {};
  for (const [key, dict] of Object.entries(data)) existingFlat[key] = { ...dict };

  const { warning } = await applyMachineTranslations(def, data, existingFlat, only, row.slug, force);
  if (warning) return { ok: false, warning };

  assembleSeo(data, seo as never);
  const fixed: Record<string, string | boolean | number | null> = {};
  for (const f of def.fixed) {
    const v = row[f.key];
    if (f.type === "bool") fixed[f.key] = Boolean(v);
    else if (f.type === "date") fixed[f.key] = v ? new Date(v as string).toISOString().slice(0, 10) : "";
    else fixed[f.key] = (v as string | number | null) ?? "";
  }

  // The per-item "translate" button fires one request per locale, three at a
  // time, all against this same row. `data` above still carries every OTHER
  // locale's value exactly as it was when THIS request started (read from
  // `row` at the top of this function) — writing all of it back would silently
  // overwrite whatever a concurrent sibling request already wrote for a locale
  // this request never touched, since saveByType's merge can't tell "unchanged
  // snapshot" from "a real edit" once both arrive as the same shape. Only the
  // locale(s) this call actually intended to change are saved.
  const touched = new Set<string>(only && only.length ? only : MACHINE_LOCALES);
  if (!only || only.includes("ar") || only.includes("en")) { touched.add("ar"); touched.add("en"); }
  const sparse: Record<string, Record<string, unknown>> = {};
  for (const [key, dict] of Object.entries(data as Record<string, Record<string, unknown>>)) {
    // slugs.en is just a change-detection marker (see updateSlugs in
    // translate/apply.ts), not a real per-locale value competing with a
    // concurrent sibling's write — always safe to include, and needed so the
    // next call actually sees it and skips re-translating an unchanged slug.
    const localesForKey = key === "slugs" ? new Set([...touched, "en"]) : touched;
    const sub: Record<string, unknown> = {};
    for (const loc of Object.keys(dict)) if (localesForKey.has(loc)) sub[loc] = dict[loc];
    if (Object.keys(sub).length) sparse[key] = sub;
  }

  await saveByType(type, row.slug, fixed, sparse as Record<string, Dict>);
  return { ok: true, data: sparse as Record<string, Dict> };
}

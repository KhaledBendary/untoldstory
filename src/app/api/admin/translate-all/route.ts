import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { CONTENT_TYPES, type ContentType } from "@/lib/admin/content-types";
import { listByType, getByType, saveByType, updateSlugsOnly, logActivity } from "@/lib/db/repo";
import { extractSeoForEditor, assembleSeo } from "@/lib/admin/seo-fields";
import { applyMachineTranslations, retranslateSlug } from "@/lib/translate/apply";
import { translationConfigured, MACHINE_LOCALES } from "@/lib/translate";
import { triggerDeploy } from "@/lib/deploy";

export const runtime = "nodejs";
export const maxDuration = 300;

type Dict = Record<string, string>;
type Row = Record<string, unknown> & { slug: string; data: Record<string, Dict> };
type CType = "services" | "projects" | "posts";

/** (Re)generate machine languages for one item from its English (optionally one locale). */
async function translateOne(type: CType, def: ContentType, row: Row, only?: readonly string[], force = false): Promise<{ ok: boolean; warning?: string; data?: Record<string, Dict> }> {
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

/**
 * Translate content into every machine language. Body may target ONE item —
 * { type, slug } — or, with no body, all services/projects/posts. Also fills
 * in whichever of English/Arabic is missing from the other on every item (see
 * applyMachineTranslations → syncEnglishArabic). Guarded so it does nothing
 * (and says so) with no key.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  if (!translationConfigured()) {
    return NextResponse.json(
      { error: "الترجمة الآلية مش متظبطة — ضيف OPENAI_API_KEY (أو ANTHROPIC_API_KEY أو GOOGLE_TRANSLATE_API_KEY) في المتغيرات وأعِد النشر." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const rawType = typeof body?.type === "string" ? body.type : undefined;
  const reqType = (rawType === "services" || rawType === "projects" || rawType === "posts") ? rawType : undefined;
  const reqSlug = typeof body?.slug === "string" ? body.slug : undefined;
  // Optional single locale — translate one language at a time (fast, no timeout).
  const reqLocale = typeof body?.locale === "string" ? body.locale : undefined;
  const only = reqLocale ? [reqLocale] : undefined;
  // The per-field "ترجم السلج دلوقتي" button — retranslate only data.slugs for
  // this one item, touching nothing else (no fixed columns, no other fields).
  const slugOnly = body?.slugOnly === true;
  // The "ترجم [لغة] بس" button — force a redo of this one locale even if it
  // already has a non-empty value, since the admin is specifically saying an
  // existing translation is wrong (see applyMachineTranslations's `force`).
  const force = body?.force === true;

  // Single-item mode.
  if (reqType && reqSlug) {
    const def = CONTENT_TYPES[reqType];
    if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });
    const row = (await getByType(reqType, reqSlug)) as unknown as Row | null;
    if (!row) return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });

    if (slugOnly) {
      const existingSlugs = (row.data as { slugs?: Dict })?.slugs;
      let result: { slugs: Dict; warning?: string };
      try { result = await retranslateSlug(row.slug, existingSlugs); }
      catch (e) {
        console.error(`slug-only translate ${reqType}/${reqSlug} failed:`, e);
        return NextResponse.json({ error: (e as Error).message || "فشلت ترجمة السلج" }, { status: 502 });
      }
      if (result.warning) return NextResponse.json({ error: result.warning }, { status: 502 });
      await updateSlugsOnly(reqType, row.slug, result.slugs);
      return NextResponse.json({ ok: true, slugs: result.slugs });
    }

    let result: { ok: boolean; warning?: string; data?: Record<string, Dict> } = { ok: false };
    try { result = await translateOne(reqType, def, row, only, force); }
    catch (e) { result = { ok: false, warning: (e as Error).message }; console.error(`translate ${reqType}/${reqSlug} failed:`, e); }
    if (!result.ok) return NextResponse.json({ error: result.warning || "فشلت الترجمة — جرّب تاني (اتأكد إن المفتاح صالح)" }, { status: 502 });
    // Deploy only when a full item (all locales) finished — not on every single-locale call.
    const deploy = only ? { triggered: false as const } : await triggerDeploy();
    if (!only) await logActivity({ actor: auth.session.email, action: "update", entity: reqType, ref: reqSlug, detail: "ترجمة العنصر لكل اللغات" });
    // Single-locale calls (the "ترجم [لغة] بس" button) return the fresh values
    // so the editor can update its own state without a full page reload.
    return NextResponse.json({ ok: true, done: 1, failed: [], deploy, ...(only ? { data: result.data } : {}) });
  }

  // All-items mode.
  const TYPES = ["services", "projects", "posts"] as const;
  let done = 0;
  // Carries the real reason per item — a bare slug list gave no way to tell a
  // dead key from a transient error from a genuinely bad translation.
  const failed: { ref: string; error: string }[] = [];
  for (const type of TYPES) {
    const def = CONTENT_TYPES[type];
    if (!def) continue;
    const rows = (await listByType(type)) as unknown as Row[];
    for (const row of rows) {
      try {
        const result = await translateOne(type, def, row);
        if (result.ok) done++;
        else failed.push({ ref: `${type}/${row.slug}`, error: result.warning || "unknown" });
      } catch (e) {
        console.error(`translate-all ${type}/${row.slug} failed:`, e);
        failed.push({ ref: `${type}/${row.slug}`, error: (e as Error).message || "unknown" });
      }
    }
  }
  await logActivity({ actor: auth.session.email, action: "update", entity: "site", detail: `ترجمة شاملة: ${done} عنصر` });
  const deploy = await triggerDeploy({ force: true });
  return NextResponse.json({ ok: true, done, failed, deploy });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { CONTENT_TYPES, type ContentType } from "@/lib/admin/content-types";
import { listByType, getByType, saveByType, logActivity } from "@/lib/db/repo";
import { extractSeoForEditor, assembleSeo } from "@/lib/admin/seo-fields";
import { applyMachineTranslations } from "@/lib/translate/apply";
import { translationConfigured } from "@/lib/translate";
import { triggerDeploy } from "@/lib/deploy";

export const runtime = "nodejs";
export const maxDuration = 300;

type Dict = Record<string, string>;
type Row = Record<string, unknown> & { slug: string; data: Record<string, Dict> };
type CType = "services" | "projects" | "posts";

/** (Re)generate machine languages for one item from its English (optionally one locale). */
async function translateOne(type: CType, def: ContentType, row: Row, only?: readonly string[]): Promise<{ ok: boolean; warning?: string }> {
  const seo = (row.data as { seo?: Record<string, Record<string, string>> })?.seo;
  const data: Record<string, Dict> = {};
  for (const field of def.i18n) {
    if (field.key.startsWith("seo.")) continue;
    data[field.key] = { ...(row.data[field.key] || {}) };
  }
  Object.assign(data, extractSeoForEditor(seo as never, def));

  const { warning } = await applyMachineTranslations(def, data, undefined, only);
  if (warning) return { ok: false, warning };

  assembleSeo(data, seo as never);
  const fixed: Record<string, string | boolean | number | null> = {};
  for (const f of def.fixed) {
    const v = row[f.key];
    if (f.type === "bool") fixed[f.key] = Boolean(v);
    else if (f.type === "date") fixed[f.key] = v ? new Date(v as string).toISOString().slice(0, 10) : "";
    else fixed[f.key] = (v as string | number | null) ?? "";
  }
  await saveByType(type, row.slug, fixed, data);
  return { ok: true };
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

  // Single-item mode.
  if (reqType && reqSlug) {
    const def = CONTENT_TYPES[reqType];
    if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });
    const row = (await getByType(reqType, reqSlug)) as unknown as Row | null;
    if (!row) return NextResponse.json({ error: "العنصر غير موجود" }, { status: 404 });
    let result: { ok: boolean; warning?: string } = { ok: false };
    try { result = await translateOne(reqType, def, row, only); }
    catch (e) { result = { ok: false, warning: (e as Error).message }; console.error(`translate ${reqType}/${reqSlug} failed:`, e); }
    if (!result.ok) return NextResponse.json({ error: result.warning || "فشلت الترجمة — جرّب تاني (اتأكد إن المفتاح صالح)" }, { status: 502 });
    // Deploy only when a full item (all locales) finished — not on every single-locale call.
    const deploy = only ? { triggered: false as const } : await triggerDeploy();
    if (!only) await logActivity({ actor: auth.session.email, action: "update", entity: reqType, ref: reqSlug, detail: "ترجمة العنصر لكل اللغات" });
    return NextResponse.json({ ok: true, done: 1, failed: [], deploy });
  }

  // All-items mode.
  const TYPES = ["services", "projects", "posts"] as const;
  let done = 0;
  const failed: string[] = [];
  for (const type of TYPES) {
    const def = CONTENT_TYPES[type];
    if (!def) continue;
    const rows = (await listByType(type)) as unknown as Row[];
    for (const row of rows) {
      try {
        if ((await translateOne(type, def, row)).ok) done++;
        else failed.push(`${type}/${row.slug}`);
      } catch (e) {
        console.error(`translate-all ${type}/${row.slug} failed:`, e);
        failed.push(`${type}/${row.slug}`);
      }
    }
  }
  await logActivity({ actor: auth.session.email, action: "update", entity: "site", detail: `ترجمة شاملة: ${done} عنصر` });
  const deploy = await triggerDeploy({ force: true });
  return NextResponse.json({ ok: true, done, failed, deploy });
}

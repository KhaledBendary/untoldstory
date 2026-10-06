import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { CONTENT_TYPES } from "@/lib/admin/content-types";
import { listByType, getByType, updateSlugsOnly, logActivity } from "@/lib/db/repo";
import { retranslateSlug } from "@/lib/translate/apply";
import { translationConfigured } from "@/lib/translate";
import { triggerDeploy } from "@/lib/deploy";
import { addLocaleSlugRedirects } from "@/lib/slug-redirects";
import { translateOne, type Dict, type Row } from "@/lib/translate/translate-item";

export const runtime = "nodejs";
export const maxDuration = 300;

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
      let result: { slugs: Dict; slugsManual: Dict; warning?: string };
      try { result = await retranslateSlug(row.slug, existingSlugs, (row.data as { slugsManual?: Dict })?.slugsManual, only); }
      catch (e) {
        console.error(`slug-only translate ${reqType}/${reqSlug} failed:`, e);
        return NextResponse.json({ error: (e as Error).message || "فشلت ترجمة السلج" }, { status: 502 });
      }
      if (result.warning) return NextResponse.json({ error: result.warning }, { status: 502 });
      await updateSlugsOnly(reqType, row.slug, result.slugs, result.slugsManual);
      await addLocaleSlugRedirects(reqType, row.slug, existingSlugs, result.slugs);
      return NextResponse.json({ ok: true, slugs: result.slugs, slugsManual: result.slugsManual });
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

  // Slugs only, for every item: regenerates each language's slug in its own
  // script (except ones typed by hand), 301-redirecting the old URLs.
  if (slugOnly) {
    let slugsDone = 0;
    const slugFailed: { ref: string; error: string }[] = [];
    for (const type of TYPES) {
      for (const row of (await listByType(type)) as unknown as Row[]) {
        try {
          const before = (row.data as { slugs?: Dict })?.slugs;
          const result = await retranslateSlug(row.slug, before, (row.data as { slugsManual?: Dict })?.slugsManual);
          if (result.warning) { slugFailed.push({ ref: `${type}/${row.slug}`, error: result.warning }); continue; }
          await updateSlugsOnly(type, row.slug, result.slugs);
          await addLocaleSlugRedirects(type, row.slug, before, result.slugs);
          slugsDone++;
        } catch (e) {
          slugFailed.push({ ref: `${type}/${row.slug}`, error: (e as Error).message || "unknown" });
        }
      }
    }
    await logActivity({ actor: auth.session.email, action: "update", entity: "site", detail: `تحديث السلجات بلغة كل صفحة: ${slugsDone} عنصر` });
    const deploy = await triggerDeploy({ force: true });
    return NextResponse.json({ ok: true, done: slugsDone, failed: slugFailed, deploy });
  }

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

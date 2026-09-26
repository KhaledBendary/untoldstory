import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { contentType } from "@/lib/admin/content-types";
import { getByType, saveByType, deleteByType, logActivity, renameSlugByType, addRedirect } from "@/lib/db/repo";
import { validateField, hasErrors, type Dict } from "@/lib/content-validate";
import { applyMachineTranslations } from "@/lib/translate/apply";
import { assembleSeo, extractSeoForEditor } from "@/lib/admin/seo-fields";
import { triggerDeploy } from "@/lib/deploy";
import { pingIndexNow, contentUrls, contentPaths } from "@/lib/indexnow";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 301 every locale's old URL to the new one so a slug change never 404s a live link. */
async function addSlugChangeRedirects(type: string, oldSlug: string, newSlug: string) {
  const oldPaths = contentPaths(type, oldSlug);
  const newPaths = contentPaths(type, newSlug);
  for (let i = 0; i < oldPaths.length; i++) {
    try { await addRedirect(oldPaths[i], newPaths[i]); } catch (e) { console.error("slug-change redirect failed:", oldPaths[i], e); }
  }
}

/** Save any content type. Guarded, then validated against that type's fields. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { type, slug } = await params;
  const def = contentType(type);
  if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });
  const existing = await getByType(def.table, slug);
  if (!existing) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  // Pull exactly the fields this type declares — nothing the client invents.
  const data: Record<string, Dict> = {};
  const issues = [];
  for (const field of def.i18n) {
    const dict = (body.data?.[field.key] ?? {}) as Dict;
    data[field.key] = dict;
    issues.push(...validateField(field.key, field.label, dict, { required: field.required }));
  }
  if (hasErrors(issues)) {
    return NextResponse.json({ error: "فيه مشاكل لازم تتصلح", issues }, { status: 422 });
  }

  const fixed: Record<string, string | boolean | number | null> = {};
  for (const field of def.fixed) fixed[field.key] = body.fixed?.[field.key] ?? null;

  // Optional slug change — the record's identity and its public URL. Renamed
  // first so every write below targets the row under its new slug.
  let targetSlug = slug;
  const requestedSlug = typeof body.newSlug === "string" ? body.newSlug.trim().toLowerCase() : undefined;
  if (requestedSlug && requestedSlug !== slug) {
    if (!SLUG_RE.test(requestedSlug)) {
      return NextResponse.json({ error: "المعرّف لازم يكون حروف إنجليزي صغيرة وأرقام وشرطة بس" }, { status: 422 });
    }
    try {
      await renameSlugByType(def.table, slug, requestedSlug);
    } catch {
      return NextResponse.json({ error: "المعرّف ده مستخدم بالفعل" }, { status: 409 });
    }
    targetSlug = requestedSlug;
    await addSlugChangeRedirects(type, slug, requestedSlug); // best-effort, takes effect on next deploy
  }

  // Change-detection for translation must see the current seo values too, so
  // flatten them alongside the record's other fields.
  const existingData = existing.data as Record<string, Dict> | undefined;
  const existingSeo = (existing.data as { seo?: Record<string, Record<string, string>> })?.seo;
  const existingFlat = { ...existingData, ...extractSeoForEditor(existingSeo, def) };

  // Generate the seven machine languages from the new English (best-effort) —
  // unless the admin explicitly asked to save without spending tokens yet.
  const skipTranslate = body.skipTranslate === true;
  const { warning } = skipTranslate
    ? {}
    : await applyMachineTranslations(def, data, existingFlat, undefined, targetSlug);

  // Fold the flat seo.* fields back into the nested per-locale data.seo.
  assembleSeo(data, existingSeo);

  const status = body.status === "published" || body.status === "draft" ? body.status : undefined;
  await saveByType(def.table, targetSlug, fixed, data, status);
  await logActivity({ actor: auth.session.email, action: "update", entity: type, ref: targetSlug, detail: status ? `الحالة: ${status}` : null });
  const deploy = await triggerDeploy();

  // Tell IndexNow the moment a live, indexable item changes. Best-effort.
  const effectiveStatus = status ?? existing.status;
  const scheduled = fixed.scheduled_at ? new Date(String(fixed.scheduled_at)).getTime() : 0;
  const isLive = effectiveStatus === "published" && !fixed.noindex && (!scheduled || scheduled <= Date.now());
  if (isLive) await pingIndexNow(contentUrls(type, targetSlug));

  return NextResponse.json({ ok: true, issues, translationWarning: warning, deploy, slug: targetSlug });
}

/** Delete a content item. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { type, slug } = await params;
  const def = contentType(type);
  if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });
  if (!(await getByType(def.table, slug))) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  await deleteByType(def.table, slug);
  await logActivity({ actor: auth.session.email, action: "delete", entity: type, ref: slug });
  const deploy = await triggerDeploy();
  return NextResponse.json({ ok: true, deploy });
}

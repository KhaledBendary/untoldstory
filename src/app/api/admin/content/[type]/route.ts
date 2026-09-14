import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { contentType } from "@/lib/admin/content-types";
import { getByType, createByType, logActivity } from "@/lib/db/repo";
import { validateField, hasErrors, type Dict } from "@/lib/content-validate";
import { applyMachineTranslations } from "@/lib/translate/apply";
import { assembleSeo } from "@/lib/admin/seo-fields";
import { triggerDeploy } from "@/lib/deploy";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Create a new item of a content type. The slug is its permanent identifier. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { type } = await params;
  const def = contentType(type);
  if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "المعرّف (slug) لازم يكون إنجليزي صغير وأرقام وشرطات، مثال: my-new-service" }, { status: 422 });
  }
  if (await getByType(def.table, slug)) {
    return NextResponse.json({ error: "المعرّف ده مستخدم قبل كده — اختار غيره" }, { status: 409 });
  }

  // Pull exactly this type's declared fields; validate (English required).
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

  // Generate the seven machine languages from the English (best-effort).
  const { warning } = await applyMachineTranslations(def, data, undefined);

  // Fold the flat seo.* fields into the nested per-locale data.seo.
  assembleSeo(data, undefined);

  const status = body.status === "published" ? "published" : "draft";
  await createByType(def.table, slug, fixed, data, status);
  await logActivity({ actor: auth.session.email, action: "create", entity: type, ref: slug, detail: `الحالة: ${status}` });
  // Only a published new item changes the live site; a draft doesn't need a build.
  const deploy = status === "published" ? await triggerDeploy() : { triggered: false as const };
  return NextResponse.json({ ok: true, slug, status, issues, translationWarning: warning, deploy });
}

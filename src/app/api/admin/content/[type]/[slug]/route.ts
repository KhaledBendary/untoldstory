import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { contentType } from "@/lib/admin/content-types";
import { getByType, saveByType } from "@/lib/db/repo";
import { validateField, hasErrors, type Dict } from "@/lib/content-validate";

/** Save any content type. Guarded, then validated against that type's fields. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { type, slug } = await params;
  const def = contentType(type);
  if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });
  if (!(await getByType(def.table, slug))) {
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

  await saveByType(def.table, slug, fixed, data);
  return NextResponse.json({ ok: true, issues });
}

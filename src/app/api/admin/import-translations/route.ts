import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { importLocaleData, logActivity } from "@/lib/db/repo";
import { triggerDeploy } from "@/lib/deploy";

export const runtime = "nodejs";

/**
 * Import a translation file (the "*-locales-import.json" format) into an item.
 * Shape:
 *   { service_slug|project_slug|post_slug: "...",
 *     translations: { <locale>: { title, short_desc, full_desc } } }
 * The source keys are mapped to each type's real data fields. English/Arabic and
 * any untouched languages are preserved.
 */
const TYPE_MAP: Record<string, { type: "services" | "projects" | "posts"; fields: Record<string, string> }> = {
  service_slug: { type: "services", fields: { title: "title", short_desc: "shortDesc", full_desc: "fullDesc" } },
  project_slug: { type: "projects", fields: { title: "title", short_desc: "shortDescription", full_desc: "description" } },
  post_slug: { type: "posts", fields: { title: "title", short_desc: "excerpt", full_desc: "body" } },
};

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const doc = await request.json().catch(() => null);
  if (!doc || typeof doc !== "object") {
    return NextResponse.json({ error: "الملف مش JSON صالح" }, { status: 400 });
  }

  const kindKey = Object.keys(TYPE_MAP).find((k) => typeof doc[k] === "string" && doc[k]);
  if (!kindKey) {
    return NextResponse.json({ error: "الملف لازم يحتوي على service_slug أو project_slug أو post_slug" }, { status: 422 });
  }
  const { type, fields } = TYPE_MAP[kindKey];
  const slug = String(doc[kindKey]);
  const translations = doc.translations;
  if (!translations || typeof translations !== "object") {
    return NextResponse.json({ error: "مفيش translations في الملف" }, { status: 422 });
  }

  // Build patch { dbField: { locale: value } } from the file's per-locale blocks.
  const patch: Record<string, Record<string, string>> = {};
  for (const [loc, vals] of Object.entries(translations as Record<string, Record<string, unknown>>)) {
    if (!vals || typeof vals !== "object") continue;
    for (const [srcKey, dbKey] of Object.entries(fields)) {
      const v = vals[srcKey];
      if (typeof v === "string" && v.trim()) {
        patch[dbKey] = patch[dbKey] || {};
        patch[dbKey][loc] = v;
      }
    }
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "مفيش أي نصوص صالحة في الملف" }, { status: 422 });
  }

  let result;
  try {
    result = await importLocaleData(type, slug, patch);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.startsWith("not-found")) {
      return NextResponse.json({ error: `مفيش عنصر بالمعرّف "${slug}" في ${type}` }, { status: 404 });
    }
    console.error("import-translations failed:", e);
    return NextResponse.json({ error: "حصل خطأ أثناء الاستيراد" }, { status: 500 });
  }

  await logActivity({
    actor: auth.session.email, action: "update", entity: type, ref: slug,
    detail: `استيراد ترجمة: ${result.applied} حقل [${result.locales.join(", ")}]`,
  });
  const deploy = await triggerDeploy();
  return NextResponse.json({ ok: true, type, slug, ...result, deploy });
}

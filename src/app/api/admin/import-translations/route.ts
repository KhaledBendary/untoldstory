import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { importLocaleData, logActivity } from "@/lib/db/repo";
import { triggerDeploy } from "@/lib/deploy";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Import translation file(s) — the "*-locales-import.json" format — into content.
 * Accepts a single item, or an array of items (many in one upload):
 *   { service_slug|project_slug|post_slug: "...",
 *     translations: { <locale>: { title, short_desc, full_desc } } }
 * Source keys map to each type's real data fields; English/Arabic and untouched
 * languages are preserved.
 */
const TYPE_MAP: Record<string, { type: "services" | "projects" | "posts"; fields: Record<string, string> }> = {
  service_slug: { type: "services", fields: { title: "title", short_desc: "shortDesc", full_desc: "fullDesc" } },
  project_slug: { type: "projects", fields: { title: "title", short_desc: "shortDescription", full_desc: "description" } },
  post_slug: { type: "posts", fields: { title: "title", short_desc: "excerpt", full_desc: "body" } },
};

type ItemResult = { slug: string; type?: string; ok: boolean; applied?: number; locales?: string[]; error?: string };

async function applyDoc(doc: unknown): Promise<ItemResult> {
  if (!doc || typeof doc !== "object") return { slug: "?", ok: false, error: "عنصر غير صالح" };
  const d = doc as Record<string, unknown>;
  const kindKey = Object.keys(TYPE_MAP).find((k) => typeof d[k] === "string" && d[k]);
  if (!kindKey) return { slug: "?", ok: false, error: "مفيش service_slug/project_slug/post_slug" };
  const { type, fields } = TYPE_MAP[kindKey];
  const slug = String(d[kindKey]);
  const translations = d.translations;
  if (!translations || typeof translations !== "object") return { slug, type, ok: false, error: "مفيش translations" };

  const patch: Record<string, Record<string, string>> = {};
  for (const [loc, vals] of Object.entries(translations as Record<string, Record<string, unknown>>)) {
    if (!vals || typeof vals !== "object") continue;
    for (const [srcKey, dbKey] of Object.entries(fields)) {
      const v = (vals as Record<string, unknown>)[srcKey];
      if (typeof v === "string" && v.trim()) {
        patch[dbKey] = patch[dbKey] || {};
        patch[dbKey][loc] = v;
      }
    }
  }
  if (Object.keys(patch).length === 0) return { slug, type, ok: false, error: "مفيش نصوص صالحة" };

  try {
    const r = await importLocaleData(type, slug, patch);
    return { slug, type, ok: true, applied: r.applied, locales: r.locales };
  } catch (e) {
    const msg = (e as Error).message;
    return { slug, type, ok: false, error: msg.startsWith("not-found") ? "العنصر مش موجود" : "خطأ في الحفظ" };
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body || (typeof body !== "object")) {
    return NextResponse.json({ error: "الملف مش JSON صالح" }, { status: 400 });
  }
  const docs = Array.isArray(body) ? body : [body];
  if (docs.length === 0) return NextResponse.json({ error: "الملف فاضي" }, { status: 422 });

  const results: ItemResult[] = [];
  for (const doc of docs) results.push(await applyDoc(doc));

  const okItems = results.filter((r) => r.ok);
  if (okItems.length) {
    await logActivity({
      actor: auth.session.email, action: "update", entity: "site", ref: "translations",
      detail: `استيراد ترجمة: ${okItems.length} عنصر (${okItems.map((r) => r.slug).join(", ")})`,
    });
  }
  const deploy = okItems.length ? await triggerDeploy() : { triggered: false as const };
  return NextResponse.json({
    ok: okItems.length > 0,
    total: results.length,
    succeeded: okItems.length,
    failed: results.length - okItems.length,
    results,
    deploy,
  });
}

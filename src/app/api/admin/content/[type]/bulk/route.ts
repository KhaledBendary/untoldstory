import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { contentType } from "@/lib/admin/content-types";
import { bulkSetStatus, bulkDelete, logActivity } from "@/lib/db/repo";
import { triggerDeploy } from "@/lib/deploy";

/** Apply one action to several items at once: publish | unpublish | delete. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { type } = await params;
  const def = contentType(type);
  if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const slugs: string[] = Array.isArray(body?.slugs) ? body.slugs.filter((s: unknown) => typeof s === "string") : [];
  const action = body?.action;
  if (!slugs.length) return NextResponse.json({ error: "مفيش عناصر مختارة" }, { status: 400 });

  if (action === "publish") await bulkSetStatus(def.table, slugs, "published");
  else if (action === "unpublish") await bulkSetStatus(def.table, slugs, "draft");
  else if (action === "delete") await bulkDelete(def.table, slugs);
  else return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });

  await logActivity({ actor: auth.session.email, action: action === "delete" ? "delete" : action === "publish" ? "publish" : "unpublish", entity: type, detail: `${slugs.length} عنصر (جماعي)` });
  const deploy = await triggerDeploy();
  return NextResponse.json({ ok: true, deploy });
}

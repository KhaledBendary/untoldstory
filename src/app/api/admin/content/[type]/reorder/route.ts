import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { contentType } from "@/lib/admin/content-types";
import { reorderByType } from "@/lib/db/repo";
import { triggerDeploy } from "@/lib/deploy";

/** Save a new display order for a content type (writes sort_order per slug). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { type } = await params;
  const def = contentType(type);
  if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });
  if (!def.orderable) return NextResponse.json({ error: "النوع ده مش قابل لإعادة الترتيب" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const slugs = body?.slugs;
  if (!Array.isArray(slugs) || slugs.some((s) => typeof s !== "string")) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  await reorderByType(def.table, slugs);
  const deploy = await triggerDeploy();
  return NextResponse.json({ ok: true, deploy });
}

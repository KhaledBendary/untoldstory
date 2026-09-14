import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { contentType } from "@/lib/admin/content-types";
import { getByType, duplicateByType } from "@/lib/db/repo";

/** Duplicate an item as a new draft with a free "-copy" slug. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { type, slug } = await params;
  const def = contentType(type);
  if (!def) return NextResponse.json({ error: "نوع غير معروف" }, { status: 404 });
  if (!(await getByType(def.table, slug))) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  // Find a slug that isn't taken: slug-copy, slug-copy-2, …
  let newSlug = `${slug}-copy`;
  for (let i = 2; await getByType(def.table, newSlug); i++) newSlug = `${slug}-copy-${i}`;

  await duplicateByType(def.table, slug, newSlug);
  return NextResponse.json({ ok: true, slug: newSlug });
}

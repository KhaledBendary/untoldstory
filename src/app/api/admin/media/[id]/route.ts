import { NextResponse, type NextRequest } from "next/server";
import { del } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-guard";
import { deleteMedia } from "@/lib/db/repo";

/** Remove an image: drop the row, then delete the blob it pointed at. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { id } = await params;
  const pathname = await deleteMedia(Number(id));
  if (!pathname) return NextResponse.json({ error: "غير موجودة" }, { status: 404 });

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) await del(pathname);
  } catch {
    // The row is gone; a leftover blob is harmless and can be swept later.
  }
  return NextResponse.json({ ok: true });
}

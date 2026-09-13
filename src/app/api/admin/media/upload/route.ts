import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-guard";
import { addMedia } from "@/lib/db/repo";

/**
 * Upload one image to Vercel Blob and record it.
 *
 * Only real images, capped at 8 MB. The blob is public (these are site images),
 * stored under media/ with a random suffix so two files of the same name can't
 * collide. The row we keep is what the gallery lists and the pickers reference.
 */
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "مخزن الصور مش متظبط بعد (BLOB_READ_WRITE_TOKEN)" }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "مفيش ملف" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "لازم صورة (JPG / PNG / WebP / SVG)" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "الصورة أكبر من 8 ميجا" }, { status: 413 });
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "-").toLowerCase();
  const blob = await put(`media/${safeName}`, file, { access: "public", addRandomSuffix: true });

  const row = await addMedia({
    url: blob.url,
    pathname: blob.pathname,
    filename: file.name,
    content_type: file.type,
    size_bytes: file.size,
  });

  return NextResponse.json({ ok: true, media: row });
}

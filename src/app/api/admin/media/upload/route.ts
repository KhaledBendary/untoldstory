import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin-guard";
import { addMedia } from "@/lib/db/repo";

/**
 * Upload one image to Vercel Blob and record it.
 *
 * Raster images (JPG/PNG/WebP/AVIF) are optimized on the way in: downscaled to
 * a sane max dimension and re-encoded to WebP, which typically cuts the stored
 * size by more than half with no visible loss and gives every page a modern
 * format. SVG (vector, no pixels to resize) and GIF (animation sharp would
 * flatten) are stored untouched. Capped at 12 MB of upload; the stored file is
 * usually far smaller.
 */
export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
const RASTER = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_DIMENSION = 2400; // px on the longest side — plenty for full-bleed hero images

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
    return NextResponse.json({ error: "الصورة أكبر من 12 ميجا" }, { status: 413 });
  }

  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^\w.\-]+/g, "-").toLowerCase() || "image";

  let bodyBuffer: Buffer;
  let contentType = file.type;
  let uploadName = file.name.replace(/[^\w.\-]+/g, "-").toLowerCase();
  let width: number | null = null;
  let height: number | null = null;

  if (RASTER.includes(file.type)) {
    // Optimize: downscale (never upscale) and re-encode to WebP.
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const pipeline = sharp(input, { failOn: "none" })
        .rotate() // honor EXIF orientation, then drop the tag
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 });
      const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
      bodyBuffer = data;
      contentType = "image/webp";
      uploadName = `${baseName}.webp`;
      width = info.width;
      height = info.height;
    } catch (e) {
      console.error("image optimization failed, storing original:", (e as Error).message);
      bodyBuffer = Buffer.from(await file.arrayBuffer());
    }
  } else {
    // SVG / GIF — store as uploaded.
    bodyBuffer = Buffer.from(await file.arrayBuffer());
  }

  const blob = await put(`media/${uploadName}`, bodyBuffer, {
    access: "public",
    addRandomSuffix: true,
    contentType,
  });

  const row = await addMedia({
    url: blob.url,
    pathname: blob.pathname,
    filename: uploadName,
    content_type: contentType,
    size_bytes: bodyBuffer.byteLength,
    width,
    height,
  });

  return NextResponse.json({ ok: true, media: row });
}

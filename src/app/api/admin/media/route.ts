import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getMedia } from "@/lib/db/repo";

/** List uploaded images, newest first — the source for the image picker. */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const media = await getMedia();
  return NextResponse.json({ items: media.map((m) => ({ id: m.id, url: m.url, filename: m.filename })) });
}

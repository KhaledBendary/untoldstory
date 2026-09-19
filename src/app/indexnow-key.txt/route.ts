import { NextResponse } from "next/server";

/**
 * Serves the IndexNow verification key as plain text.
 *
 * IndexNow proves site ownership by fetching a key file; we point at this fixed
 * location with the `keyLocation` field of every ping (see src/lib/indexnow.ts),
 * so the filename need not equal the key. The key lives in INDEXNOW_KEY and is
 * echoed here; when it's unset this returns 404 and IndexNow is effectively off.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(key, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}

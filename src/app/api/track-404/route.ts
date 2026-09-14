import { NextResponse, type NextRequest } from "next/server";
import { recordNotFound } from "@/lib/db/repo";

export const runtime = "nodejs";

/** Log a 404 so missing/broken URLs surface in the dashboard. No personal data. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path.slice(0, 400) : "";
  if (!path || !path.startsWith("/")) return NextResponse.json({ ok: false }, { status: 400 });
  const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 400) : null;
  try {
    await recordNotFound(path, referrer);
  } catch (e) {
    console.error("track-404 failed:", e);
  }
  return NextResponse.json({ ok: true });
}

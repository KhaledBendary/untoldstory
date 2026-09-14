import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { triggerDeploy, deployConfigured } from "@/lib/deploy";

/** Publish the site now — force a production rebuild from the current database. */
export async function POST() {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  if (!deployConfigured()) {
    return NextResponse.json({ error: "النشر مش متظبط بعد (VERCEL_DEPLOY_HOOK_URL)" }, { status: 503 });
  }

  const result = await triggerDeploy({ force: true });
  if (!result.triggered) {
    return NextResponse.json({ error: `تعذّر بدء النشر (${result.reason})` }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { triggerDeploy, deployConfigured } from "@/lib/deploy";
import { logActivity } from "@/lib/db/repo";

/** Publish the site now — force a production rebuild from the current database. */
export async function POST() {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  if (!deployConfigured()) {
    return NextResponse.json({ error: "النشر مش متظبط بعد (VERCEL_DEPLOY_HOOK_URL)" }, { status: 503 });
  }

  await logActivity({ actor: auth.session.email, action: "publish", entity: "site" });
  const result = await triggerDeploy({ force: true });
  if (!result.triggered) {
    return NextResponse.json({ error: `تعذّر بدء النشر (${result.reason})` }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

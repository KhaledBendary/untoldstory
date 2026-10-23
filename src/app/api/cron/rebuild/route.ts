import { NextResponse, type NextRequest } from "next/server";
import { dueScheduledCount } from "@/lib/db/repo";
import { triggerDeploy } from "@/lib/deploy";

export const runtime = "nodejs";

/**
 * Scheduled-publish worker. Vercel Cron calls this periodically; it rebuilds the
 * static site only when an item's scheduled time has just passed, so a scheduled
 * post/project appears without anyone doing anything. Cheap when nothing is due
 * (a single COUNT), and it never rebuilds needlessly.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Fail closed: an unset secret used to mean "skip the check", so anyone who
  // found this URL could force a production rebuild on demand. A missing
  // secret is a misconfiguration, not an invitation to run unauthenticated.
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const due = await dueScheduledCount().catch(() => 0);
  if (due > 0) {
    const r = await triggerDeploy({ force: true });
    return NextResponse.json({ due, rebuilt: r.triggered });
  }
  return NextResponse.json({ due: 0, rebuilt: false });
}

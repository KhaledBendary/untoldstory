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
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const due = await dueScheduledCount().catch(() => 0);
  if (due > 0) {
    const r = await triggerDeploy({ force: true });
    return NextResponse.json({ due, rebuilt: r.triggered });
  }
  return NextResponse.json({ due: 0, rebuilt: false });
}

import "server-only";
import { NextResponse } from "next/server";
import { currentSession } from "@/lib/admin-session";
import type { Session } from "@/lib/auth";

/**
 * Gate for the admin API routes. Returns the session, or a 401 the caller
 * returns as-is. Every write endpoint starts with this — the page guard alone
 * protects the screens, not the endpoints behind them.
 */
export async function requireAdmin(): Promise<
  { session: Session } | { session: null; response: NextResponse }
> {
  const session = await currentSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "غير مصرّح" }, { status: 401 }) };
  }
  return { session };
}

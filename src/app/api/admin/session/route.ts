import { NextResponse } from "next/server";
import { adminCount } from "@/lib/auth";
import { currentSession } from "@/lib/admin-session";

/**
 * What the login page needs to decide what to show: is there an account yet
 * (else offer first-run setup), and is this visitor already signed in.
 */
export async function GET() {
  const [count, session] = await Promise.all([adminCount(), currentSession()]);
  return NextResponse.json({
    hasAdmin: count > 0,
    authenticated: Boolean(session),
    email: session?.email ?? null,
  });
}

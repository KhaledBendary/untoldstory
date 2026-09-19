import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getMessages } from "@/lib/db/repo";

/** List contact-form submissions, newest first (optional ?status= filter). */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const status = request.nextUrl.searchParams.get("status") || undefined;
  const rows = await getMessages(status ?? undefined);
  return NextResponse.json({ items: rows });
}

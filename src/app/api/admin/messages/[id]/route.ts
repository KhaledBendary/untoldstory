import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { setMessageStatus, deleteMessage } from "@/lib/db/repo";

const STATUSES = ["new", "read", "replied", "archived"];

/** Change a message's status (new | read | replied | archived). */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
  }
  await setMessageStatus(Number(id), status);
  return NextResponse.json({ ok: true });
}

/** Delete a message permanently. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { id } = await params;
  await deleteMessage(Number(id));
  return NextResponse.json({ ok: true });
}

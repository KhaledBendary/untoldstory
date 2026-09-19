import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getRedirects, getNotFounds, addRedirect, deleteRedirect, clearNotFound, logActivity } from "@/lib/db/repo";
import { triggerDeploy } from "@/lib/deploy";

/** List the managed redirects and the logged 404s. */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;
  const [redirects, notFounds] = await Promise.all([getRedirects(), getNotFounds()]);
  return NextResponse.json({ redirects, notFounds });
}

/** Add or update a 301 redirect. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const body = await request.json().catch(() => null);
  const from = typeof body?.from === "string" ? body.from.trim() : "";
  const to = typeof body?.to === "string" ? body.to.trim() : "";
  if (!from.startsWith("/") || !to) {
    return NextResponse.json({ error: "لازم المسار القديم يبدأ بـ / وتحدد الوجهة" }, { status: 400 });
  }
  if (from === to) {
    return NextResponse.json({ error: "المسار القديم والجديد نفس الحاجة" }, { status: 400 });
  }

  await addRedirect(from, to);
  await logActivity({ actor: auth.session.email, action: "create", entity: "redirects", ref: from, detail: `→ ${to}` });
  const deploy = await triggerDeploy();
  return NextResponse.json({ ok: true, deploy });
}

/** Delete a redirect (by id) or dismiss a logged 404 (by path). */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const body = await request.json().catch(() => null);
  if (typeof body?.id === "number") {
    await deleteRedirect(body.id);
    await logActivity({ actor: auth.session.email, action: "delete", entity: "redirects", ref: String(body.id) });
    const deploy = await triggerDeploy();
    return NextResponse.json({ ok: true, deploy });
  }
  if (typeof body?.path === "string") {
    await clearNotFound(body.path);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
}

import { NextResponse, type NextRequest } from "next/server";
import { adminCount, createAdmin } from "@/lib/auth";
import { setSession } from "@/lib/admin-session";

/**
 * First-run: create the one admin account, but only while none exists. Once an
 * account is there this route refuses — nobody can add themselves later through
 * an open endpoint.
 */
export async function POST(request: NextRequest) {
  if ((await adminCount()) > 0) {
    return NextResponse.json({ error: "already-set-up" }, { status: 409 });
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "بريد إلكتروني غير صالح" }, { status: 422 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "كلمة السر لازم تكون 8 حروف على الأقل" }, { status: 422 });
  }

  const admin = await createAdmin(email, password);
  await setSession(admin.id, admin.email);
  return NextResponse.json({ ok: true, email: admin.email });
}

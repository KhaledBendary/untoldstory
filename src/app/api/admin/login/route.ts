import { NextResponse, type NextRequest } from "next/server";
import { findAdminByEmail, verifyPassword, touchLogin } from "@/lib/auth";
import { setSession } from "@/lib/admin-session";

/**
 * Sign in. A wrong email and a wrong password return the same message and take
 * a similar amount of time (verifyPassword runs even when the account is
 * missing, against a dummy hash), so the response can't be used to discover
 * which emails have accounts.
 */
const DUMMY_HASH =
  "0000000000000000000000000000000000000000000000000000000000000000:" +
  "0".repeat(128);

const attempts = new Map<string, { n: number; until: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const cur = attempts.get(ip);
  if (!cur || now > cur.until) { attempts.set(ip, { n: 1, until: now + 15 * 60_000 }); return false; }
  cur.n += 1;
  return cur.n > 10;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "محاولات كتير. استنى شوية." }, { status: 429 });
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 422 });
  }

  const admin = await findAdminByEmail(email);
  const ok = await verifyPassword(password, admin?.password_hash ?? DUMMY_HASH);
  if (!admin || !ok) {
    return NextResponse.json({ error: "البريد أو كلمة السر غير صحيحة" }, { status: 401 });
  }

  await setSession(admin.id, admin.email);
  await touchLogin(admin.id);
  return NextResponse.json({ ok: true, email: admin.email });
}

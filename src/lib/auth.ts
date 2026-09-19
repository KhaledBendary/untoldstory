import "server-only";
import { scrypt, randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { sql } from "@/lib/db/client";

/**
 * Dashboard authentication — passwords and sessions, no third-party library.
 *
 * Passwords: scrypt with a per-password random salt, stored as `salt:hash`.
 * scrypt is memory-hard and built into Node, so there is no dependency to keep
 * patched. Verification is constant-time.
 *
 * Sessions: a signed token `payload.signature`, HMAC-SHA256 over the payload
 * with ADMIN_SESSION_SECRET. Stateless — no session table — so logout is just
 * clearing the cookie, and a token stops being valid once it expires. The
 * cookie itself is httpOnly + secure + sameSite, set by the route handler.
 */

const scryptAsync = promisify(scrypt);
const SESSION_DAYS = 7;

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set");
  return s;
}

// ---- passwords ----

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// ---- sessions ----

const b64url = (s: string) => Buffer.from(s).toString("base64url");
const signPart = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export function createSessionToken(userId: number, email: string): string {
  const payload = b64url(JSON.stringify({
    uid: userId,
    email,
    exp: Date.now() + SESSION_DAYS * 86400_000,
  }));
  return `${payload}.${signPart(payload)}`;
}

export type Session = { uid: number; email: string; exp: number };

export function readSessionToken(token: string | undefined): Session | null {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = signPart(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (!session.exp || Date.now() > session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "gus_admin";
export const SESSION_MAX_AGE = SESSION_DAYS * 86400;

// ---- accounts ----

export async function adminCount(): Promise<number> {
  const [{ count }] = await sql<{ count: string }[]>`select count(*)::int as count from admin_users`;
  return Number(count);
}

export async function findAdminByEmail(email: string) {
  const [row] = await sql`
    select id, email, password_hash from admin_users where lower(email) = lower(${email})
  `;
  return row ?? null;
}

export async function createAdmin(email: string, password: string) {
  const password_hash = await hashPassword(password);
  const [row] = await sql`
    insert into admin_users (email, password_hash) values (${email}, ${password_hash})
    returning id, email
  `;
  return row;
}

export async function touchLogin(id: number) {
  await sql`update admin_users set last_login_at = now() where id = ${id}`;
}

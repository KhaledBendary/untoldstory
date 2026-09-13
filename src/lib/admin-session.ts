import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken, readSessionToken, type Session,
} from "@/lib/auth";

/**
 * The session cookie, in one place.
 *
 * httpOnly so client script can't read it, sameSite=lax so it rides normal
 * navigations but not cross-site POSTs, secure in production (skipped on
 * localhost, where there is no https and the flag would drop the cookie).
 */

export async function setSession(userId: number, email: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(userId, email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function currentSession(): Promise<Session | null> {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

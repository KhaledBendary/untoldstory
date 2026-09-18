/*
 * Shared Postgres connection for the migration and import scripts.
 *
 * Reads DATABASE_URL_UNPOOLED from .env.local — the non-pooled connection,
 * because schema changes (DDL) and bulk inserts run cleaner without pgbouncer
 * in front. The app itself uses the pooled URL; these one-off tools do not.
 */
import postgres from "postgres";
import { readFileSync } from "node:fs";

export function connect() {
  let env = "";
  try {
    env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  } catch {
    throw new Error(".env.local not found — cannot reach the database.");
  }
  const url =
    (env.match(/^DATABASE_URL_UNPOOLED=(.+)$/m) || [])[1]?.trim() ||
    (env.match(/^DATABASE_URL=(.+)$/m) || [])[1]?.trim();
  if (!url) throw new Error("No DATABASE_URL in .env.local");
  return postgres(url, { ssl: "require", onnotice: () => {} });
}

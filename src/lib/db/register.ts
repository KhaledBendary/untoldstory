import "server-only";
import * as source from "@/lib/db/source";

/**
 * Publish the database content-source on globalThis so api.ts can use it without
 * importing it (api.ts is also bundled for the browser, and the postgres driver
 * must never enter the client graph). This module is server-only and is imported
 * for its side effect from every server entry point that renders content — the
 * import runs before the module's generateStaticParams / generateMetadata / body,
 * so build-time prerendering reads the database too.
 *
 * Registration is skipped (leaving api.ts on Laravel) when the database isn't
 * configured or when CONTENT_SOURCE=laravel forces a rollback.
 */
const DB_KEY = Symbol.for("globaluntoldstory.content-db");
const scope = globalThis as unknown as Record<symbol, typeof source | undefined>;

const enabled =
  process.env.CONTENT_SOURCE !== "laravel" &&
  Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

if (enabled && !scope[DB_KEY]) {
  scope[DB_KEY] = source;
  if (process.env.NODE_ENV !== "production") {
    console.log("[content-db] registered — site reads from Postgres (Laravel is fallback)");
  }
}

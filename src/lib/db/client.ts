import "server-only";
import postgres from "postgres";

/**
 * The one Postgres connection the running app uses.
 *
 * Pooled URL (pgbouncer) because serverless invocations are many and short —
 * the non-pooled URL is only for the one-off migration scripts. Cached on
 * globalThis so hot-reload in dev and reused lambdas in prod don't open a new
 * pool every time.
 *
 * server-only: this module must never be bundled into client code — it holds
 * the database credentials.
 */

const KEY = Symbol.for("gus.postgres");

function create() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return postgres(url, {
    ssl: "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
    // Supabase's transaction pooler (and pgbouncer in general) doesn't support
    // prepared statements — disable them so the pooled connection works.
    prepare: false,
    onnotice: () => {},
  });
}

type Sql = ReturnType<typeof create>;
const store = globalThis as unknown as { [KEY]?: Sql };

export const sql: Sql = store[KEY] ?? (store[KEY] = create());

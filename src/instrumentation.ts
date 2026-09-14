/**
 * Runs once when a Next.js server instance boots (nodejs runtime only). It
 * registers the database content-source so route handlers and runtime renders
 * read from Postgres. Build-time prerendering is covered separately by a
 * side-effect import of the registrar in each server page module.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/lib/db/register");
  }
}

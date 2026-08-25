import { notFound } from "next/navigation";

/**
 * Catch-all so unmatched paths render the site's own 404 — with the nav,
 * footer and a way back — instead of Next's bare built-in page. Middleware
 * rewrites unprefixed URLs into this tree, so it covers both /nope and
 * /ar/nope.
 */
export default function CatchAll(): never {
  notFound();
}

import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

/** Header the root layout reads to set <html lang> and dir on the server. */
export const LOCALE_HEADER = "x-site-locale";

/**
 * Hosts that are not the real site.
 *
 * Every page canonicalises to globaluntoldstory.com, so a preview host serves
 * pages that point elsewhere — the exact "canonicalization" complaint a
 * scanner raises, and a genuine risk of the staging copy being crawled. Tell
 * robots to leave any non-production host alone.
 */
const PRODUCTION_HOST = "globaluntoldstory.com";

function isProductionHost(host: string | null) {
  if (!host) return false;
  const name = host.split(":")[0].toLowerCase();
  return name === PRODUCTION_HOST || name === `www.${PRODUCTION_HOST}` || name === "localhost";
}

function markNonProduction(response: NextResponse, request: NextRequest) {
  if (!isProductionHost(request.headers.get("host"))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first, ...rest] = pathname.split("/");

  // /en/services is a duplicate of /services — send it to the canonical form.
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = `/${rest.join("/")}` || "/";
    return markNonProduction(NextResponse.redirect(url, 308), request);
  }

  if (isLocale(first)) {
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, first);
    return markNonProduction(NextResponse.next({ request: { headers } }), request);
  }

  // Unprefixed: serve the English tree without changing the visible URL, so
  // already-indexed addresses keep working exactly as they are.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, DEFAULT_LOCALE);
  return markNonProduction(NextResponse.rewrite(url, { request: { headers } }), request);
}

export const config = {
  matcher: [
    // Everything except Next internals, the API proxy, and public files.
    "/((?!_next/|api/|images/|favicon|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)",
  ],
};

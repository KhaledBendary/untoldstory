import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";
import { legacyDestination } from "@/lib/legacy-redirects";

/** Header the root layout reads to set <html lang> and dir on the server. */
export const LOCALE_HEADER = "x-site-locale";

const PRODUCTION_HOST = "globaluntoldstory.com";
const WWW_HOST = `www.${PRODUCTION_HOST}`;
const WP_QUERY_KEYS = ["page_id", "p", "attachment_id", "cat", "tag", "paged"];

function hostname(host: string | null) {
  return (host || "").split(":")[0].toLowerCase();
}

function isProductionHost(host: string | null) {
  const name = hostname(host);
  return name === PRODUCTION_HOST || name === WWW_HOST || name === "localhost";
}

function markNonProduction(response: NextResponse, request: NextRequest) {
  if (!isProductionHost(request.headers.get("host"))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export function middleware(request: NextRequest) {
  const host = hostname(request.headers.get("host"));
  const { pathname } = request.nextUrl;
  const params = request.nextUrl.searchParams;

  const dropWww = host === WWW_HOST;
  const trailingSlash = pathname.length > 1 && pathname.endsWith("/");
  const stripped = trailingSlash ? pathname.slice(0, -1) : pathname;
  const legacy = legacyDestination(stripped);
  const stripWpQuery = WP_QUERY_KEYS.some((key) => params.has(key));
  const indexPhp = stripped === "/index.php" || stripped === "/index.html";

  if (dropWww || legacy || trailingSlash || stripWpQuery || indexPhp) {
    const url = request.nextUrl.clone();
    if (dropWww) {
      url.hostname = PRODUCTION_HOST;
      url.protocol = "https:";
      url.port = "";
    }
    url.pathname = legacy || (indexPhp ? "/" : stripped);
    if (stripWpQuery) {
      for (const key of WP_QUERY_KEYS) url.searchParams.delete(key);
      if (url.pathname === "/index.php" || url.pathname === "/index.html") url.pathname = "/";
    }
    return markNonProduction(NextResponse.redirect(url, 301), request);
  }

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

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, DEFAULT_LOCALE);
  return markNonProduction(NextResponse.rewrite(url, { request: { headers } }), request);
}

export const config = {
  matcher: [
    /*
     * Run on WordPress leftovers (.php, .html, wp-sitemap.xml) so they 301
     * instead of matching [locale] and serving a duplicate homepage.
     * Skip real static assets only.
     */
    "/((?!_next/|api/|images/|favicon|robots.txt|sitemap.xml|.*\\.(?:ico|png|jpe?g|gif|webp|svg|avif|woff2?|ttf|eot|css|js|map|mp4|webm|txt|json|pdf)$).*)",
  ],
};

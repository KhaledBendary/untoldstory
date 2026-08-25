import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

/** Header the root layout reads to set <html lang> and dir on the server. */
export const LOCALE_HEADER = "x-site-locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first, ...rest] = pathname.split("/");

  // /en/services is a duplicate of /services — send it to the canonical form.
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = `/${rest.join("/")}` || "/";
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(first)) {
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, first);
    return NextResponse.next({ request: { headers } });
  }

  // Unprefixed: serve the English tree without changing the visible URL, so
  // already-indexed addresses keep working exactly as they are.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, DEFAULT_LOCALE);
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: [
    // Everything except Next internals, the API proxy, and public files.
    "/((?!_next/|api/|images/|favicon|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)",
  ],
};

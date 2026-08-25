/**
 * Locale routing.
 *
 * English stays unprefixed (`/services`) so every URL that is already indexed
 * keeps its address and its ranking; the other locales live under a prefix
 * (`/ar/services`). Middleware rewrites unprefixed paths onto the English
 * segment, so there is exactly one route tree.
 */

export const LOCALE_CODES = [
  "en", "ar", "de", "es", "fr", "it", "pt",
  "tr", "ru", "zh", "ja", "ko", "pl", "sw",
] as const;

export type Locale = (typeof LOCALE_CODES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * Locales built ahead of time.
 *
 * All of them: a page generated on first request can be read mid-generation by
 * a crawler arriving at the same moment, and the upstream API is only safe to
 * walk at build volume because the client now caps concurrency, caches
 * responses, retries with backoff and falls back to list data. Prerendering
 * everything removes the cold-render window entirely.
 */
export const PRERENDER_LOCALES: readonly Locale[] = LOCALE_CODES;

/** BCP-47 tags for hreflang and <html lang>. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en", ar: "ar", de: "de", es: "es", fr: "fr", it: "it", pt: "pt",
  tr: "tr", ru: "ru", zh: "zh", ja: "ja", ko: "ko", pl: "pl", sw: "sw",
};

export const RTL_LOCALES: ReadonlySet<string> = new Set(["ar"]);

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALE_CODES as readonly string[]).includes(value);
}

export function localeDir(locale: string): "ltr" | "rtl" {
  return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}

/** Public path for a route in a given locale. English carries no prefix. */
export function localizedPath(path: string, locale: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean || "/";
  return `/${locale}${clean}`;
}

/**
 * `alternates` for a route: a self-canonical plus one hreflang entry per
 * locale and an x-default pointing at English.
 */
export function alternatesFor(path: string, locale: string) {
  const languages: Record<string, string> = {};
  for (const code of LOCALE_CODES) {
    languages[LOCALE_TAGS[code]] = localizedPath(path, code);
  }
  languages["x-default"] = localizedPath(path, DEFAULT_LOCALE);

  return {
    canonical: localizedPath(path, locale),
    languages,
  };
}

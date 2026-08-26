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
 * Locales that have real translated bodies and should be indexed.
 * The rest stay routable (switcher, middleware) but are noindex until
 * their CMS copy exists — otherwise Google indexes English duplicates.
 */
export const INDEXABLE_LOCALES: readonly Locale[] = ["en", "ar"];

export function isIndexableLocale(locale: string): locale is Locale {
  return (INDEXABLE_LOCALES as readonly string[]).includes(locale);
}

/**
 * Locales built ahead of time. Only indexable languages are prerendered so a
 * crawler never receives a cold English shell at /de or /zh.
 */
export const PRERENDER_LOCALES: readonly Locale[] = INDEXABLE_LOCALES;

/** BCP-47 tags for hreflang and <html lang>. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en", ar: "ar", de: "de", es: "es", fr: "fr", it: "it", pt: "pt",
  tr: "tr", ru: "ru", zh: "zh", ja: "ja", ko: "ko", pl: "pl", sw: "sw",
};

/** Open Graph `og:locale` tags (underscore form). */
export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US", ar: "ar_SA", de: "de_DE", es: "es_ES", fr: "fr_FR", it: "it_IT",
  pt: "pt_PT", tr: "tr_TR", ru: "ru_RU", zh: "zh_CN", ja: "ja_JP", ko: "ko_KR",
  pl: "pl_PL", sw: "sw_KE",
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
  for (const code of INDEXABLE_LOCALES) {
    languages[LOCALE_TAGS[code]] = localizedPath(path, code);
  }
  languages["x-default"] = localizedPath(path, DEFAULT_LOCALE);

  return {
    canonical: localizedPath(path, locale),
    languages,
  };
}

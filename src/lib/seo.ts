/**
 * Shared SEO helpers.
 *
 * The CMS stores headlines as a single all-caps string that merges the service
 * name with its tagline ("PRODUCTION SERVICES IN EGYPT FOR INTERNATIONAL CREWS
 * LOCAL KNOWLEDGE. INTERNATIONAL PRODUCTION STANDARDS."), and mirrors the body
 * copy straight into seo.metaDescription. Both overflow what search engines
 * display, so everything that reaches <title> or <meta name="description">
 * goes through here first.
 */

import type { Metadata } from "next";
import { alternatesFor, DEFAULT_LOCALE, isIndexableLocale, isLocale, localizedPath, OG_LOCALES, type Locale } from "@/lib/i18n";

export const SITE_URL = "https://globaluntoldstory.com";
export const BRAND = "Global Untold Story";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

/** Words that stay uppercase when we de-shout a headline. */
const ACRONYMS = new Set([
  "TV", "CGI", "VFX", "AI", "IP", "UAE", "KSA", "MENA", "EMPC", "UGC",
  "HD", "4K", "8K", "VR", "AR", "OTT", "B2B", "B2C", "PR", "CEO", "DOP",
  "ADR", "VO", "SEO", "ROI", "ILO", "ADNOC", "USA", "UK", "EU",
]);

/** Lowercase inside a title unless they land first. */
const MINOR_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into",
  "nor", "of", "on", "or", "the", "to", "with",
]);

/**
 * Words allowed to trail the last slug match — "COMMERCIAL PHOTOGRAPHY" is the
 * name, but "COMMERCIAL PHOTOGRAPHY SERVICES" is the name as people write it.
 */
const NAME_SUFFIXES = new Set([
  "services", "service", "production", "productions", "film", "films",
  "video", "content", "studio", "agency", "development", "coverage",
]);

/** Slug words that carry no signal when locating the end of a name. */
const SLUG_STOPWORDS = new Set(["and", "the", "for", "of", "in", "on", "a", "an"]);

const wordKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

function isAllCaps(value: string) {
  const letters = value.replace(/[^A-Za-z]/g, "");
  return letters.length > 3 && letters === letters.toUpperCase();
}

function toTitleCase(value: string) {
  const parts = value.toLowerCase().split(/(\s+|[/–—-])/);
  return parts
    .map((token, index) => {
      if (!/[a-z]/i.test(token)) return token;
      const key = wordKey(token);
      if (ACRONYMS.has(key.toUpperCase())) return token.replace(/[a-z]+/i, key.toUpperCase());
      if (index > 0 && MINOR_WORDS.has(key)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join("");
}

/**
 * The CMS glues the tagline onto the name with no delimiter, but every word of
 * the slug lives in the name — so the last word matching a slug token marks
 * where the name ends and the tagline begins.
 */
function trimTagline(value: string, slug?: string) {
  if (!slug) return value;

  const slugTokens = slug
    .split(/[-_/]/)
    .map(wordKey)
    .filter((token) => token.length > 1 && !SLUG_STOPWORDS.has(token));
  if (!slugTokens.length) return value;

  const words = value.split(/\s+/);
  let lastMatch = -1;
  words.forEach((word, index) => {
    const key = wordKey(word);
    if (!key) return;
    const hit = slugTokens.some((token) => {
      if (key === token) return true;
      // Allow a short stem gap so "SHOWS" answers to "show", but keep tokens
      // of three characters or fewer exact — "AI" must not match "AIRPORT".
      if (token.length <= 3 || key.length <= 3) return false;
      const [long, short] = key.length >= token.length ? [key, token] : [token, key];
      return long.startsWith(short) && long.length - short.length <= 2;
    });
    if (hit) lastMatch = index;
  });
  if (lastMatch < 0) return value;

  let end = lastMatch;
  while (end + 1 < words.length && NAME_SUFFIXES.has(wordKey(words[end + 1]))) end += 1;
  return words.slice(0, end + 1).join(" ");
}

/** Cut at the last whole word that fits, so nothing ends mid-word. */
function clampWords(value: string, max: number) {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = Math.max(cut.lastIndexOf(" "), cut.lastIndexOf("،"));
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—–-]+$/, "");
}

/** Clamp a finished title that already includes the brand suffix. */
export function clampTitle(value: string) {
  return clampWords(plainText(value), TITLE_MAX);
}

/** Strip HTML, markdown leftovers and collapse whitespace. */
export function plainText(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\*\*|__|[*_`>#]/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Turn a CMS headline into something that fits a SERP: drop the tagline the
 * CMS glued on after the first sentence, de-shout it, and keep it short.
 */
export function cleanHeadline(raw?: string | null, slug?: string) {
  let value = plainText(raw);
  if (!value) return "";

  const shouted = isAllCaps(value);

  // A full stop always ends the name; cut there before hunting for the
  // tagline, so words repeated later in the tagline can't drag the cut right.
  const firstStop = value.indexOf(". ");
  if (firstStop > 12) value = value.slice(0, firstStop);

  // Translated records separate name from tagline with a colon rather than
  // running them together ("مرحلة ما بعد الإنتاج: التصوير يلتقط…"), so the
  // slug heuristic below — which only sees English words — never fires there.
  const colon = value.search(/[:：]/);
  if (colon > 10) value = value.slice(0, colon);

  value = value.replace(/[\s.:،,—–-]+$/, "").trim();

  if (shouted) value = trimTagline(value, slug);

  if (shouted) value = toTitleCase(value);
  return value;
}

/**
 * Page title, brand suffix included only when it still fits inside the
 * ~60 characters Google renders.
 */
export function buildTitle(raw?: string | null, slug?: string, fallback = BRAND) {
  // Same guard as buildDescription: a title of question marks is worse than
  // the slug-derived fallback.
  const name = cleanHeadline(isUnreadable(raw) ? undefined : raw, slug) || fallback;
  const suffix = ` | ${BRAND}`;
  if (name === BRAND) return name;
  if (name.length + suffix.length <= TITLE_MAX) return name + suffix;
  return clampWords(name, TITLE_MAX);
}

/**
 * Meta description clamped to 155 characters, preferring a sentence boundary
 * so a trimmed description still reads as a finished thought.
 */
/**
 * CMS text that lost its encoding, and now reads as a run of "?".
 *
 * Three Arabic portfolio records ship descriptions that are entirely question
 * marks, and they were going out as the meta description — the one line Google
 * shows under the result. A description in the wrong language is poor; a
 * description of literal punctuation is worse, so treat unreadable text as
 * absent and let the caller's fallback stand.
 *
 * This hides the damage, it does not repair it: the Arabic text has to be
 * re-entered in the CMS.
 */
export function isUnreadable(value?: unknown): value is string {
  return typeof value === "string" && /\?{3,}/.test(value);
}

/**
 * CMS excerpts are sometimes the first paragraph of the body, cut wherever the
 * paragraph happened to end — "Pre-production is the foundation. It is where
 * we:" was going out as the meta description in eight languages. A line that
 * stops on a colon promises a list Google has no room to print, so cut back to
 * the last finished sentence, and if too little survives use the fallback.
 */
function endOnASentence(value: string) {
  if (!/[:;,]\s*$/.test(value)) return value;
  const trimmed = value.replace(/[\s:;,]+$/, "");
  const stop = Math.max(trimmed.lastIndexOf(". "), trimmed.lastIndexOf("! "), trimmed.lastIndexOf("? "));
  const kept = stop > 0 ? trimmed.slice(0, stop + 1) : trimmed;
  return kept.length >= 40 ? kept : "";
}

export function buildDescription(raw?: string | null, fallback = "") {
  const cleaned = isUnreadable(raw) ? "" : endOnASentence(plainText(raw));
  const value = cleaned || plainText(fallback);
  if (!value) return "";
  if (value.length <= DESCRIPTION_MAX) return value;

  const window = value.slice(0, DESCRIPTION_MAX);
  const lastStop = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
  if (lastStop > DESCRIPTION_MAX * 0.6) return window.slice(0, lastStop + 1);
  return `${clampWords(value, DESCRIPTION_MAX - 1)}…`;
}

/** The CMS ships an untyped `seo` bag on most records. Read it safely. */
export function cmsSeo(seo?: Record<string, unknown> | null) {
  const read = (key: string) => (typeof seo?.[key] === "string" ? (seo[key] as string) : undefined);
  return {
    metaTitle: read("metaTitle"),
    metaDescription: read("metaDescription"),
    ogImageUrl: read("ogImageUrl"),
  };
}

export function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Breadcrumb trail for a detail page, e.g. Home › Services › Post Production. */
export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Prepare CMS rich text for rendering inside a page that already has an <h1>.
 *
 * Editors paste content whose headings start at h1 — one German service body
 * carried thirty-two of them, so that page shipped thirty-three <h1> elements
 * and no clear main heading at all. Shift every heading down one level so the
 * page title stays the single h1 and the body keeps its own hierarchy.
 */
export function demoteHeadings(html?: string | null) {
  if (!html) return "";
  return html.replace(/<(\/?)h([1-5])\b/gi, (_match, slash: string, level: string) => {
    return `<${slash}h${Math.min(Number(level) + 1, 6)}`;
  });
}

/**
 * Strip anything executable out of CMS rich text.
 *
 * `service.fullDesc` and `post.body` are rendered with
 * `dangerouslySetInnerHTML`, so whatever an editor pastes — or whatever an
 * attacker stores if the CMS is ever compromised — runs on this origin. The
 * page CSP cannot save us here, because a statically prerendered Next app has
 * to allow inline script for its own hydration payload. So the markup is
 * cleaned at the point it enters the page.
 *
 * Allowlisting tags would be safer still, but that needs a real parser; this
 * removes the vectors that actually execute: script/style/embed elements,
 * inline event handlers, and javascript: / data: URLs on links.
 */
export function sanitizeCmsHtml(html?: string | null) {
  if (!html) return "";
  return html
    // Elements that execute or load code, with their contents.
    .replace(/<(script|style|iframe|object|embed|applet|link|meta|form|base)\b[\s\S]*?<\/\1\s*>/gi, "")
    // …and the self-closing or unterminated versions of the same.
    .replace(/<(script|style|iframe|object|embed|applet|link|meta|form|base)\b[^>]*>/gi, "")
    // onclick=, onerror=, onload= … in quoted or bare form.
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    // javascript:, vbscript: and data: URLs in href/src/action.
    .replace(/\s(href|src|action|formaction)\s*=\s*"\s*(?:javascript|vbscript|data)\s*:[^"]*"/gi, "")
    .replace(/\s(href|src|action|formaction)\s*=\s*'\s*(?:javascript|vbscript|data)\s*:[^']*'/gi, "")
    // srcdoc smuggles a whole document into an element.
    .replace(/\ssrcdoc\s*=\s*("[^"]*"|'[^']*')/gi, "");
}

/** Sanitise CMS rich text and demote its headings in one pass. */
export function renderCmsHtml(html?: string | null) {
  return demoteHeadings(sanitizeCmsHtml(html));
}

export const DEFAULT_OG_IMAGE = "/images/on-ground-production-giza.jpg";

type PageSeoInput = {
  path: string;
  locale: string;
  title: string;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
};

/**
 * Full per-route metadata. Every page must call this (or spread it) so a
 * missing field cannot inherit the layout's homepage canonical / og:url.
 */
export function pageSeo({
  path,
  locale,
  title,
  description,
  image,
  type = "website",
  publishedTime,
}: PageSeoInput): Metadata {
  const safeTitle = clampTitle(title) || BRAND;
  const desc = buildDescription(description, safeTitle);
  const url = absoluteUrl(localizedPath(path, locale));
  const img = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const indexable = isIndexableLocale(locale);
  return {
    title: { absolute: safeTitle },
    description: desc,
    alternates: alternatesFor(path, locale),
    robots: indexable
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      title: safeTitle,
      description: desc,
      url,
      siteName: BRAND,
      locale: OG_LOCALES[(isLocale(locale) ? locale : DEFAULT_LOCALE) as Locale],
      type,
      images: [{ url: img, width: 1200, height: 630, alt: safeTitle }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: safeTitle,
      description: desc,
      images: [img],
    },
  };
}

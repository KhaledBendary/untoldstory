import { DEFAULT_LOCALE, isLocale, localizedPath } from "@/lib/i18n";

/**
 * WordPress and pre-CMS Next slugs that still collect Google hits.
 * Keys are unprefixed, lowercase, no trailing slash.
 */
const PAGE_ALIASES: Record<string, string> = {
  "/about-us": "/about",
  "/aboutus": "/about",
  "/who-we-are": "/about",
  "/our-story": "/about",
  "/contact-us": "/contact",
  "/contactus": "/contact",
  "/get-a-quote": "/contact",
  "/get-quote": "/contact",
  "/our-work": "/work",
  "/our-portfolio": "/work",
  "/portfolio": "/work",
  "/portfolios": "/work",
  "/projects": "/work",
  "/blog": "/insights",
  "/news": "/insights",
  "/articles": "/insights",
  "/our-services": "/services",
  "/service": "/services",
  "/index.php": "/",
  "/index.html": "/",
  "/home": "/",
  "/sitemap_index.xml": "/sitemap.xml",
  "/wp-sitemap.xml": "/sitemap.xml",
  "/production-journey": "/insights/the-video-production-journey-from-idea-to-impact",
  "/brand-storytelling": "/insights/why-every-brand-needs-a-story-that-moves-people",
  "/how-to-choose-a-media-production-agency-in-egypt": "/insights/how-to-choose-a-media-production-agency-in-egypt",
  "/professional-film-production-equipment": "/insights/professional-film-production-equipment",
  "/corporate-video-production-in-cairo-what-every-brand-needs-to-know": "/insights/corporate-video-production-in-cairo",
  "/tv-commercial-production-in-egypt-complete-guide-2026": "/insights/tv-commercial-production-in-egypt",
};

export const SERVICE_SLUG_ALIASES: Record<string, string> = {
  "on-ground-production-services-in-egypt": "on-ground-egypt",
  "on-ground-production": "on-ground-egypt",
  "on-ground-production-services-egypt": "on-ground-egypt",
  "line-production-egypt": "on-ground-egypt",
  "commercial": "commercial-video-production",
  "commercial-advertising": "commercial-video-production",
  "commercial-advertising-production": "commercial-video-production",
  "documentary": "documentary-production-egypt",
  "documentary-production": "documentary-production-egypt",
  "corporate-content": "corporate-video-production-egypt",
  "corporate-industrial-content": "corporate-video-production-egypt",
  "corporate-video": "corporate-video-production-egypt",
  "event-coverage": "event-production-live-streaming-egypt",
  "event-coverage-live-production": "event-production-live-streaming-egypt",
  "tv-live-production": "tv-show-production-live-broadcast",
  "tv-show-production": "tv-show-production-live-broadcast",
  "post-production-finishing": "post-production",
  "motion-cgi-ai": "motion-graphics-cgi-vfx-ai",
  "motion-cgi": "motion-graphics-cgi-vfx-ai",
  "dubbing-voice-over": "dubbing-voice-over-localization",
  "dubbing-localization": "dubbing-voice-over-localization",
  "photography": "commercial-photography",
  "performance-marketing": "performance-marketing-creative-strategy",
  "marketing-solutions": "performance-marketing-creative-strategy",
  "original-ip": "original-ip-development",
};

export const POST_SLUG_ALIASES: Record<string, string> = {
  "production-journey": "the-video-production-journey-from-idea-to-impact",
  "the-video-production-journey-from-idea-to-impact": "the-video-production-journey-from-idea-to-impact",
  "brand-storytelling": "why-every-brand-needs-a-story-that-moves-people",
  "why-every-brand-needs-a-story-that-moves-people": "why-every-brand-needs-a-story-that-moves-people",
  "media-production-agency-in-egypt": "how-to-choose-a-media-production-agency-in-egypt",
  "how-to-choose-a-media-production-agency-in-egypt": "how-to-choose-a-media-production-agency-in-egypt",
  "film-production-in-egypt": "professional-film-production-equipment",
  "professional-film-production-equipment": "professional-film-production-equipment",
  "corporate-video-production-in-cairo-what-every-brand-needs-to-know": "corporate-video-production-in-cairo",
  "tv-commercial-production-in-egypt-complete-guide-2026": "tv-commercial-production-in-egypt",
};

function stripSlash(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

function splitLocale(pathname: string) {
  const clean = stripSlash(pathname.toLowerCase()) || "/";
  const [, first, ...rest] = clean.split("/");
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    const bare = `/${rest.join("/")}` || "/";
    return { locale: first, bare: stripSlash(bare) };
  }
  return { locale: DEFAULT_LOCALE, bare: clean };
}

function mapBare(bare: string): string | null {
  if (PAGE_ALIASES[bare]) return PAGE_ALIASES[bare];
  // Old service pages that lived at the site root, not under /service/.
  if (SERVICE_ALIASES[bare]) return SERVICE_ALIASES[bare];

  if (/^\/(category|tag|author)(\/|$)/.test(bare)) return "/insights";
  if (/^\/(feed|comments\/feed)(\/|$)/.test(bare)) return "/insights";
  if (/^\/blog\/page\/\d+$/.test(bare)) return "/insights";
  if (/^\/page\/\d+$/.test(bare)) return "/";

  const serviceMatch = bare.match(/^\/(?:service|services)\/([^/]+)$/);
  if (serviceMatch) {
    const slug = SERVICE_SLUG_ALIASES[serviceMatch[1]];
    if (slug) return `/services/${slug}`;
    if (bare.startsWith("/service/")) return `/services/${serviceMatch[1]}`;
  }

  const postMatch = bare.match(/^\/(?:insights|blog|article)\/([^/]+)$/);
  if (postMatch) {
    const mapped = POST_SLUG_ALIASES[postMatch[1]];
    if (mapped && mapped !== postMatch[1]) return `/insights/${mapped}`;
    if (bare.startsWith("/blog/") || bare.startsWith("/article/")) {
      return `/insights/${mapped || postMatch[1]}`;
    }
  }

  if (bare === "/media-production-agency-in-egypt") {
    return "/insights/how-to-choose-a-media-production-agency-in-egypt";
  }

  return null;
}

/**
 * Permanent destination for a legacy public path, or null if the URL is current.
 */
/**
 * Service pages under their pre-CMS slugs.
 *
 * The CMS renamed every service when the site moved, and Google still holds
 * the old addresses — an SEO review found /tv-shows-live-broadcast-production
 * and /ai-powered-cgi among the URLs it had discovered. Each maps to the
 * closest current service rather than to /services, because a redirect that
 * lands on a list makes the visitor start their search again.
 *
 * Right-hand values are live slugs from /api/v1/services; changing one there
 * means changing it here.
 */
const SERVICE_ALIASES: Record<string, string> = {
  "/on-ground-production": "/services/on-ground-egypt",
  "/on-ground-production-services-egypt": "/services/on-ground-egypt",
  "/line-production-egypt": "/services/on-ground-egypt",
  "/production-services-egypt": "/services/on-ground-egypt",
  "/fixer-egypt": "/services/on-ground-egypt",

  "/commercial-advertising": "/services/commercial-video-production",
  "/tv-commercial-production-in-egypt": "/services/commercial-video-production",
  "/advertising-production": "/services/commercial-video-production",

  "/documentary-production": "/services/documentary-production-egypt",
  "/documentary": "/services/documentary-production-egypt",

  "/corporate-industrial-content": "/services/corporate-video-production-egypt",
  "/corporate-video-production-in-cairo": "/services/corporate-video-production-egypt",
  "/corporate-video": "/services/corporate-video-production-egypt",

  "/event-coverage-live-production": "/services/event-production-live-streaming-egypt",
  "/event-coverage": "/services/event-production-live-streaming-egypt",
  "/live-streaming": "/services/event-production-live-streaming-egypt",

  "/tv-live-production": "/services/tv-show-production-live-broadcast",
  "/tv-shows-live-broadcast-production": "/services/tv-show-production-live-broadcast",

  "/podcast": "/services/podcast-production",
  "/video-podcast": "/services/podcast-production",

  "/post-production-finishing": "/services/post-production",
  "/post": "/services/post-production",

  "/motion-cgi-ai": "/services/motion-graphics-cgi-vfx-ai",
  "/motion-cgi": "/services/motion-graphics-cgi-vfx-ai",
  "/ai-powered-cgi": "/services/motion-graphics-cgi-vfx-ai",
  "/vfx": "/services/motion-graphics-cgi-vfx-ai",

  "/dubbing-voice-over": "/services/dubbing-voice-over-localization",
  "/localization": "/services/dubbing-voice-over-localization",
  "/voice-over": "/services/dubbing-voice-over-localization",

  "/photography": "/services/commercial-photography",
  "/commercial-photography-services": "/services/commercial-photography",

  "/performance-marketing": "/services/performance-marketing-creative-strategy",
  "/marketing-solutions": "/services/performance-marketing-creative-strategy",

  "/original-ip": "/services/original-ip-development",
  "/ip-development": "/services/original-ip-development",
};

export function legacyDestination(pathname: string): string | null {
  const { locale, bare } = splitLocale(pathname);
  const mapped = mapBare(bare);
  if (!mapped) return null;
  const dest = locale === DEFAULT_LOCALE ? mapped : localizedPath(mapped, locale);
  return dest === stripSlash(pathname) ? null : dest;
}

export const POST_SLUGS_THAT_REDIRECT = new Set(
  Object.entries(POST_SLUG_ALIASES)
    .filter(([from, to]) => from !== to)
    .map(([from]) => from),
);

/** Old WordPress/fallback slug and the current CMS slug for the same record. */
export function relatedServiceSlugs(slug: string): string[] {
  const out = new Set([slug]);
  for (const [from, to] of Object.entries(SERVICE_SLUG_ALIASES)) {
    if (from === slug || to === slug) {
      out.add(from);
      out.add(to);
    }
  }
  return [...out];
}

export function relatedPostSlugs(slug: string): string[] {
  const out = new Set([slug]);
  for (const [from, to] of Object.entries(POST_SLUG_ALIASES)) {
    if (from === slug || to === slug) {
      out.add(from);
      out.add(to);
    }
  }
  return [...out];
}

function uniqueSlugParams(slugs: Iterable<string>) {
  return [...new Set(slugs)].filter(Boolean).map((slug) => ({ slug }));
}

/** Prerender every slug Google or the sitemap might still request. */
export function serviceStaticParams(apiSlugs: string[] = [], fallbackSlugs: string[] = []) {
  return uniqueSlugParams([
    ...apiSlugs,
    ...fallbackSlugs,
    ...Object.keys(SERVICE_SLUG_ALIASES),
    ...Object.values(SERVICE_SLUG_ALIASES),
  ]);
}

export function postStaticParams(apiSlugs: string[] = [], fallbackSlugs: string[] = []) {
  return uniqueSlugParams([
    ...apiSlugs,
    ...fallbackSlugs,
    ...Object.keys(POST_SLUG_ALIASES),
    ...Object.values(POST_SLUG_ALIASES),
  ]);
}

import { DEFAULT_LOCALE, decodeSlug, isLocale, localizedPath } from "@/lib/i18n";
import slugDictionary from "@/data/slug-dictionary.json";

type CatalogItem = { canonicalSlug: string; slugs: Record<string, string> };

const { pathRedirects, slugAliases, catalog } = slugDictionary as {
  pathRedirects: Record<string, string>;
  slugAliases: Record<string, string>;
  catalog: Record<string, CatalogItem[]>;
};

const slugMap = new Map<string, { section: string; canonicalSlug: string; slugs: Record<string, string> }>();

for (const section of ["services", "work", "insights"]) {
  const items = catalog[section] || [];
  for (const item of items) {
    slugMap.set(item.canonicalSlug.toLowerCase(), { section, canonicalSlug: item.canonicalSlug, slugs: item.slugs });
    for (const s of Object.values(item.slugs)) {
      if (s) {
        slugMap.set(String(s).toLowerCase(), { section, canonicalSlug: item.canonicalSlug, slugs: item.slugs });
      }
    }
  }
}

for (const [alias, canonical] of Object.entries(slugAliases)) {
  const target = slugMap.get(canonical.toLowerCase());
  if (target) {
    slugMap.set(alias.toLowerCase(), target);
  }
}

export function resolveDetailPath(bare: string, targetLocale: string): string | null {
  const clean = bare.replace(/\/$/, "");
  const decoded = decodeSlug(clean);
  const match = decoded.match(/^\/(services|service|work|insights|blog|article)\/([^/?#]+)$/i);
  if (!match) return null;

  const sectionRaw = match[1].toLowerCase();
  const slug = match[2].toLowerCase();

  const sectionMap: Record<string, string> = {
    service: "services",
    services: "services",
    work: "work",
    insights: "insights",
    blog: "insights",
    article: "insights",
  };
  const section = sectionMap[sectionRaw] || sectionRaw;

  const item = slugMap.get(slug);
  if (!item) return null;

  const destSlug = targetLocale === DEFAULT_LOCALE ? item.canonicalSlug : (item.slugs[targetLocale] || item.canonicalSlug);
  return localizedPath(`/${section}/${destSlug}`, targetLocale);
}

/**
 * WordPress and pre-CMS Next slugs that still collect Google hits.
 * Keys are unprefixed, lowercase, no trailing slash.
 */
const PAGE_ALIASES: Record<string, string> = {
  "/about-us": "/about",
  "/aboutus": "/about",
  "/who-we-are": "/about",
  "/our-story": "/about",
  "/about-me": "/about",
  "/team": "/about",
  "/our-team": "/about",
  "/contact-us": "/contact",
  "/contactus": "/contact",
  "/get-a-quote": "/contact",
  "/get-quote": "/contact",
  "/our-work": "/work",
  "/our-portfolio": "/work",
  "/portfolio": "/work",
  "/portfolios": "/work",
  "/projects": "/work",
  "/portfolio-category": "/work",
  "/blog": "/insights",
  "/blogs": "/insights",
  "/news": "/insights",
  "/articles": "/insights",
  "/our-services": "/services",
  "/service": "/services",
  "/service-category": "/services",
  "/index.php": "/",
  "/index.html": "/",
  "/home": "/",
  "/landing-page": "/",
  "/sitemap_index.xml": "/sitemap.xml",
  "/wp-sitemap.xml": "/sitemap.xml",
  "/page-sitemap.xml": "/sitemap.xml",
  "/pxl-template-sitemap.xml": "/sitemap.xml",
  "/service-sitemap.xml": "/sitemap.xml",
  "/production-journey": "/insights/the-video-production-journey-from-idea-to-impact",
  "/brand-storytelling": "/insights/why-every-brand-needs-a-story-that-moves-people",
  "/how-to-choose-a-media-production-agency-in-egypt": "/insights/how-to-choose-a-media-production-agency-in-egypt",
  "/professional-film-production-equipment": "/insights/film-production-in-egypt",
  "/corporate-video-production-in-cairo-what-every-brand-needs-to-know": "/insights/corporate-video-production-in-cairo",
  "/tv-commercial-production-in-egypt-complete-guide-2026": "/insights/tv-commercial-production-in-egypt",
  "/afkar-studio-tasweer": "/insights",
  "/افكار-استديو-تصوير": "/insights",
  "/شركة-إنتاج-إعلانات-في-مصر": "/services/commercial-video-production",
  "/أفضل-شركة-تصوير-ومونتاج-في-الرياض": "/services/commercial-video-production",
  "/أفضل-شركة-إنتاج-إعلامي-في-مصر": "/about",
  "/افضل-شركة-انتاج-اعلامي-في-مصر": "/about",
  "/أفضل-شركة-إنتاج-تلفزيوني-في-مصر": "/services/tv-show-production-live-broadcast",
  "/إنتاج-فيديو-شركات-في-مصر": "/services/corporate-video-production-egypt",
  "/إنتاج-فيديو-صناعي-في-مصر": "/services/corporate-video-production-egypt",
  "/تواصل-معنا": "/contact",
  "/real-estate-films": "/services/commercial-video-production",
  "/pre-productions": "/services/on-ground-egypt",
  "/locations": "/services/on-ground-egypt",
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
  "film-production-in-egypt": "film-production-in-egypt",
  "professional-film-production-equipment": "film-production-in-egypt",
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
  const cleanPath = stripSlash(pathname);
  const decodedPath = decodeSlug(cleanPath).toLowerCase();

  // 1. Direct path redirects (from DB redirects table)
  if (pathRedirects[cleanPath.toLowerCase()]) {
    return pathRedirects[cleanPath.toLowerCase()];
  }
  if (pathRedirects[decodedPath]) {
    return pathRedirects[decodedPath];
  }

  const { locale, bare } = splitLocale(pathname);
  const decodedBare = decodeSlug(bare);

  // 2. Direct page aliases
  const mapped = mapBare(bare) || mapBare(decodedBare);
  if (mapped) {
    const dest = locale === DEFAULT_LOCALE ? mapped : localizedPath(mapped, locale);
    return dest === cleanPath || dest === decodedPath ? null : dest;
  }

  // 3. Cross-locale detail path resolution
  const resolved = resolveDetailPath(decodedBare, locale);
  if (resolved) {
    return resolved === cleanPath || resolved === decodedPath ? null : resolved;
  }

  return null;
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

/**
 * Prerender current CMS pages only. Legacy slugs are redirected by proxy
 * before they reach this route, so building them would only ask the CMS for
 * records it intentionally no longer has and produce misleading 404 logs.
 */
export function serviceStaticParams(apiSlugs: string[] = [], fallbackSlugs: string[] = []) {
  return uniqueSlugParams([
    ...apiSlugs.map((slug) => SERVICE_SLUG_ALIASES[slug] || slug),
    ...fallbackSlugs.map((slug) => SERVICE_SLUG_ALIASES[slug] || slug),
    ...Object.values(SERVICE_SLUG_ALIASES),
  ]);
}

export function postStaticParams(apiSlugs: string[] = [], fallbackSlugs: string[] = []) {
  return uniqueSlugParams([
    ...apiSlugs.map((slug) => POST_SLUG_ALIASES[slug] || slug),
    ...fallbackSlugs.map((slug) => POST_SLUG_ALIASES[slug] || slug),
    ...Object.values(POST_SLUG_ALIASES),
  ]);
}

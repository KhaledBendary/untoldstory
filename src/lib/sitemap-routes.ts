import type { BlogPost, PortfolioItem, Service } from "@/types/api";
import { getInsightsData, getWorkData, getServicesData } from "@/lib/page-data";
import { POST_SLUG_ALIASES, SERVICE_SLUG_ALIASES } from "@/lib/legacy-redirects";
import { INDEXABLE_LOCALES, LOCALE_TAGS, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";

/**
 * The set of real, indexable routes, gathered once.
 *
 * Shared by the sitemap index and the per-language sitemaps so the two can
 * never disagree about what exists — a split sitemap whose parts drift from
 * the whole is worse than a single file.
 */

export type SitemapRoute = {
  path: string;
  lastModified?: Date;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function collectRoutes(): Promise<SitemapRoute[]> {
  const services: (Service | { slug: string })[] = await getServicesData();
  const projects: (PortfolioItem | { slug: string })[] = await getWorkData();
  const posts: (BlogPost | { slug: string; date?: string; publishedAt?: string })[] = await getInsightsData();

  // Slugs the CMS renamed still arrive from the API under the old name; list
  // the destination, never the alias, or the sitemap advertises a redirect.
  const serviceSlugs = [...new Set(services.map((s) => SERVICE_SLUG_ALIASES[s.slug] || s.slug))];
  const postEntries = [...new Map(
    posts.map((post) => {
      const slug = POST_SLUG_ALIASES[post.slug] && POST_SLUG_ALIASES[post.slug] !== post.slug
        ? POST_SLUG_ALIASES[post.slug]
        : post.slug;
      return [slug, { ...post, slug }];
    }),
  ).values()];

  const newestPost = posts
    .map((p) => parseDate("publishedAt" in p ? p.publishedAt : undefined) ?? parseDate("date" in p ? p.date : undefined))
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/services", changeFrequency: "monthly", priority: 0.8 },
    { path: "/work", changeFrequency: "monthly", priority: 0.8 },
    // The index genuinely changes when its newest article does.
    { path: "/insights", lastModified: newestPost, changeFrequency: "monthly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    // Low priority, but they must be listed: search engines and the ad
    // platforms both look for a reachable, indexed privacy policy.
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },

    ...serviceSlugs.map((slug): SitemapRoute => ({ path: `/services/${slug}`, changeFrequency: "monthly", priority: 0.8 })),
    ...projects.map((p): SitemapRoute => ({ path: `/work/${p.slug}`, changeFrequency: "monthly", priority: 0.7 })),
    ...postEntries.map((post): SitemapRoute => ({
      path: `/insights/${post.slug}`,
      lastModified:
        parseDate("publishedAt" in post ? post.publishedAt : undefined) ??
        parseDate("date" in post ? post.date : undefined),
      changeFrequency: "yearly",
      priority: 0.6,
    })),
  ];
}

/**
 * One sitemap per indexable language, each at its own static address:
 * /sitemap-en.xml, /sitemap-ar.xml. A file per locale rather than one dynamic
 * /sitemaps/[locale]/sitemap.xml route, because a dynamic segment followed by
 * a literal `sitemap.xml` segment gets neither prerendered from
 * generateStaticParams nor registered as a dynamic route — the build emits a
 * lone `/sitemaps/-/sitemap.xml` placeholder and every real locale 404s in
 * production, while `next start` hides it. Static paths have no such corner.
 *
 * Every <url> carries the full hreflang cluster, so the alternates stay intact
 * whichever file Google reads first. seo:audit fails if an indexable locale has
 * no route file, so the set here cannot silently fall behind INDEXABLE_LOCALES.
 */

export function localeSitemapPath(locale: string) {
  return `/sitemap-${locale}.xml`;
}

// The pages give Next a relative canonical and it resolves "/" against
// metadataBase down to a bare "https://globaluntoldstory.com". The sitemap has
// to name the identical string, or it advertises a URL the page itself does not
// claim as canonical.
function absolute(path: string, locale: string) {
  return `${SITE_URL}${localizedPath(path, locale)}`.replace(/\/$/, "");
}

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function buildLocaleSitemap(locale: string) {
  const routes = await collectRoutes();

  const urls = routes.map((route) => {
    const loc = absolute(route.path, locale);
    const alternates = INDEXABLE_LOCALES.map(
      (code) =>
        `    <xhtml:link rel="alternate" hreflang="${LOCALE_TAGS[code]}" href="${xmlEscape(absolute(route.path, code))}"/>`,
    ).join("\n");

    return [
      "  <url>",
      `    <loc>${xmlEscape(loc)}</loc>`,
      route.lastModified ? `    <lastmod>${route.lastModified.toISOString()}</lastmod>` : null,
      `    <changefreq>${route.changeFrequency}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      alternates,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(absolute(route.path, DEFAULT_LOCALE))}"/>`,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

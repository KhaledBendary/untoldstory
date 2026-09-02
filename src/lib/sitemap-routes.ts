import type { BlogPost, PortfolioItem, Service } from "@/types/api";
import { getInsightsData, getWorkData, getServicesData } from "@/lib/page-data";
import { POST_SLUG_ALIASES, SERVICE_SLUG_ALIASES } from "@/lib/legacy-redirects";

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

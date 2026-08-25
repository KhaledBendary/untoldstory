import type { MetadataRoute } from "next";
import type { BlogPost, PortfolioItem, Service } from "@/types/api";
import { SITE_URL } from "@/lib/seo";
import { getInsightsData, getWorkData, getServicesData } from "@/lib/page-data";
import { LOCALE_CODES, LOCALE_TAGS, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";

/**
 * Only emit lastModified when the CMS actually knows when something changed.
 * Stamping every URL with the build time makes the whole field worthless —
 * Google ignores a lastmod that moves in lockstep across an entire sitemap.
 */
function entry(
  path: string,
  options: { lastModified?: Date; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number },
): MetadataRoute.Sitemap[number] {
  const { lastModified, ...rest } = options;

  // One <url> per route listing every language as an alternate, so Google can
  // see the whole cluster instead of treating the translations as strays.
  const languages: Record<string, string> = {};
  for (const code of LOCALE_CODES) {
    languages[LOCALE_TAGS[code]] = `${SITE_URL}${localizedPath(path, code)}`;
  }
  languages["x-default"] = `${SITE_URL}${localizedPath(path, DEFAULT_LOCALE)}`;

  return {
    url: `${SITE_URL}${localizedPath(path, DEFAULT_LOCALE)}`,
    ...rest,
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  };
}

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services: (Service | { slug: string })[] = await getServicesData();
  const projects: (PortfolioItem | { slug: string })[] = await getWorkData();
  const posts: (BlogPost | { slug: string; date?: string; publishedAt?: string })[] = await getInsightsData();

  const newestPost = posts
    .map((post) => parseDate("publishedAt" in post ? post.publishedAt : undefined) ?? parseDate("date" in post ? post.date : undefined))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return [
    entry("", { changeFrequency: "weekly", priority: 1 }),
    entry("/services", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/work", { changeFrequency: "monthly", priority: 0.8 }),
    // The index genuinely changes when its newest article does.
    entry("/insights", { lastModified: newestPost, changeFrequency: "monthly", priority: 0.8 }),
    entry("/about", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/contact", { changeFrequency: "monthly", priority: 0.8 }),

    ...services.map((service) => entry(`/services/${service.slug}`, { changeFrequency: "monthly", priority: 0.8 })),
    ...projects.map((project) => entry(`/work/${project.slug}`, { changeFrequency: "monthly", priority: 0.7 })),
    ...posts.map((post) =>
      entry(`/insights/${post.slug}`, {
        lastModified:
          parseDate("publishedAt" in post ? post.publishedAt : undefined) ??
          parseDate("date" in post ? post.date : undefined),
        changeFrequency: "yearly",
        priority: 0.6,
      }),
    ),
  ];
}

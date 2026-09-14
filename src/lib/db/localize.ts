import "server-only";
import type { ServiceRow, ProjectRow, PostRow, Singleton } from "@/lib/db/repo";

/**
 * Turn a database row into the exact shape the Laravel API used to return for
 * one locale — so the site's components, which were written against that shape,
 * need no changes. A missing language falls back to English (the source), which
 * matches how the site already treated untranslated locales.
 */

type Dict = Record<string, string> | undefined;
const pick = (d: Dict, loc: string): string => d?.[loc] ?? d?.en ?? "";
// Laravel emitted null (not "") for empty optional fields; mirror that so the
// shape is identical and the site's `value || fallback` checks behave the same.
const pickN = (d: Dict, loc: string): string | null => d?.[loc] ?? d?.en ?? null;
const pickArr = (d: Record<string, unknown> | undefined, loc: string): unknown[] => {
  const v = d?.[loc] ?? d?.en;
  return Array.isArray(v) ? v : [];
};

export function localizeService(r: ServiceRow, loc: string) {
  const d = r.data;
  const seo = (d.seo as Record<string, unknown>)?.[loc] ?? (d.seo as Record<string, unknown>)?.en;
  return {
    id: r.slug,
    slug: r.slug,
    icon: r.icon ?? "",
    imageUrl: r.image_url ?? "",
    price: r.price ?? "",
    isFeatured: r.is_featured,
    title: pick(d.title, loc),
    shortDesc: pick(d.shortDesc, loc),
    fullDesc: pick(d.fullDesc, loc),
    features: pickArr(d.features as Record<string, unknown> | undefined, loc),
    // Only present once SEO has been authored, so services without it stay
    // byte-identical to what the old API returned.
    ...(seo ? { seo } : {}),
  };
}

export function localizeProject(r: ProjectRow, loc: string) {
  const d = r.data;
  return {
    slug: r.slug,
    title: pick(d.title, loc),
    shortDescription: pickN(d.shortDescription, loc),
    description: pickN(d.description, loc),
    client: pickN(d.client, loc),
    image: r.image ?? null,
    video: r.video ?? null,
    videoEmbed: r.video_embed ?? null,
    videoType: r.video_type ?? null,
    category: pickN(d.category, loc),
    categorySlug: r.category_slug ?? null,
    duration: r.duration ?? null,
    budget: r.budget ?? null,
    results: pickN(d.results, loc),
    metric: pickN(d.metric, loc),
    gridSize: r.grid_size ?? null,
    isFeatured: r.is_featured,
  };
}

/** Blog list item — the shape Laravel's /blog returned (no body, no seo). */
export function localizePostCard(r: PostRow, loc: string) {
  const d = r.data;
  const published = r.published_at ? new Date(r.published_at).toISOString() : null;
  return {
    id: r.slug,
    slug: r.slug,
    title: pick(d.title, loc),
    excerpt: pickN(d.excerpt, loc),
    date: published,
    publishedAt: published,
    category: pickN(d.category, loc),
    categorySlug: r.category_slug ?? null,
    authorName: r.author_name ?? null,
    authorImage: r.author_image ?? null,
    featuredImage: r.featured_image ?? null,
    readTimeMinutes: r.read_minutes ?? null,
    tags: r.tags ?? [],
    isFeatured: r.is_featured,
  };
}

/** Blog detail — the card plus the article body and per-locale seo. */
export function localizePost(r: PostRow, loc: string) {
  const seo = d_seo(r, loc);
  return {
    ...localizePostCard(r, loc),
    body: pick(r.data.body, loc),
    ...(seo ? { seo } : {}),
  };
}

function d_seo(r: PostRow, loc: string): Record<string, unknown> | null {
  const seo = r.data.seo as Record<string, unknown> | undefined;
  return (seo?.[loc] as Record<string, unknown>) ?? (seo?.en as Record<string, unknown>) ?? null;
}

/** A singleton is stored as { en: doc, ar: doc, … }; return one locale's doc. */
export function localizeSingleton(doc: Singleton | null, loc: string): Record<string, unknown> {
  if (!doc) return {};
  return (doc[loc] as Record<string, unknown>) ?? (doc.en as Record<string, unknown>) ?? {};
}

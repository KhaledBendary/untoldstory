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
// data.slugs (generated alongside translation — see translate/apply.ts) holds a
// per-locale slug; a locale without one yet falls back to the row's own
// canonical slug rather than to English's slug, since English IS the canonical.
// English itself always uses the real canonical slug column, never
// data.slugs.en: the column is the actual identity/URL an admin may have set
// by hand (e.g. via the slug-rename feature) independent of the title, and a
// title-derived slug could silently diverge from it after a later translation
// run touched an unrelated field.
const pickSlug = (slugs: Dict, loc: string, canonical: string): string =>
  loc === "en" ? canonical : slugs?.[loc] || canonical;
// Laravel emitted null (not "") for empty optional fields; mirror that so the
// shape is identical and the site's `value || fallback` checks behave the same.
const pickN = (d: Dict, loc: string): string | null => d?.[loc] ?? d?.en ?? null;
const pickArr = (d: Record<string, unknown> | undefined, loc: string): unknown[] => {
  const v = d?.[loc] ?? d?.en;
  return Array.isArray(v) ? v : [];
};

// Per-locale seo object, merged with a custom OG image column when set.
function seoWith(seoDoc: unknown, loc: string, ogImage: string | null): Record<string, unknown> | undefined {
  const doc = seoDoc as Record<string, unknown> | undefined;
  const base = (doc?.[loc] ?? doc?.en) as Record<string, unknown> | undefined;
  if (ogImage) return { ...(base ?? {}), ogImageUrl: ogImage };
  return base;
}

export function localizeService(r: ServiceRow, loc: string) {
  const d = r.data;
  const seo = seoWith(d.seo, loc, r.og_image);
  const slug = pickSlug(d.slugs, loc, r.slug);
  return {
    id: slug,
    slug,
    // The full per-locale map, for building correct hreflang/sitemap links to
    // every OTHER locale's own slug — not just this call's single locale. Plus
    // the real canonical (English) slug regardless of which locale this call
    // resolved, since a locale with no translated slug yet must fall back to
    // that — not to whatever locale THIS call happened to be for.
    slugs: d.slugs ?? {},
    canonicalSlug: r.slug,
    icon: r.icon ?? "",
    imageUrl: r.image_url ?? "",
    price: r.price ?? "",
    isFeatured: r.is_featured,
    noindex: r.noindex,
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
  const seo = seoWith(d.seo, loc, r.og_image);
  return {
    slug: pickSlug(d.slugs, loc, r.slug),
    slugs: d.slugs ?? {},
    canonicalSlug: r.slug,
    title: pick(d.title, loc),
    noindex: r.noindex,
    ...(seo ? { seo } : {}),
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
  const slug = pickSlug(d.slugs, loc, r.slug);
  return {
    id: slug,
    slug,
    slugs: d.slugs ?? {},
    canonicalSlug: r.slug,
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
  const seo = seoWith(r.data.seo, loc, r.og_image);
  return {
    ...localizePostCard(r, loc),
    noindex: r.noindex,
    body: pick(r.data.body, loc),
    ...(seo ? { seo } : {}),
  };
}

/** A singleton is stored as { en: doc, ar: doc, … }; return one locale's doc. */
export function localizeSingleton(doc: Singleton | null, loc: string): Record<string, unknown> {
  if (!doc) return {};
  return (doc[loc] as Record<string, unknown>) ?? (doc.en as Record<string, unknown>) ?? {};
}

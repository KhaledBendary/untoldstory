import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostDetail from "@/components/pages/PostDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { isLocale, localizedPath, PRERENDER_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { findPostAnyLocale, postDetailWithFallback } from "@/lib/page-data";
import { POSTS as FALLBACK_POSTS } from "@/data/content";
import { postStaticParams, relatedPostSlugs } from "@/lib/legacy-redirects";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline, cmsSeo, pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Known slugs are prerendered; remaining CMS/legacy slugs still render on demand. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await slugList();
  return PRERENDER_LOCALES.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

async function slugList() {
  try {
    const blogData = await api.getBlogPosts({ page: 1, per_page: 50 });
    return postStaticParams(
      blogData.items.map((post) => post.slug),
      FALLBACK_POSTS.map((p) => p.slug),
    );
  } catch (e) {
    console.error("Error fetching blog posts for generateStaticParams:", e instanceof Error ? e.message : e);
    return postStaticParams([], FALLBACK_POSTS.map((p) => p.slug));
  }
}

function postMeta(path: string, locale: string, title: string, description: string, image?: string | null, publishedTime?: string) {
  return applySeoOverrides(path, pageSeo({ path, locale, title, description, image, type: "article", publishedTime }), locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const path = `/insights/${slug}`;
  const fallbackTitle = buildTitle(slug.replace(/-/g, " "), slug);

  try {
    const post = await api.getBlogPostBySlug(slug, locale);
    const meta = cmsSeo(post.seo as Record<string, unknown> | undefined);
    return postMeta(path, locale, buildTitle(meta.metaTitle || post.title, slug), buildDescription(meta.metaDescription || post.excerpt, post.title), meta.ogImageUrl || post.featuredImage, post.publishedAt);
  } catch (e) {
    console.error("Error fetching post for metadata:", e);
    const live = await findPostAnyLocale(slug, locale);
    if (live) {
      return postMeta(path, locale, buildTitle(live.title, slug), buildDescription(live.excerpt, live.title), live.featuredImage, live.publishedAt);
    }

    const post = FALLBACK_POSTS.find((item) => relatedPostSlugs(slug).includes(item.slug));
    if (!post) return postMeta(path, locale, fallbackTitle, fallbackTitle);

    return postMeta(path, locale, buildTitle(post.title, slug), buildDescription(post.excerpt, post.title), post.image, post.date);
  }
}

export default async function Page({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  let name = "";
  let schema;
  const publisher = {
    "@type": "Organization",
    name: "Global Untold Story",
    logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo-white.png") },
  };

  try {
    const post = await api.getBlogPostBySlug(slug, locale);
    name = cleanHeadline(post.title, slug);
    schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: name,
      description: buildDescription(post.excerpt, post.title),
      datePublished: post.publishedAt,
      image: post.featuredImage || "",
      mainEntityOfPage: absoluteUrl(localizedPath(`/insights/${slug}`, locale)),
      author: { "@type": "Organization", name: "Global Untold Story" },
      publisher,
    };
  } catch (e) {
    console.error("Error fetching post for page:", e);
    const live = await findPostAnyLocale(slug, locale);
    const post = live ?? FALLBACK_POSTS.find((item) => relatedPostSlugs(slug).includes(item.slug));
    if (post) {
      name = cleanHeadline(post.title, slug);
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: name,
        description: buildDescription(post.excerpt, post.title),
        datePublished: live ? live.publishedAt : (post as { date: string }).date,
        image: live ? (live.featuredImage || "") : absoluteUrl((post as { image: string }).image),
        mainEntityOfPage: absoluteUrl(localizedPath(`/insights/${slug}`, locale)),
        author: { "@type": "Organization", name: "Global Untold Story" },
        publisher,
      };
    }
  }

  const initialData = await postDetailWithFallback(slug, locale);
  if (initialData?.status === "notFound") notFound();

  const crumbs = breadcrumbSchema([
    { name: "Insights", path: localizedPath("/insights", locale) },
    ...(name ? [{ name, path: localizedPath(`/insights/${slug}`, locale) }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [schema, crumbs] : [crumbs]} />
    <PostDetail slug={slug} initialData={initialData} initialLocale={locale} />
  </>;
}

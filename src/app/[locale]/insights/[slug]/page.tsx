import type { Metadata } from "next";
import PostDetail from "@/components/pages/PostDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { alternatesFor, isLocale, localizedPath, PRERENDER_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { getPostDetailData, findPostAnyLocale, safeFetch, postDetailWithFallback } from "@/lib/page-data";
import { POSTS as FALLBACK_POSTS } from "@/data/content";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline, cmsSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = await slugList();
  return PRERENDER_LOCALES.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

async function slugList() {
  try {
    const blogData = await api.getBlogPosts({ page: 1, per_page: 50 });
    return blogData.items.map((post) => ({ slug: post.slug }));
  } catch (e) {
    console.error("Error fetching blog posts for generateStaticParams:", e);
    return FALLBACK_POSTS.map(({ slug }) => ({ slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  // Never return {} — that inherits the root canonical ("/") and deindexes the page.
  const canonical = { alternates: alternatesFor(`/insights/${slug}`, locale) };

  try {
    const post = await api.getBlogPostBySlug(slug, locale);
    const meta = cmsSeo(post.seo as Record<string, unknown> | undefined);
    const title = buildTitle(meta.metaTitle || post.title, slug);
    const description = buildDescription(meta.metaDescription || post.excerpt, post.title);
    const image = meta.ogImageUrl || post.featuredImage;
    return applySeoOverrides(`/insights/${slug}`, {
      title: { absolute: title },
      description,
      ...canonical,
      openGraph: {
        title, description,
        images: image ? [image] : [],
        type: "article",
        url: absoluteUrl(localizedPath(`/insights/${slug}`, locale)),
        publishedTime: post.publishedAt,
      },
    }, locale);
  } catch (e) {
    console.error("Error fetching post for metadata:", e);
    const live = await findPostAnyLocale(slug, locale);
    if (live) {
      const title = buildTitle(live.title, slug);
      const description = buildDescription(live.excerpt, live.title);
      return applySeoOverrides(`/insights/${slug}`, {
        title: { absolute: title },
        description,
        ...canonical,
        openGraph: {
          title, description,
          images: live.featuredImage ? [live.featuredImage] : [],
          type: "article",
          url: absoluteUrl(localizedPath(`/insights/${slug}`, locale)),
          publishedTime: live.publishedAt,
        },
      }, locale);
    }

    const post = FALLBACK_POSTS.find((item) => item.slug === slug);
    if (!post) return applySeoOverrides(`/insights/${slug}`, canonical, locale);

    const title = buildTitle(post.title, slug);
    const description = buildDescription(post.excerpt, post.title);
    return applySeoOverrides(`/insights/${slug}`, {
      title: { absolute: title },
      description,
      ...canonical,
      openGraph: {
        title, description,
        images: [post.image],
        type: "article",
        url: absoluteUrl(localizedPath(`/insights/${slug}`, locale)),
        publishedTime: post.date,
      },
    }, locale);
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
    const post = live ?? FALLBACK_POSTS.find((item) => item.slug === slug);
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

  const crumbs = breadcrumbSchema([
    { name: "Insights", path: localizedPath("/insights", locale) },
    ...(name ? [{ name, path: localizedPath(`/insights/${slug}`, locale) }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [schema, crumbs] : [crumbs]} />
    <PostDetail slug={slug} initialData={initialData} initialLocale={locale} />
  </>;
}

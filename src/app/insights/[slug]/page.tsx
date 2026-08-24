import type { Metadata } from "next";
import PostDetail from "@/components/pages/PostDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { getPostDetailData, safeFetch } from "@/lib/page-data";
import { POSTS as FALLBACK_POSTS } from "@/data/content";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline, cmsSeo } from "@/lib/seo";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const blogData = await api.getBlogPosts({ page: 1, per_page: 50 });
    return blogData.items.map((post) => ({ slug: post.slug }));
  } catch (e) {
    console.error("Error fetching blog posts for generateStaticParams:", e);
    return FALLBACK_POSTS.map(({ slug }) => ({ slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Never return {} — that inherits the root canonical ("/") and deindexes the page.
  const canonical = { alternates: { canonical: `/insights/${slug}` } };

  try {
    const post = await api.getBlogPostBySlug(slug);
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
        url: absoluteUrl(`/insights/${slug}`),
        publishedTime: post.publishedAt,
      },
    });
  } catch (e) {
    console.error("Error fetching post for metadata:", e);
    const post = FALLBACK_POSTS.find((item) => item.slug === slug);
    if (!post) return applySeoOverrides(`/insights/${slug}`, canonical);

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
        url: absoluteUrl(`/insights/${slug}`),
        publishedTime: post.date,
      },
    });
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let name = "";
  let schema;
  const publisher = {
    "@type": "Organization",
    name: "Global Untold Story",
    logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo-white.png") },
  };

  try {
    const post = await api.getBlogPostBySlug(slug);
    name = cleanHeadline(post.title, slug);
    schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: name,
      description: buildDescription(post.excerpt, post.title),
      datePublished: post.publishedAt,
      image: post.featuredImage || "",
      mainEntityOfPage: absoluteUrl(`/insights/${slug}`),
      author: { "@type": "Organization", name: "Global Untold Story" },
      publisher,
    };
  } catch (e) {
    console.error("Error fetching post for page:", e);
    const post = FALLBACK_POSTS.find((item) => item.slug === slug);
    if (post) {
      name = cleanHeadline(post.title, slug);
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: name,
        description: buildDescription(post.excerpt, post.title),
        datePublished: post.date,
        image: absoluteUrl(post.image),
        mainEntityOfPage: absoluteUrl(`/insights/${slug}`),
        author: { "@type": "Organization", name: "Global Untold Story" },
        publisher,
      };
    }
  }

  const initialData = await safeFetch(() => getPostDetailData(slug, DEFAULT_LOCALE), "post:" + slug);

  const crumbs = breadcrumbSchema([
    { name: "Insights", path: "/insights" },
    ...(name ? [{ name, path: `/insights/${slug}` }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [schema, crumbs] : [crumbs]} />
    <PostDetail slug={slug} initialData={initialData} initialLocale={DEFAULT_LOCALE} />
  </>;
}

import "@/lib/db/register"; // server-only: publishes the DB content-source for api.ts
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/pages/ProjectDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { isLocale, localizedPath, PRERENDER_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { IS_PRODUCTION_BUILD, findProjectAnyLocale, projectDetailWithFallback } from "@/lib/page-data";
import { PROJECTS as FALLBACK_PROJECTS } from "@/data/content";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline, cmsSeo, pageSeo, withNoindex } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** "Huawei Commercial — Huawei" reads badly; keep the client only when it adds something. */
function projectHeadline(title: string | undefined, client?: string | null, slug?: string) {
  // cleanHeadline reads the name out of the slug when the record has none —
  // the Arabic ones arrive titleless once unreadable text is scrubbed, and
  // without this every one of them was titled "Global Untold Story".
  const name = cleanHeadline(title, slug);
  if (!client || name.toLowerCase().includes(client.toLowerCase())) return name;
  return `${name} — ${client}`;
}

/** Known slugs are prerendered; remaining CMS slugs still render on demand. */
/*
 * An unknown slug is a 404, not a page to build.
 *
 * With a blocking fallback, every made-up URL a crawler tried was rendered and
 * written to the ISR cache — one write per distinct URL, which is unbounded and
 * exactly what a scanner produces. Verified against production before changing
 * it: /ar/work/<random> returned MISS, then HIT on the next request.
 *
 * The cost is that a slug added in the CMS needs a deploy before it resolves.
 * generateStaticParams below reads the live lists at build time, so a redeploy
 * is all it takes.
 */
export const dynamicParams = false;

// Each locale can have its own translated slug (data.slugs — see translate/apply.ts),
// so every locale needs its own slug list, not one list reused across all of them.
export async function generateStaticParams() {
  const perLocale = await Promise.all(
    PRERENDER_LOCALES.map(async (locale) => (await slugList(locale)).map(({ slug }) => ({ locale, slug }))),
  );
  return perLocale.flat();
}

async function slugList(locale: string) {
  const extras = FALLBACK_PROJECTS.map(({ slug }) => ({ slug }));
  try {
    const portfolioData = await api.getPortfolio({ page: 1, per_page: 100, locale });
    const seen = new Set(portfolioData.items.map((project) => project.slug));
    return [
      ...portfolioData.items.map((project) => ({ slug: project.slug })),
      ...extras.filter((item) => !seen.has(item.slug)),
    ];
  } catch (e) {
    console.error("Error fetching portfolio for generateStaticParams:", e instanceof Error ? e.message : e);
    return extras;
  }
}

function projectMeta(path: string, locale: string, title: string, description: string, image?: string | null, extra?: ReturnType<typeof cmsSeo>, canonicalSlug?: string, slugs?: Record<string, string>) {
  return applySeoOverrides(path, pageSeo({
    path, locale, title, description, image, type: "article",
    ogTitle: extra?.ogTitle, ogDescription: extra?.ogDescription,
    twitterTitle: extra?.twitterTitle, twitterDescription: extra?.twitterDescription,
    canonical: extra?.canonical, nofollow: extra?.nofollow,
    slugOverride: canonicalSlug ? { basePath: "/work", canonicalSlug, slugs } : undefined,
  }), locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const path = `/work/${slug}`;
  const fallbackTitle = buildTitle(slug.replace(/-/g, " "), slug);

  if (IS_PRODUCTION_BUILD) {
    const detail = await projectDetailWithFallback(slug, locale);
    const project = detail?.status === "ok" ? detail.data.project : null;
    if (project) {
      const headline = projectHeadline(project.title, project.client, slug);
      const m = cmsSeo((project as { seo?: Record<string, unknown> }).seo);
      return withNoindex(projectMeta(path, locale, buildTitle(m.metaTitle || headline, slug), buildDescription(m.metaDescription || project.results, headline), m.ogImageUrl || project.image, m, project.canonicalSlug, project.slugs), (project as { noindex?: boolean }).noindex);
    }
    return projectMeta(path, locale, fallbackTitle, fallbackTitle);
  }

  try {
    const project = await api.getPortfolioBySlug(slug, locale);
    const headline = projectHeadline(project.title, project.client, slug);
    const m = cmsSeo((project as { seo?: Record<string, unknown> }).seo);
    return projectMeta(path, locale, buildTitle(m.metaTitle || headline, slug), buildDescription(m.metaDescription || project.results, headline), m.ogImageUrl || project.image, m, project.canonicalSlug, project.slugs);
  } catch (e) {
    console.error("Error fetching project for metadata:", e);
    const live = await findProjectAnyLocale(slug, locale);
    if (live) {
      const headline = projectHeadline(live.title, live.client, slug);
      const m = cmsSeo((live as { seo?: Record<string, unknown> }).seo);
      return projectMeta(path, locale, buildTitle(m.metaTitle || headline, slug), buildDescription(m.metaDescription || live.results, headline), m.ogImageUrl || live.image, m, live.canonicalSlug, live.slugs);
    }

    const project = FALLBACK_PROJECTS.find((item) => item.slug === slug);
    if (!project) return projectMeta(path, locale, fallbackTitle, fallbackTitle);

    const headline = projectHeadline(project.title, project.client, slug);
    return projectMeta(path, locale, buildTitle(headline, slug), buildDescription(project.description, headline), project.image);
  }
}

export default async function Page({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  let name = "";
  let schema: Record<string, unknown>[] | undefined;
  const initialData = await projectDetailWithFallback(slug, locale);

  if (initialData?.status === "ok") {
    const project = initialData.data.project;
    name = cleanHeadline(project.title, slug);
    const blocks: Record<string, unknown>[] = [{
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name,
      description: buildDescription(project.results, name),
      creator: { "@type": "Organization", name: "Global Untold Story" },
      image: project.image ? absoluteUrl(project.image) : undefined,
    }];
    if (project.video) {
      blocks.push({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name,
        description: buildDescription(project.results, name),
        thumbnailUrl: project.image ? absoluteUrl(project.image) : absoluteUrl("/images/on-ground-production-giza.jpg"),
        contentUrl: absoluteUrl(project.video),
      });
    }
    schema = blocks;
  }

  if (initialData?.status === "notFound") notFound();

  const crumbs = breadcrumbSchema([
    { name: "Work", path: localizedPath("/work", locale) },
    ...(name ? [{ name, path: localizedPath(`/work/${slug}`, locale) }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [...schema, crumbs] : [crumbs]} />
    <ProjectDetail slug={slug} initialData={initialData} initialLocale={locale} />
  </>;
}

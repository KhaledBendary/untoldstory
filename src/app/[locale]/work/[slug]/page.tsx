import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/pages/ProjectDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { alternatesFor, isLocale, localizedPath, PRERENDER_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { getProjectDetailData, findProjectAnyLocale, safeFetch, projectDetailWithFallback } from "@/lib/page-data";
import { PROJECTS as FALLBACK_PROJECTS } from "@/data/content";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** "Huawei Commercial — Huawei" reads badly; keep the client only when it adds something. */
function projectHeadline(title: string, client?: string | null, slug?: string) {
  const name = cleanHeadline(title, slug);
  if (!client || name.toLowerCase().includes(client.toLowerCase())) return name;
  return `${name} — ${client}`;
}

export async function generateStaticParams() {
  const slugs = await slugList();
  return PRERENDER_LOCALES.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

async function slugList() {
  try {
    const portfolioData = await api.getPortfolio({ page: 1, per_page: 50 });
    return portfolioData.items.map((project) => ({ slug: project.slug }));
  } catch (e) {
    console.error("Error fetching portfolio for generateStaticParams:", e);
    return FALLBACK_PROJECTS.map(({ slug }) => ({ slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  // Never return {} — that inherits the root canonical ("/") and deindexes the page.
  const canonical = { alternates: alternatesFor(`/work/${slug}`, locale) };

  try {
    const project = await api.getPortfolioBySlug(slug, locale);
    const headline = projectHeadline(project.title, project.client, slug);
    const title = buildTitle(headline, slug);
    // `results` is the full case-study body — buildDescription clamps it to 155.
    const description = buildDescription(project.results, headline);
    const image = project.image;
    return applySeoOverrides(`/work/${slug}`, {
      title: { absolute: title },
      description,
      ...canonical,
      openGraph: { title, description, images: image ? [image] : [], type: "article", url: absoluteUrl(localizedPath(`/work/${slug}`, locale)) },
    }, locale);
  } catch (e) {
    console.error("Error fetching project for metadata:", e);
    const live = await findProjectAnyLocale(slug, locale);
    if (live) {
      const headline = projectHeadline(live.title, live.client, slug);
      const title = buildTitle(headline, slug);
      const description = buildDescription(live.results, headline);
      return applySeoOverrides(`/work/${slug}`, {
        title: { absolute: title },
        description,
        ...canonical,
        openGraph: { title, description, images: live.image ? [live.image] : [], type: "article", url: absoluteUrl(localizedPath(`/work/${slug}`, locale)) },
      }, locale);
    }

    const project = FALLBACK_PROJECTS.find((item) => item.slug === slug);
    if (!project) return applySeoOverrides(`/work/${slug}`, canonical, locale);

    const headline = projectHeadline(project.title, project.client, slug);
    const title = buildTitle(headline, slug);
    const description = buildDescription(project.description, headline);
    return applySeoOverrides(`/work/${slug}`, {
      title: { absolute: title },
      description,
      ...canonical,
      openGraph: { title, description, images: [project.image], type: "article", url: absoluteUrl(localizedPath(`/work/${slug}`, locale)) },
    }, locale);
  }
}

export default async function Page({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  let name = "";
  let schema;

  try {
    const project = await api.getPortfolioBySlug(slug, locale);
    name = cleanHeadline(project.title, slug);
    schema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name,
      description: buildDescription(project.results, name),
      creator: { "@type": "Organization", name: "Global Untold Story" },
      image: project.image,
    };
  } catch (e) {
    console.error("Error fetching project for page:", e);
    const live = await findProjectAnyLocale(slug, locale);
    const project = live ?? FALLBACK_PROJECTS.find((item) => item.slug === slug);
    if (project) {
      name = cleanHeadline(project.title, slug);
      schema = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name,
        description: buildDescription(live ? live.results : (project as { description: string }).description, name),
        creator: { "@type": "Organization", name: "Global Untold Story" },
        image: project.image ? absoluteUrl(project.image) : undefined,
      };
    }
  }

  const initialData = await projectDetailWithFallback(slug, locale);
  if (initialData?.status === "notFound") notFound();

  const crumbs = breadcrumbSchema([
    { name: "Work", path: localizedPath("/work", locale) },
    ...(name ? [{ name, path: localizedPath(`/work/${slug}`, locale) }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [schema, crumbs] : [crumbs]} />
    <ProjectDetail slug={slug} initialData={initialData} initialLocale={locale} />
  </>;
}

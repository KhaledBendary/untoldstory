import type { Metadata } from "next";
import ProjectDetail from "@/components/pages/ProjectDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { getProjectDetailData, safeFetch } from "@/lib/page-data";
import { PROJECTS as FALLBACK_PROJECTS } from "@/data/content";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline } from "@/lib/seo";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";

type Props = { params: Promise<{ slug: string }> };

/** "Huawei Commercial — Huawei" reads badly; keep the client only when it adds something. */
function projectHeadline(title: string, client?: string | null, slug?: string) {
  const name = cleanHeadline(title, slug);
  if (!client || name.toLowerCase().includes(client.toLowerCase())) return name;
  return `${name} — ${client}`;
}

export async function generateStaticParams() {
  try {
    const portfolioData = await api.getPortfolio({ page: 1, per_page: 50 });
    return portfolioData.items.map((project) => ({ slug: project.slug }));
  } catch (e) {
    console.error("Error fetching portfolio for generateStaticParams:", e);
    return FALLBACK_PROJECTS.map(({ slug }) => ({ slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Never return {} — that inherits the root canonical ("/") and deindexes the page.
  const canonical = { alternates: { canonical: `/work/${slug}` } };

  try {
    const project = await api.getPortfolioBySlug(slug);
    const headline = projectHeadline(project.title, project.client, slug);
    const title = buildTitle(headline, slug);
    // `results` is the full case-study body — buildDescription clamps it to 155.
    const description = buildDescription(project.results, headline);
    const image = project.image;
    return applySeoOverrides(`/work/${slug}`, {
      title: { absolute: title },
      description,
      ...canonical,
      openGraph: { title, description, images: image ? [image] : [], type: "article", url: absoluteUrl(`/work/${slug}`) },
    });
  } catch (e) {
    console.error("Error fetching project for metadata:", e);
    const project = FALLBACK_PROJECTS.find((item) => item.slug === slug);
    if (!project) return applySeoOverrides(`/work/${slug}`, canonical);

    const headline = projectHeadline(project.title, project.client, slug);
    const title = buildTitle(headline, slug);
    const description = buildDescription(project.description, headline);
    return applySeoOverrides(`/work/${slug}`, {
      title: { absolute: title },
      description,
      ...canonical,
      openGraph: { title, description, images: [project.image], type: "article", url: absoluteUrl(`/work/${slug}`) },
    });
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let name = "";
  let schema;

  try {
    const project = await api.getPortfolioBySlug(slug);
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
    const project = FALLBACK_PROJECTS.find((item) => item.slug === slug);
    if (project) {
      name = cleanHeadline(project.title, slug);
      schema = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name,
        description: buildDescription(project.description, name),
        creator: { "@type": "Organization", name: "Global Untold Story" },
        image: absoluteUrl(project.image),
      };
    }
  }

  const initialData = await safeFetch(() => getProjectDetailData(slug, DEFAULT_LOCALE), "project:" + slug);

  const crumbs = breadcrumbSchema([
    { name: "Work", path: "/work" },
    ...(name ? [{ name, path: `/work/${slug}` }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [schema, crumbs] : [crumbs]} />
    <ProjectDetail slug={slug} initialData={initialData} initialLocale={DEFAULT_LOCALE} />
  </>;
}

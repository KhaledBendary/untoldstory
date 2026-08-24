import type { Metadata } from "next";
import ServiceDetail from "@/components/pages/ServiceDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { getServiceDetailData, safeFetch } from "@/lib/page-data";
import { SERVICES as FALLBACK_SERVICES } from "@/data/content";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline, cmsSeo } from "@/lib/seo";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const services = await api.getServices();
    return services.map((service) => ({ slug: service.slug }));
  } catch (e) {
    console.error("Error fetching services for generateStaticParams:", e);
    return FALLBACK_SERVICES.map(({ slug }) => ({ slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Every branch below keeps its own canonical. Returning {} here would inherit
  // the root layout's canonical ("/") and tell Google the page duplicates home.
  const canonical = { alternates: { canonical: `/services/${slug}` } };

  try {
    const service = await api.getServiceBySlug(slug);
    const meta = cmsSeo(service.seo);
    const title = buildTitle(meta.metaTitle || service.title, slug);
    const description = buildDescription(meta.metaDescription || service.shortDesc);
    const image = meta.ogImageUrl || service.imageUrl;
    return applySeoOverrides(`/services/${slug}`, {
      title: { absolute: title },
      description,
      ...canonical,
      openGraph: { title, description, images: image ? [image] : [], type: "website", url: absoluteUrl(`/services/${slug}`) },
    });
  } catch (e) {
    console.error("Error fetching service for metadata:", e);
    const service = FALLBACK_SERVICES.find((item) => item.slug === slug);
    if (!service) return applySeoOverrides(`/services/${slug}`, canonical);

    const title = buildTitle(service.title, slug);
    const description = buildDescription(`${service.description} ${service.whoFor}`);
    return applySeoOverrides(`/services/${slug}`, {
      title: { absolute: title },
      description,
      keywords: service.keywords.split(",").map((item) => item.trim()),
      ...canonical,
      openGraph: { title, description, images: [service.image], type: "website", url: absoluteUrl(`/services/${slug}`) },
    });
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let name = "";
  let schema;

  try {
    const service = await api.getServiceBySlug(slug);
    name = cleanHeadline(cmsSeo(service.seo).metaTitle || service.title, slug);
    schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name,
      description: buildDescription(service.shortDesc),
      provider: { "@type": "Organization", name: "Global Untold Story", url: "https://globaluntoldstory.com/" },
      areaServed: ["Egypt", "UAE", "Saudi Arabia", "MENA"],
    };
  } catch (e) {
    console.error("Error fetching service for page:", e);
    const service = FALLBACK_SERVICES.find((item) => item.slug === slug);
    if (service) {
      name = cleanHeadline(service.title, slug);
      schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description: buildDescription(service.description),
        provider: { "@type": "Organization", name: "Global Untold Story", url: "https://globaluntoldstory.com/" },
        areaServed: ["Egypt", "UAE", "Saudi Arabia", "MENA"],
      };
    }
  }

  const initialData = await safeFetch(() => getServiceDetailData(slug, DEFAULT_LOCALE), "service:" + slug);

  const crumbs = breadcrumbSchema([
    { name: "Services", path: "/services" },
    ...(name ? [{ name, path: `/services/${slug}` }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [schema, crumbs] : [crumbs]} />
    <ServiceDetail slug={slug} initialData={initialData} initialLocale={DEFAULT_LOCALE} />
  </>;
}

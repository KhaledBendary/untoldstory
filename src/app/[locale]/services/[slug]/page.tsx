import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetail from "@/components/pages/ServiceDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { alternatesFor, isLocale, localizedPath, PRERENDER_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { getServiceDetailData, findServiceAnyLocale, safeFetch, serviceDetailWithFallback } from "@/lib/page-data";
import { SERVICES as FALLBACK_SERVICES } from "@/data/content";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline, cmsSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Every real slug is prerendered; unknown ones are 404s, not renders. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await slugList();
  return PRERENDER_LOCALES.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

async function slugList() {
  try {
    const services = await api.getServices();
    return services.map((service) => ({ slug: service.slug }));
  } catch (e) {
    console.error("Error fetching services for generateStaticParams:", e);
    return FALLBACK_SERVICES.map(({ slug }) => ({ slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  // Every branch below keeps its own canonical. Returning {} here would inherit
  // the root layout's canonical ("/") and tell Google the page duplicates home.
  const canonical = { alternates: alternatesFor(`/services/${slug}`, locale) };

  try {
    const service = await api.getServiceBySlug(slug, locale);
    const meta = cmsSeo(service.seo);
    const title = buildTitle(meta.metaTitle || service.title, slug);
    const description = buildDescription(meta.metaDescription || service.shortDesc);
    const image = meta.ogImageUrl || service.imageUrl;
    return applySeoOverrides(`/services/${slug}`, {
      title: { absolute: title },
      description,
      ...canonical,
      openGraph: { title, description, images: image ? [image] : [], type: "website", url: absoluteUrl(localizedPath(`/services/${slug}`, locale)) },
    }, locale);
  } catch (e) {
    console.error("Error fetching service for metadata:", e);
    // The list endpoint is cached and its slugs are current, so try it before
    // the editorial snapshot, whose slugs no longer match the CMS.
    const live = await findServiceAnyLocale(slug, locale);
    if (live) {
      const meta = cmsSeo(live.seo);
      const title = buildTitle(meta.metaTitle || live.title, slug);
      const description = buildDescription(meta.metaDescription || live.shortDesc);
      return applySeoOverrides(`/services/${slug}`, {
        title: { absolute: title },
        description,
        ...canonical,
        openGraph: { title, description, images: live.imageUrl ? [live.imageUrl] : [], type: "website", url: absoluteUrl(localizedPath(`/services/${slug}`, locale)) },
      }, locale);
    }

    const service = FALLBACK_SERVICES.find((item) => item.slug === slug);
    if (!service) return applySeoOverrides(`/services/${slug}`, canonical, locale);

    const title = buildTitle(service.title, slug);
    const description = buildDescription(`${service.description} ${service.whoFor}`);
    return applySeoOverrides(`/services/${slug}`, {
      title: { absolute: title },
      description,
      keywords: service.keywords.split(",").map((item) => item.trim()),
      ...canonical,
      openGraph: { title, description, images: [service.image], type: "website", url: absoluteUrl(localizedPath(`/services/${slug}`, locale)) },
    }, locale);
  }
}

export default async function Page({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  let name = "";
  let schema;

  try {
    const service = await api.getServiceBySlug(slug, locale);
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
    const live = await findServiceAnyLocale(slug, locale);
    const service = live ?? FALLBACK_SERVICES.find((item) => item.slug === slug);
    if (service) {
      name = cleanHeadline(service.title, slug);
      schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description: buildDescription(live ? live.shortDesc : (service as { description: string }).description),
        provider: { "@type": "Organization", name: "Global Untold Story", url: "https://globaluntoldstory.com/" },
        areaServed: ["Egypt", "UAE", "Saudi Arabia", "MENA"],
      };
    }
  }

  const initialData = await serviceDetailWithFallback(slug, locale);
  if (initialData?.status === "notFound") notFound();

  const crumbs = breadcrumbSchema([
    { name: "Services", path: localizedPath("/services", locale) },
    ...(name ? [{ name, path: localizedPath(`/services/${slug}`, locale) }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [schema, crumbs] : [crumbs]} />
    <ServiceDetail slug={slug} initialData={initialData} initialLocale={locale} />
  </>;
}

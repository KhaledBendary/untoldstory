import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetail from "@/components/pages/ServiceDetail";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { api } from "@/lib/api";
import { isLocale, localizedPath, PRERENDER_LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { IS_PRODUCTION_BUILD, findServiceAnyLocale, serviceDetailWithFallback } from "@/lib/page-data";
import { SERVICES as FALLBACK_SERVICES } from "@/data/content";
import { relatedServiceSlugs, serviceStaticParams } from "@/lib/legacy-redirects";
import { getServiceFaqs } from "@/data/service-faqs";
import { absoluteUrl, breadcrumbSchema, buildDescription, buildTitle, cleanHeadline, cmsSeo, pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

/** Every known slug is prerendered; extra CMS slugs still render on demand. */
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

export async function generateStaticParams() {
  const slugs = await slugList();
  return PRERENDER_LOCALES.flatMap((locale) => slugs.map(({ slug }) => ({ locale, slug })));
}

async function slugList() {
  try {
    const services = await api.getServices();
    return serviceStaticParams(services.map((service) => service.slug), FALLBACK_SERVICES.map((s) => s.slug));
  } catch (e) {
    console.error("Error fetching services for generateStaticParams:", e instanceof Error ? e.message : e);
    return serviceStaticParams([], FALLBACK_SERVICES.map((s) => s.slug));
  }
}

function serviceMeta(path: string, locale: string, title: string, description: string, image?: string | null) {
  return applySeoOverrides(path, pageSeo({ path, locale, title, description, image }), locale);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const path = `/services/${slug}`;
  const fallbackTitle = buildTitle(slug.replace(/-/g, " "), slug);

  if (IS_PRODUCTION_BUILD) {
    const detail = await serviceDetailWithFallback(slug, locale);
    const service = detail?.status === "ok" ? detail.data.service : null;
    if (service) {
      const meta = cmsSeo(service.seo);
      return serviceMeta(
        path, locale,
        buildTitle(meta.metaTitle || service.title, slug),
        buildDescription(meta.metaDescription || service.shortDesc),
        meta.ogImageUrl || service.imageUrl,
      );
    }
    return serviceMeta(path, locale, fallbackTitle, fallbackTitle);
  }

  try {
    const service = await api.getServiceBySlug(slug, locale);
    const meta = cmsSeo(service.seo);
    return serviceMeta(
      path, locale,
      buildTitle(meta.metaTitle || service.title, slug),
      buildDescription(meta.metaDescription || service.shortDesc),
      meta.ogImageUrl || service.imageUrl,
    );
  } catch (e) {
    console.error("Error fetching service for metadata:", e);
    const live = await findServiceAnyLocale(slug, locale);
    if (live) {
      const meta = cmsSeo(live.seo);
      return serviceMeta(
        path, locale,
        buildTitle(meta.metaTitle || live.title, slug),
        buildDescription(meta.metaDescription || live.shortDesc),
        meta.ogImageUrl || live.imageUrl,
      );
    }

    const service = FALLBACK_SERVICES.find((item) => relatedServiceSlugs(slug).includes(item.slug));
    if (!service) return serviceMeta(path, locale, fallbackTitle, fallbackTitle);

    return {
      ...serviceMeta(path, locale, buildTitle(service.title, slug), buildDescription(`${service.description} ${service.whoFor}`), service.image),
      keywords: service.keywords.split(",").map((item) => item.trim()),
    };
  }
}

export default async function Page({ params }: Props) {
  const { slug, locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  let name = "";
  let schema;
  const initialData = await serviceDetailWithFallback(slug, locale);

  if (initialData?.status === "ok") {
    const service = initialData.data.service;
    name = cleanHeadline(cmsSeo(service.seo).metaTitle || service.title, slug);
    schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      name,
      description: buildDescription(service.shortDesc),
      url: absoluteUrl(localizedPath(`/services/${slug}`, locale)),
      image: service.imageUrl ? absoluteUrl(service.imageUrl) : undefined,
      provider: { "@type": "Organization", name: "Global Untold Story", url: "https://globaluntoldstory.com/" },
      brand: { "@type": "Organization", name: "Global Untold Story" },
      areaServed: ["Egypt", "UAE", "Saudi Arabia", "MENA"],
    };
  }

  if (initialData?.status === "notFound") notFound();

  const faqs = getServiceFaqs(slug);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const crumbs = breadcrumbSchema([
    { name: "Services", path: localizedPath("/services", locale) },
    ...(name ? [{ name, path: localizedPath(`/services/${slug}`, locale) }] : []),
  ]);

  return <>
    <StructuredData data={schema ? [schema, faqSchema, crumbs] : [faqSchema, crumbs]} />
    <ServiceDetail slug={slug} initialData={initialData} initialLocale={locale} />
  </>;
}

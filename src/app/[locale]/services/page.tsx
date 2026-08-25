import type { Metadata } from "next";
import Services from "@/components/pages/Services";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { isLocale, localizedPath, DEFAULT_LOCALE } from "@/lib/i18n";
import { getServicesData } from "@/lib/page-data";
import { absoluteUrl, breadcrumbSchema, cleanHeadline, pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("services", locale);
  return applySeoOverrides("/services", pageSeo({ path: "/services", locale, title: meta.title, description: meta.description }), locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const services = await getServicesData(locale);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Production Services by Global Untold Story",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cleanHeadline(service.title, service.slug),
      url: absoluteUrl(localizedPath(`/services/${service.slug}`, locale)),
    })),
  };

  return <>
    <StructuredData data={[itemList, breadcrumbSchema([{ name: "Services", path: localizedPath("/services", locale) }])]} />
    <Services initialData={services} initialLocale={locale} />
  </>;
}

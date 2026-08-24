import type { Metadata } from "next";
import Services from "@/components/pages/Services";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { getServicesData } from "@/lib/page-data";
import { absoluteUrl, breadcrumbSchema, cleanHeadline } from "@/lib/seo";

export const metadata: Metadata = applySeoOverrides("/services", {
  title: { absolute: "Services — 13 Production Crafts | Global Untold Story" },
  description: "On-ground production in Egypt, commercial advertising, documentary, corporate video, live broadcast, post-production, CGI and localization.",
  alternates: { canonical: "/services" },
});

export default async function Page() {
  const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";
  const services = await getServicesData(DEFAULT_LOCALE);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Production Services by Global Untold Story",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cleanHeadline(service.title, service.slug),
      url: absoluteUrl(`/services/${service.slug}`),
    })),
  };

  return <>
    <StructuredData data={[itemList, breadcrumbSchema([{ name: "Services", path: "/services" }])]} />
    <Services initialData={services} initialLocale={DEFAULT_LOCALE} />
  </>;
}

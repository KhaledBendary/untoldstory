import type { Metadata } from "next";
import Contact from "@/components/pages/Contact";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { isLocale, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";
import { getContactData, safeFetch } from "@/lib/page-data";
import { breadcrumbSchema, pageSeo } from "@/lib/seo";
import { issueFormToken } from "@/lib/form-token";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("contact", locale);
  return applySeoOverrides("/contact", pageSeo({ path: "/contact", locale, title: meta.title, description: meta.description }), locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const initialData = await safeFetch(() => getContactData(locale), "contact");
  return <>
    <StructuredData data={breadcrumbSchema([{ name: "Contact", path: localizedPath("/contact", locale) }])} />
    <Contact initialData={initialData} initialLocale={locale} formToken={issueFormToken()} />
  </>;
}

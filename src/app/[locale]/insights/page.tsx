import type { Metadata } from "next";
import Insights from "@/components/pages/Insights";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { isLocale, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";
import { getInsightsData, safeFetch } from "@/lib/page-data";
import { breadcrumbSchema, pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("insights", locale);
  return applySeoOverrides("/insights", pageSeo({ path: "/insights", locale, title: meta.title, description: meta.description }), locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const initialData = await safeFetch(() => getInsightsData(locale), "insights");
  return <>
    <StructuredData data={breadcrumbSchema([{ name: "Insights", path: localizedPath("/insights", locale) }])} />
    <Insights initialData={initialData} initialLocale={locale} />
  </>;
}

import type { Metadata } from "next";
import Insights from "@/components/pages/Insights";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { alternatesFor, isLocale, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";
import { getInsightsData, safeFetch } from "@/lib/page-data";

type Props = { params: Promise<{ locale: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("insights", locale);
  return applySeoOverrides("/insights", {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: alternatesFor("/insights", locale),
  }, locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const initialData = await safeFetch(() => getInsightsData(locale), "insights");
  return <Insights initialData={initialData} initialLocale={locale} />;
}

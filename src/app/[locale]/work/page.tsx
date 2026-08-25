import type { Metadata } from "next";
import Work from "@/components/pages/Work";
import StructuredData from "@/components/StructuredData";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { isLocale, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";
import { getWorkData, safeFetch } from "@/lib/page-data";
import { breadcrumbSchema, pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("work", locale);
  return applySeoOverrides("/work", pageSeo({ path: "/work", locale, title: meta.title, description: meta.description }), locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const initialData = await safeFetch(() => getWorkData(locale), "work");
  return <>
    <StructuredData data={breadcrumbSchema([{ name: "Work", path: localizedPath("/work", locale) }])} />
    <Work initialData={initialData} initialLocale={locale} />
  </>;
}

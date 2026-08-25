import type { Metadata } from "next";
import Work from "@/components/pages/Work";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { alternatesFor, isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import { getWorkData, safeFetch } from "@/lib/page-data";

type Props = { params: Promise<{ locale: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("work", locale);
  return applySeoOverrides("/work", {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: alternatesFor("/work", locale),
  }, locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const initialData = await safeFetch(() => getWorkData(locale), "work");
  return <Work initialData={initialData} initialLocale={locale} />;
}

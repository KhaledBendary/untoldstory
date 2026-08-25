import type { Metadata } from "next";
import About from "@/components/pages/About";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { alternatesFor, isLocale, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";
import { getAboutData, safeFetch } from "@/lib/page-data";

type Props = { params: Promise<{ locale: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("about", locale);
  return applySeoOverrides("/about", {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: alternatesFor("/about", locale),
  }, locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const initialData = await safeFetch(() => getAboutData(locale), "about");
  return <About initialData={initialData} initialLocale={locale} />;
}

import type { Metadata } from "next";
import Home from "@/components/pages/Home";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { alternatesFor, isLocale, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";
import { getHomeDataSafe } from "@/lib/home-data";

type Props = { params: Promise<{ locale: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("home", locale);
  return applySeoOverrides("/", {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: alternatesFor("/", locale),
  }, locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  // Fetched here rather than in a client effect so the HTML crawlers receive
  // carries the headline, services and copy instead of an empty shell.
  const initialData = await getHomeDataSafe(locale);
  return <Home initialData={initialData} initialLocale={locale} />;
}

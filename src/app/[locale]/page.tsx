import type { Metadata } from "next";
import Home from "@/components/pages/Home";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import { getHomeDataSafe } from "@/lib/home-data";
import { pageSeo } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("home", locale);
  return applySeoOverrides("/", pageSeo({ path: "/", locale, title: meta.title, description: meta.description }), locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const initialData = await getHomeDataSafe(locale);
  return <Home initialData={initialData} initialLocale={locale} />;
}

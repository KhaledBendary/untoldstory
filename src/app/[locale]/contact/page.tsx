import type { Metadata } from "next";
import Contact from "@/components/pages/Contact";
import { applySeoOverrides } from "@/data/seo-overrides";
import { pageMeta } from "@/data/page-meta";
import { alternatesFor, isLocale, DEFAULT_LOCALE, localizedPath } from "@/lib/i18n";
import { getContactData, safeFetch } from "@/lib/page-data";

type Props = { params: Promise<{ locale: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta("contact", locale);
  return applySeoOverrides("/contact", {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: alternatesFor("/contact", locale),
  }, locale);
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const initialData = await safeFetch(() => getContactData(locale), "contact");
  return <Contact initialData={initialData} initialLocale={locale} />;
}

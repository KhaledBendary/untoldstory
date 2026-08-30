import type { Metadata } from "next";
import Legal from "@/components/pages/Legal";
import { applySeoOverrides } from "@/data/seo-overrides";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";
import { legalDoc } from "@/data/legal";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return applySeoOverrides(
    "/cookies",
    pageSeo({
      path: "/cookies",
      locale,
      // Both follow the document itself, so the Arabic page gets an Arabic
      // title and description rather than the English ones.
      title: `${legalDoc("cookies", locale).title} | Global Untold Story`,
      description: locale === "ar" ? "كل ملفات تعريف الارتباط التي يضعها الموقع، وما يقيسه كلٌّ منها، ومدة بقائه، وكيفية إيقاف الاختياري منها." : "Every cookie this site sets, what each one measures, how long it lasts, and how to switch the optional ones off.",
    }),
    locale,
  );
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return <Legal docKey="cookies" locale={locale} />;
}

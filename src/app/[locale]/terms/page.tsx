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
    "/terms",
    pageSeo({
      path: "/terms",
      locale,
      // Both follow the document itself, so the Arabic page gets an Arabic
      // title and description rather than the English ones.
      title: `${legalDoc("terms", locale).title} | Global Untold Story`,
      description: locale === "ar" ? "الشروط التي تحكم استخدام globaluntoldstory.com، وملكية الأعمال المعروضة، وحدود ما يلتزم به كل طرف عند إرسال طلب." : "The terms covering use of globaluntoldstory.com, ownership of the work shown, and the limits of what an enquiry commits either side to.",
    }),
    locale,
  );
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return <Legal docKey="terms" locale={locale} />;
}

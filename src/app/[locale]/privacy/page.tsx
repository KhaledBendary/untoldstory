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
    "/privacy",
    pageSeo({
      path: "/privacy",
      locale,
      // Both follow the document itself, so the Arabic page gets an Arabic
      // title and description rather than the English ones.
      title: `${legalDoc("privacy", locale).title} | Global Untold Story`,
      description: locale === "ar" ? "كيف تتعامل Global Untold Story مع البيانات التي تشاركها عبر الموقع، وما أدوات التحليل التي نستخدمها، وما يمكنك طلب حذفه." : "How Global Untold Story handles the information you share through this site, what analytics we run, and what you can ask us to delete.",
    }),
    locale,
  );
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return <Legal docKey="privacy" locale={locale} />;
}

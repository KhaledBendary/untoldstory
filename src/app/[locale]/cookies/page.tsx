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
      title: `${legalDoc("cookies", locale).title} | The Untold Story`,
      description: locale === "ar" ? "كل ملفات تعريف الارتباط التي يضعها الموقع، وما يقيسه كلٌّ منها، ومدة بقائه، وكيفية إيقاف الاختياري منها." : locale === "fr" ? "Chaque cookie déposé par ce site, ce qu'il mesure, sa durée et comment désactiver les cookies facultatifs." : locale === "de" ? "Jedes Cookie dieser Website, was es misst, wie lange es gespeichert wird und wie Sie die optionalen abschalten." : locale === "es" ? "Cada cookie de este sitio, qué mide, cuánto dura y cómo desactivar las opcionales." : locale === "it" ? "Ogni cookie impostato da questo sito, cosa misura, quanto dura e come disattivare quelli facoltativi." : locale === "pt" ? "Cada cookie que este site define, o que ele mede, quanto tempo dura e como desativar os opcionais." : locale === "ru" ? "Все файлы cookie этого сайта: что измеряет каждый, сколько он хранится и как отключить необязательные." : locale === "tr" ? "Bu sitenin kullandığı her çerez, neyi ölçtüğü, ne kadar süre kaldığı ve isteğe bağlı olanların nasıl kapatılacağı." : locale === "pl" ? "Każdy plik cookie tej strony: co mierzy, jak długo działa i jak wyłączyć te opcjonalne." : locale === "zh" ? "本网站设置的每一个 Cookie：它记录什么、保留多久，以及如何关闭可选 Cookie。" : locale === "ja" ? "このサイトが設定するすべてのCookie、その計測内容と保存期間、任意のCookieを無効にする方法。" : locale === "ko" ? "이 사이트가 사용하는 모든 쿠키의 측정 항목과 보관 기간, 선택 쿠키를 끄는 방법을 안내합니다." : locale === "sw" ? "Kila kuki ambayo tovuti hii hutumia, inachopima, inakaa kwa muda gani na jinsi ya kuzima zile za hiari." : "Every cookie this site sets, what each one measures, how long it lasts, and how to switch the optional ones off.",
    }),
    locale,
  );
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return <Legal docKey="cookies" locale={locale} />;
}

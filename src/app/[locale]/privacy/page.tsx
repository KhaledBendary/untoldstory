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
      title: `${legalDoc("privacy", locale).title} | The Untold Story`,
      description: locale === "ar" ? "كيف تتعامل The Untold Story مع البيانات التي تشاركها عبر الموقع، وما أدوات التحليل التي نستخدمها، وما يمكنك طلب حذفه." : locale === "fr" ? "Comment The Untold Story traite les informations partagées sur ce site, les mesures d'audience utilisées et ce que vous pouvez nous demander de supprimer." : locale === "de" ? "Wie The Untold Story mit den Angaben umgeht, die Sie über diese Website teilen, welche Analysen wir nutzen und was Sie löschen lassen können." : locale === "es" ? "Cómo trata The Untold Story los datos que compartes en este sitio, qué analítica usamos y qué puedes pedirnos que borremos." : locale === "it" ? "Come The Untold Story tratta le informazioni che condividi tramite questo sito, quali strumenti di analisi usiamo e cosa puoi chiederci di cancellare." : locale === "pt" ? "Como a The Untold Story trata as informações que você compartilha neste site, quais análises usamos e o que você pode pedir para excluirmos." : locale === "ru" ? "Как The Untold Story обращается с информацией, которую вы передаёте через сайт, какую аналитику мы используем и что вы можете попросить удалить." : locale === "tr" ? "The Untold Story'nin bu site üzerinden paylaştığınız bilgileri nasıl işlediği, hangi analiz araçlarını kullandığımız ve neleri silmemizi isteyebileceğiniz." : locale === "pl" ? "Jak The Untold Story przetwarza informacje przekazywane przez tę stronę, z jakiej analityki korzystamy i o usunięcie czego możesz nas poprosić." : locale === "zh" ? "The Untold Story 如何处理您通过本网站提供的信息、我们使用哪些分析工具，以及您可以要求我们删除哪些内容。" : locale === "ja" ? "このサイトを通じて共有された情報をThe Untold Storyがどのように扱うか、使用している分析ツール、削除を依頼できる内容について。" : locale === "ko" ? "The Untold Story가 이 사이트를 통해 공유된 정보를 처리하는 방식, 사용하는 분석 도구, 삭제를 요청할 수 있는 항목을 안내합니다." : locale === "sw" ? "Jinsi The Untold Story inavyoshughulikia taarifa unazoshiriki kupitia tovuti hii, uchanganuzi tunaotumia na unachoweza kutuomba tufute." : "How The Untold Story handles the information you share through this site, what analytics we run, and what you can ask us to delete.",
    }),
    locale,
  );
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return <Legal docKey="privacy" locale={locale} />;
}

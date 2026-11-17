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
      title: `${legalDoc("terms", locale).title} | The Untold Story`,
      description: locale === "ar" ? "الشروط التي تحكم استخدام globaluntoldstory.com، وملكية الأعمال المعروضة، وحدود ما يلتزم به كل طرف عند إرسال طلب." : locale === "fr" ? "Les conditions d'utilisation de globaluntoldstory.com, la propriété des travaux présentés et la portée d'une demande." : locale === "de" ? "Die Bedingungen für die Nutzung von globaluntoldstory.com, die Rechte an den gezeigten Arbeiten und was eine Anfrage verbindlich macht." : locale === "es" ? "Las condiciones de uso de globaluntoldstory.com, la propiedad de los trabajos mostrados y lo que compromete una consulta." : locale === "it" ? "Le condizioni d'uso di globaluntoldstory.com, la proprietà dei lavori mostrati e i limiti di ciò che una richiesta comporta per entrambe le parti." : locale === "pt" ? "Os termos de uso de globaluntoldstory.com, a propriedade dos trabalhos exibidos e os limites do que um pedido de contato implica para cada parte." : locale === "ru" ? "Условия использования globaluntoldstory.com, права на представленные работы и то, к чему обращение обязывает каждую из сторон." : locale === "tr" ? "globaluntoldstory.com kullanım koşulları, gösterilen çalışmaların mülkiyeti ve bir talebin taraflara getirdiği yükümlülüklerin sınırları." : locale === "pl" ? "Warunki korzystania z globaluntoldstory.com, prawa do prezentowanych prac oraz granice tego, do czego zapytanie zobowiązuje każdą ze stron." : locale === "zh" ? "globaluntoldstory.com 的使用条款、所展示作品的归属，以及提交咨询对双方的约束范围。" : locale === "ja" ? "globaluntoldstory.comの利用規約、掲載作品の権利、お問い合わせが双方に生じさせる義務の範囲について。" : locale === "ko" ? "globaluntoldstory.com 이용 약관, 게시된 작업물의 권리, 문의가 양측에 갖는 효력의 범위를 안내합니다." : locale === "sw" ? "Masharti ya kutumia globaluntoldstory.com, umiliki wa kazi zinazoonyeshwa na mipaka ya kile ombi linamaanisha kwa kila upande." : "The terms covering use of globaluntoldstory.com, ownership of the work shown, and the limits of what an inquiry commits either side to.",
    }),
    locale,
  );
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return <Legal docKey="terms" locale={locale} />;
}

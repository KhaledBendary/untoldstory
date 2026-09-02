"use client";

import { useEffect, useState } from "react";
import Link from "@/components/LocaleLink";
import { useLanguage } from "./LanguageContext";
import { consentRequired, readConsent, setConsent } from "@/lib/consent";

/** Kept here rather than in the main translation table: this has to render
 *  before anything else and must not depend on a CMS fetch. */
const COPY: Record<string, { text: string; accept: string; decline: string; policy: string }> = {
  en: { text: "We use analytics and advertising cookies to understand what people read and whether our ads reach the right audiences.", accept: "Accept", decline: "Decline", policy: "Cookie policy" },
  ar: { text: "نستخدم ملفات تعريف الارتباط للتحليلات والإعلانات لنفهم ما يقرؤه الزوار وما إذا كانت إعلاناتنا تصل إلى الجمهور المناسب.", accept: "موافق", decline: "رفض", policy: "سياسة الكوكيز" },
  de: { text: "Wir verwenden Analyse- und Werbe-Cookies, um zu verstehen, was gelesen wird und ob unsere Anzeigen die richtigen Zielgruppen erreichen.", accept: "Akzeptieren", decline: "Ablehnen", policy: "Cookie-Richtlinie" },
  es: { text: "Usamos cookies de análisis y publicidad para saber qué se lee y si nuestros anuncios llegan al público adecuado.", accept: "Aceptar", decline: "Rechazar", policy: "Política de cookies" },
  fr: { text: "Nous utilisons des cookies d'analyse et de publicité pour comprendre ce qui est lu et si nos annonces touchent les bonnes audiences.", accept: "Accepter", decline: "Refuser", policy: "Politique de cookies" },
  it: { text: "Usiamo cookie di analisi e pubblicità per capire cosa viene letto e se i nostri annunci raggiungono il pubblico giusto.", accept: "Accetta", decline: "Rifiuta", policy: "Informativa cookie" },
  pt: { text: "Usamos cookies de análise e publicidade para perceber o que é lido e se os nossos anúncios chegam ao público certo.", accept: "Aceitar", decline: "Recusar", policy: "Política de cookies" },
  tr: { text: "Nelerin okunduğunu ve reklamlarımızın doğru kitleye ulaşıp ulaşmadığını anlamak için analiz ve reklam çerezleri kullanıyoruz.", accept: "Kabul et", decline: "Reddet", policy: "Çerez politikası" },
  ru: { text: "Мы используем аналитические и рекламные файлы cookie, чтобы понимать, что читают посетители и достигает ли реклама нужной аудитории.", accept: "Принять", decline: "Отклонить", policy: "Политика cookie" },
  zh: { text: "我们使用分析和广告 Cookie，以了解访客阅读了什么，以及我们的广告是否触达了合适的受众。", accept: "接受", decline: "拒绝", policy: "Cookie 政策" },
  ja: { text: "分析および広告用の Cookie を使用し、何が読まれているか、広告が適切な相手に届いているかを把握しています。", accept: "同意する", decline: "拒否する", policy: "Cookie ポリシー" },
  ko: { text: "방문자가 무엇을 읽는지, 광고가 적절한 대상에게 도달하는지 파악하기 위해 분석 및 광고 쿠키를 사용합니다.", accept: "동의", decline: "거부", policy: "쿠키 정책" },
  pl: { text: "Używamy plików cookie analitycznych i reklamowych, aby rozumieć, co jest czytane i czy nasze reklamy trafiają do właściwych odbiorców.", accept: "Akceptuję", decline: "Odrzuć", policy: "Polityka cookies" },
  sw: { text: "Tunatumia vidakuzi vya uchanganuzi na matangazo ili kuelewa kinachosomwa na kama matangazo yetu yanawafikia watu sahihi.", accept: "Kubali", decline: "Kataa", policy: "Sera ya vidakuzi" },
};

export default function ConsentBanner() {
  const { locale } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only after mount: the decision depends on localStorage and timezone,
    // neither of which exists during the server render.
    if (readConsent() !== null) return;
    if (!consentRequired()) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  const copy = COPY[locale] ?? COPY.en;

  const decide = (choice: "granted" | "denied") => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={copy.policy}
      className="fixed bottom-0 left-0 right-0 z-[250] border-t border-white/15 bg-[#0a0a0a]/95 backdrop-blur-sm px-5 md:px-10 py-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-[13px] leading-relaxed text-white/75">
          {copy.text}{" "}
          <Link href="/cookies" className="link-line text-white underline decoration-white/40">
            {copy.policy}
          </Link>
        </p>

        <div className="flex shrink-0 gap-3">
          {/* Refusing is one click, same as accepting — a decline hidden behind
              a settings screen is not a free choice. */}
          <button
            type="button"
            onClick={() => decide("denied")}
            className="border border-white/30 px-6 py-3 font-mono2 text-[11px] uppercase tracking-[0.25em] text-white/80 transition-colors hover:border-white/70 hover:text-white"
          >
            {copy.decline}
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="bg-[#fafafa] px-6 py-3 font-mono2 text-[11px] uppercase tracking-[0.25em] text-[#0a0a0a] transition-colors hover:bg-white"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

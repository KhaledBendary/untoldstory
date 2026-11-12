export type ServiceFaq = { question: string; answer: string };

/*
 * A service page's frequently asked questions come from the service's own FAQ
 * fields in the CMS, written per language (see db/localize.ts's pickFaqs).
 *
 * There is no built-in fallback any more. The old one was a hardcoded English
 * list shown on every service without CMS questions: on English pages only,
 * with claims nobody had checked (a "30% rebate", "two to six weeks"), and
 * next to the page's own questions, which sat inside the body text where the
 * FAQPage schema never saw them. A page now shows its own questions, once, in
 * the FAQ section — or no section at all.
 */
export function getServiceFaqs(cms?: ServiceFaq[]): ServiceFaq[] {
  return (cms ?? []).filter((item) => item.question.trim() && item.answer.trim());
}

/** An answer's paragraphs: the CMS stores them one per line. */
export function faqAnswerParagraphs(answer: string): string[] {
  return answer.split(/\n+/).map((p) => p.trim()).filter(Boolean);
}

/**
 * FAQPage structured data built from exactly the questions and answers the
 * page shows — same text, same order, same language.
 */
export function faqPageSchema(faqs: ServiceFaq[], pageUrl: string, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    inLanguage: locale,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: faqAnswerParagraphs(item.answer).join(" ") },
    })),
  };
}

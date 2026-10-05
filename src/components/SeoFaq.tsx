"use client";

import { usePathname } from "next/navigation";
import { SEO_COMMAND_SCHEMA } from "@/data/seo-command-schema";
import StructuredData from "./StructuredData";
import { useLanguage } from "./LanguageContext";
import { DEFAULT_LOCALE } from "@/lib/i18n";

/**
 * A visible FAQ section for pages the SEO Command Center has written FAQs for,
 * plus the FAQPage schema built from exactly those same questions.
 *
 * Why it exists: FAQ markup has to describe content the visitor can actually
 * read on the page. The SEO tool used to inject one site-wide FAQPage into every
 * page's <head> with no matching text anywhere, next to a second site-wide one
 * from the CMS and, on service pages, a third — duplicate, invisible FAQ markup.
 * Now the question and the markup come from the same place, per page.
 *
 * Service pages are skipped: their FAQs belong to the CMS (the FAQ fields on the
 * service) and already render their own section and schema. The entries are
 * English, so other locales don't show them rather than showing English text
 * under a translated page.
 */
export default function SeoFaq() {
  const pathname = usePathname() || "/";
  const { locale, t } = useLanguage();

  if (locale !== DEFAULT_LOCALE) return null;
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/services/")) return null;

  const items = SEO_COMMAND_SCHEMA.faqByPath?.[path];
  if (!items?.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="px-5 md:px-10 py-14 md:py-20 border-t border-white/10">
      <StructuredData data={schema} />
      <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-6">( {t("Questions")} )</p>
      <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl md:text-5xl mb-10">
        {t("Frequently asked questions")}
      </h2>
      <dl className="max-w-3xl space-y-8">
        {items.map((item) => (
          <div key={item.q}>
            <dt>
              <h3 className="font-display font-bold text-xl md:text-2xl leading-snug">{item.q}</h3>
            </dt>
            <dd className="mt-3 text-white/65 leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

"use client";

import Link from "@/components/LocaleLink";
import { SplitWords, Reveal } from "../Reveal";
import { useLanguage } from "../LanguageContext";
import { legalDoc, hasTranslation, LEGAL_UPDATED, type LegalKey } from "@/data/legal";

const OTHER_PAGES: Record<LegalKey, { key: LegalKey; href: string }[]> = {
  privacy: [{ key: "terms", href: "/terms" }, { key: "cookies", href: "/cookies" }],
  terms: [{ key: "privacy", href: "/privacy" }, { key: "cookies", href: "/cookies" }],
  cookies: [{ key: "privacy", href: "/privacy" }, { key: "terms", href: "/terms" }],
};

/**
 * Shared layout for the three legal pages. Uses the same devices as the rest
 * of the site — the ( LABEL ) eyebrow, the display face for the heading, mono
 * for metadata — so these read as part of the site rather than a bolted-on
 * template.
 */
export default function Legal({ docKey, locale }: { docKey: LegalKey; locale: string }) {
  const { t } = useLanguage();
  const doc = legalDoc(docKey, locale);
  const translated = hasTranslation(locale);

  const formattedDate = new Date(LEGAL_UPDATED).toLocaleDateString(
    locale === "ar" ? "ar-EG" : locale,
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <>
      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-14 md:pb-20">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/55 mb-6">
          ( {doc.eyebrow} )
        </p>

        <SplitWords
          as="h1"
          text={doc.title}
          className="font-display font-black uppercase tracking-tight leading-[0.9] text-[11vw] md:text-[6.5vw] max-w-5xl"
        />

        <Reveal className="mt-8 max-w-2xl">
          <p className="text-white/65 leading-relaxed text-lg">{doc.intro}</p>
          <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/55 mt-6">
            {doc.updated} — <time dateTime={LEGAL_UPDATED}>{formattedDate}</time>
          </p>
        </Reveal>

        {/* Say so rather than implying the English text is a translation. */}
        {!translated && (
          <Reveal className="mt-8 max-w-2xl border-s-2 border-white/25 ps-5">
            <p className="font-mono2 text-[11px] leading-relaxed text-white/65">
              This page is available in English only. The English text is the
              version that applies.
            </p>
          </Reveal>
        )}
      </section>

      <section className="px-5 md:px-10 pb-24 md:pb-32">
        <div className="max-w-3xl space-y-14 border-t border-white/10 pt-14">
          {doc.sections.map((section, i) => (
            <Reveal key={section.heading} delay={i * 0.04}>
              <div className="grid md:grid-cols-12 gap-6 md:gap-10">
                <div className="md:col-span-1">
                  <span className="font-mono2 text-[10px] text-white/55 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="md:col-span-11">
                  <h2 className="font-display font-bold uppercase tracking-tight text-xl md:text-2xl mb-4">
                    {section.heading}
                  </h2>
                  <div className="space-y-4">
                    {section.body.map((paragraph, j) => (
                      <p key={j} className="text-white/65 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="max-w-3xl mt-16 pt-10 border-t border-white/10">
          <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-5">
            ( {t("Read next")} )
          </p>
          <div className="flex flex-wrap gap-4">
            {OTHER_PAGES[docKey].map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="inline-flex items-center gap-3 border border-white/25 px-6 py-3 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:border-white/70 transition-colors"
              >
                {legalDoc(key, locale).title}
              </Link>
            ))}
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-6 py-3 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors"
            >
              {t("Get in touch")}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

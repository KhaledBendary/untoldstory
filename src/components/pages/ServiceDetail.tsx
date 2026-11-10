"use client";

import { useEffect, useState } from 'react';
import Link from '@/components/LocaleLink';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import Magnetic from '../Magnetic';
import RetryState from '../RetryState';
import { getServiceImagePosition, getServiceImage, getProjectImage } from '@/lib/utils';
import type { Service, PortfolioItem } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { renderCmsHtml } from '@/lib/seo';
import { fitTitleStyle } from '@/lib/title-fit';
import { serviceTagline } from '@/data/service-taglines';
import { usePageData } from '@/hooks/usePageData';
import { getServiceDetailData, type ServiceDetailData, type DetailResult } from '@/lib/page-data';
import { getServiceFaqs } from '@/data/service-faqs';

/**
 * The body without its opening paragraph when that paragraph only repeats the
 * line already shown under the title (several bodies start with it).
 */
function withoutRepeatedLead(html: string, line: string): string {
  if (!line) return html;
  const first = html.match(/^\s*<(p|h[1-6]|div)\b[^>]*>([\s\S]*?)<\/\1>/i);
  if (!first) return html;
  const plain = (text: string) => text
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
  return plain(first[2]) === plain(line) ? html.slice(first[0].length) : html;
}

export default function ServiceDetail({ slug, initialData, initialLocale }: { slug: string; initialData: DetailResult<ServiceDetailData> | null; initialLocale: string }) {
  const { locale, t, setSlugOverride } = useLanguage();
  const { data: result, loading, failed: loadFailed, retry } = usePageData(
    initialData,
    initialLocale,
    (l) => getServiceDetailData(slug, l),
    [slug],
  );
  const notFound = result?.status === "notFound";
  const payload = result?.status === "ok" ? result.data : null;
  const service = payload?.service ?? null;
  const allServices = payload?.allServices ?? [];
  const relatedProjects = payload?.relatedProjects ?? [];

  // So the language switcher lands on THIS service's own slug in the target
  // locale, instead of reusing the current URL's slug under a new prefix.
  useEffect(() => {
    if (!service) return;
    setSlugOverride({ basePath: "/services", canonicalSlug: service.canonicalSlug ?? service.slug, slugs: service.slugs });
    return () => setSlugOverride(null);
  }, [service, setSlugOverride]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 font-mono2 text-sm">{t('Loading...')}</div>
      </div>
    );
  }

  if (loadFailed) {
    return (
      <RetryState
        message={t("This service didn't load. It's not you — try again.")}
        onRetry={retry}
        fallbackHref="/services"
        fallbackLabel={t('All services')}
      />
    );
  }

  if (notFound || !service) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display font-extrabold uppercase text-4xl mb-6">{t('Service not found')}</h1>
        <Link href="/services" className="font-mono2 text-[11px] tracking-[0.25em] uppercase link-line">{t('All services')}</Link>
      </section>
    );
  }

  const idx = allServices.findIndex(s => s.slug === slug);
  const next = allServices[(idx + 1) % allServices.length];
  // The line under the title: from the CMS when it has one for this language,
  // otherwise the site's own copy (src/data/service-taglines.ts).
  const tagline = service.tagline || serviceTagline(service.canonicalSlug ?? service.slug, locale);
  const features = service.features || [];
  const faqs = getServiceFaqs(slug, service?.faqs, locale);

  return (
    <>

      {/* Hero */}
      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-12 md:pb-16">
        <Reveal>
          <Link href="/services" className="inline-flex items-center gap-2 font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 rtl:hidden" /> <ArrowRight className="w-4 h-4 hidden rtl:block" /> {t('All services')}
          </Link>
        </Reveal>
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-5">
          ( {t('Service')} {String(idx + 1).padStart(2, '0')} / {allServices.length} )
        </p>
        <SplitWords
          as="h1"
          text={service.title}
          style={fitTitleStyle(service.title, { locale })}
          className="fit-title [--t-max:7.5vw] md:[--t-max:3.25vw] font-display heading-ar-spacious font-black uppercase tracking-tight leading-[0.95]"
        />
        <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {tagline ? (
            <Reveal className="max-w-3xl">
              <p className="lead-text font-display font-semibold normal-case tracking-tight leading-[1.35] text-lg md:text-2xl text-white/75">{tagline}</p>
            </Reveal>
          ) : <span />}
          <Reveal className="shrink-0">
            <Link href="/contact">
              <Magnetic>
                <span className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors">
                  {t('Get a Quote')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </span>
              </Magnetic>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Image */}
      <section className="px-5 md:px-10 pb-14 md:pb-20">
        <Reveal>
          <div className="relative aspect-[16/8] overflow-hidden">
            <Image src={getServiceImage(service)} style={{ objectPosition: getServiceImagePosition(service) }} alt={`${service.title} — The Untold Story`} fill className="object-cover" />
          </div>
        </Reveal>
      </section>

      {/* Description + capabilities */}
      <section className="px-5 md:px-10 py-14 md:py-20 border-t border-white/10">
        <div className="read-col">
          <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-6">( {t('Overview')} )</p>
          <SplitWords
            as="p"
            text={service.shortDesc}
            className="lead-text font-display font-semibold leading-[1.4] text-xl md:text-2xl normal-case tracking-tight text-white/90"
          />
          {service.fullDesc && (
            <Reveal>
              <div
                className="cms-prose mt-10"
                dangerouslySetInnerHTML={{ __html: withoutRepeatedLead(renderCmsHtml(service.fullDesc), tagline) }}
              />
            </Reveal>
          )}
          {features.length > 0 && (
            <div className="mt-16">
              <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-6">( {t('Capabilities')} )</p>
              <ul className="border-t border-white/10">
                {features.map((c: string, i: number) => (
                  <Reveal key={c} delay={Math.min(i * 0.04, 0.4)}>
                    <li className="flex items-center gap-4 py-4 border-b border-white/10 group">
                      <span className="font-mono2 text-[10px] text-white/55 w-8 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <Check className="w-4 h-4 text-white/55 shrink-0" />
                      <span className="font-display font-medium text-base md:text-lg group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform duration-400">{c}</span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {faqs.length > 0 && (
      <section className="px-5 md:px-10 py-14 md:py-20 border-t border-white/10">
        <div className="read-col">
          <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-6">( {t('Questions')} )</p>
          <h2 className="font-display heading-ar-spacious font-extrabold uppercase tracking-tight text-2xl md:text-3xl mb-10">
            {t('Frequently asked questions')}
          </h2>
          <dl className="space-y-8">
            {faqs.map((item) => (
              <div key={item.question}>
                <dt>
                  <h3 className="font-display font-bold text-lg md:text-xl leading-snug">{item.question}</h3>
                </dt>
                <dd className="mt-3 text-white/70 leading-[1.8] text-base md:text-[1.0625rem]">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      )}

      {/* Related work */}
      {relatedProjects.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-24 border-t border-white/10">
          <h2 className="font-display heading-ar-spacious font-extrabold uppercase tracking-tight text-2xl md:text-3xl mb-10">{t('Related work')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProjects.map((p: PortfolioItem) => (
              <Link key={p.slug} href={`/work/${p.slug}`} className="group block">
                <div className="img-zoom relative aspect-[16/11] mb-4 bg-[#111]">
                  <Image src={getProjectImage(p)} alt={p.title} fill className="object-cover" loading="lazy" />
                </div>
                <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/55 mb-2">{p.client} — {p.category}</p>
                <h3 className="font-display font-bold uppercase leading-tight group-hover:opacity-70 transition-opacity">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Next service */}
      <Link href={`/services/${next.slug}`} className="group block border-t border-white/10">
        <div className="px-5 md:px-10 py-16 md:py-24 flex items-center justify-between gap-6">
          <div>
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-4">( {t('Next service')} )</p>
            <h2
              style={fitTitleStyle(next.title, { locale })}
              className="fit-title [--t-max:6.5vw] md:[--t-max:2.25vw] md:[--t-avail:calc(100vw_-_13rem)] font-display font-black uppercase tracking-tight leading-[0.95] group-hover:translate-x-3 rtl:group-hover:-translate-x-3 transition-transform duration-500"
            >
              {next.title}
            </h2>
          </div>
          <Magnetic>
            <span className="w-16 h-16 md:w-24 md:h-24 rounded-full border border-white/25 flex items-center justify-center shrink-0 group-hover:bg-[#fafafa] group-hover:text-[#0a0a0a] transition-colors duration-500">
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 rtl:rotate-180" />
            </span>
          </Magnetic>
        </div>
      </Link>
    </>
  );
}

"use client";

import { useEffect, useState } from 'react';
import Link from '@/components/LocaleLink';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import Magnetic from '../Magnetic';
import RetryState from '../RetryState';
import { getServiceImage, getProjectImage } from '@/lib/utils';
import type { Service, PortfolioItem } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { cleanHeadline, renderCmsHtml } from '@/lib/seo';
import { usePageData } from '@/hooks/usePageData';
import { getServiceDetailData, type ServiceDetailData, type DetailResult } from '@/lib/page-data';
import { getServiceFaqs } from '@/data/service-faqs';

export default function ServiceDetail({ slug, initialData, initialLocale }: { slug: string; initialData: DetailResult<ServiceDetailData> | null; initialLocale: string }) {
  const { locale, t } = useLanguage();
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

  return (
    <>

      {/* Hero */}
      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-12 md:pb-16">
        <Reveal>
          <Link href="/services" className="inline-flex items-center gap-2 font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 rtl:hidden" /> <ArrowRight className="w-4 h-4 hidden rtl:block" /> {t('All services')}
          </Link>
        </Reveal>
        <div className="flex flex-col lg:flex-row lg:items-end gap-10 justify-between">
          <div className="max-w-4xl">
            <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-5">
              ( {t('Service')} {String(idx + 1).padStart(2, '0')} / {allServices.length} )
            </p>
            <SplitWords
              as="h1"
              text={cleanHeadline(service.title, slug) || service.title}
              className="font-display font-black uppercase tracking-tight leading-[0.9] text-[10.5vw] md:text-[6.5vw]"
            />
          </div>
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
            <Image src={getServiceImage(service)} alt={`${service.title} — Global Untold Story`} fill className="object-cover" />
          </div>
        </Reveal>
      </section>

      {/* Description + capabilities */}
      <section className="px-5 md:px-10 py-14 md:py-20 border-t border-white/10">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-12">
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-6">( {t('Overview')} )</p>
            <SplitWords
              as="h2"
              text={service.shortDesc}
              className="font-display font-bold leading-[1.3] text-xl md:text-3xl normal-case tracking-tight"
            />
            {service.fullDesc && (
              <Reveal className="mt-8 border-s-2 border-white/20 ps-6">
                <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-2">{t('Full Description')}</p>
                <div className="text-white/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderCmsHtml(service.fullDesc) }} />
              </Reveal>
            )}
          </div>
          <div className="md:col-span-7">
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-6">( {t('Capabilities')} )</p>
            <ul className="border-t border-white/10">
              {(service.features || []).map((c: string, i: number) => (
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
        </div>
      </section>

      <section className="px-5 md:px-10 py-14 md:py-20 border-t border-white/10">
        <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-6">( {t('Questions')} )</p>
        <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl md:text-5xl mb-10">
          {t('Frequently asked questions')}
        </h2>
        <dl className="max-w-3xl space-y-8">
          {getServiceFaqs(slug).map((item) => (
            <div key={item.question}>
              <dt>
                <h3 className="font-display font-bold text-xl md:text-2xl leading-snug">{item.question}</h3>
              </dt>
              <dd className="mt-3 text-white/65 leading-relaxed">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Related work */}
      {relatedProjects.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-24 border-t border-white/10">
            <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl md:text-5xl mb-10">{t('Related work')}</h2>
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
            <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-[7.5vw] md:text-[4.5vw] group-hover:translate-x-3 rtl:group-hover:-translate-x-3 transition-transform duration-500">
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

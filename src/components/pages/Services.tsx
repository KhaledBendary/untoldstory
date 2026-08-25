"use client";

import { useEffect, useState } from 'react';
import Link from '@/components/LocaleLink';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import { getServiceImage } from '@/lib/utils';
import type { Service } from '@/types/api';
import { SERVICES as FALLBACK_SERVICES } from '@/data/content';
import { useLanguage } from '../LanguageContext';
import { usePageData } from '@/hooks/usePageData';
import { getServicesData } from '@/lib/page-data';

export default function Services({ initialData, initialLocale }: { initialData: Service[] | null; initialLocale: string }) {
  const { t } = useLanguage();
  const { data, loading, failed } = usePageData(initialData, initialLocale, getServicesData);
  const services = data ?? [];


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 font-mono2 text-sm">{t('Loading...')}</div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 font-mono2 text-sm">{t('Failed to load data')}</div>
      </div>
    );
  }

  return (
    <>
      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-14 md:pb-20">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">( {t('Services')} )</p>
        <SplitWords
          as="h1"
          text={t('Production Services in Egypt & MENA')}
          className="font-display font-black uppercase tracking-tight leading-[0.9] text-[12vw] md:text-[7.5vw] max-w-6xl"
        />
        <Reveal className="mt-8 max-w-xl">
          <p className="text-white/60 leading-relaxed">
            {t('The right strategy, talent, technology and execution assembled around the needs of every project.')}
          </p>
        </Reveal>
      </section>

      <section className="px-5 md:px-10 pb-24 md:pb-36">
        <div className="grid md:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {services.map((s, i) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group relative bg-[#0a0a0a] p-8 md:p-12 overflow-hidden min-h-[300px] md:min-h-[340px] flex flex-col"
            >
              <Image
                src={getServiceImage(s)}
                alt={`${s.title} — Global Untold Story`}
                fill
                className="object-cover opacity-0 group-hover:opacity-25 scale-110 group-hover:scale-100 transition-all duration-700"
                loading="lazy"
              />
              <div className="relative z-10 flex items-start justify-between">
                <span className="font-mono2 text-[11px] text-white/55">{String(i + 1).padStart(2, '0')}</span>
                <ArrowUpRight className="w-6 h-6 opacity-25 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500 rtl:-scale-x-100" />
              </div>
              <div className="relative z-10 mt-auto">
                <h2 className="font-display font-extrabold uppercase tracking-tight leading-[0.98] text-2xl md:text-4xl mb-4 group-hover:translate-x-2 rtl:group-hover:-translate-x-2 transition-transform duration-500">
                  {s.title}
                </h2>
                <p className="text-sm text-white/55 leading-relaxed max-w-md">{s.shortDesc}</p>
                <Reveal className="mt-6">
                  <span className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/55 group-hover:text-white transition-colors">
                    {t('Learn more →')}
                  </span>
                </Reveal>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

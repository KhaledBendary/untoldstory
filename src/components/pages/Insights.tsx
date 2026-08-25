"use client";

import { useEffect, useState } from 'react';
import Link from '@/components/LocaleLink';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import { getPostImage } from '@/lib/utils';
import type { BlogPost } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { usePageData } from '@/hooks/usePageData';
import { getInsightsData } from '@/lib/page-data';

export default function Insights({ initialData, initialLocale }: { initialData: BlogPost[] | null; initialLocale: string }) {
  const { locale, t } = useLanguage();
  const { data, loading } = usePageData(initialData, initialLocale, getInsightsData);
  const posts = data ?? [];


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 font-mono2 text-sm">{t('Loading...')}</div>
      </div>
    );
  }

  const featured = posts[posts.length - 1];
  const regularPosts = posts.slice(0, posts.length - 1);

  return (
    <>
      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-14 md:pb-20">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">( {t('Insights')} )</p>
        <SplitWords
          as="h1"
          text={t("Film Production Insights")}
          className="font-display font-black uppercase tracking-tight leading-[0.9] text-[12vw] md:text-[7.5vw]"
        />
      </section>

      <section className="px-5 md:px-10 pb-24 md:pb-36">
        {/* Featured */}
        {featured && (
          <Reveal>
            <Link href={`/insights/${featured.slug}`} className="group grid md:grid-cols-2 gap-8 border border-white/10 mb-8 hover:border-white/30 transition-colors">
              <div className="img-zoom relative aspect-[16/10] md:aspect-auto md:min-h-[420px]">
                <Image src={getPostImage(featured)} alt={featured.title} fill className="object-cover" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/55 mb-4">
                  {t('Home') === 'الرئيسية' ? 'مميز' : 'Featured'} — {featured.category}
                </p>
                <h2 className="font-display font-extrabold text-2xl md:text-4xl leading-tight mb-4 group-hover:opacity-70 transition-opacity">
                  {featured.title}
                </h2>
                <p className="text-white/55 leading-relaxed mb-6">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 font-mono2 text-[11px] tracking-[0.25em] uppercase">
                  {t('Home') === 'الرئيسية' ? 'اقرأ' : t('Read')} <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500 rtl:-scale-x-100" />
                </span>
              </div>
            </Link>
          </Reveal>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {regularPosts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <Link href={`/insights/${p.slug}`} className="group block border border-white/10 hover:border-white/30 transition-colors h-full">
                <div className="img-zoom relative aspect-[16/10]">
                  <Image src={getPostImage(p)} alt={p.title} fill className="object-cover" loading="lazy" />
                </div>
                <div className="p-6">
                  <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/55 mb-3">
                    {p.category} — {new Date(p.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <h2 className="font-display font-bold text-lg leading-snug group-hover:opacity-70 transition-opacity">{p.title}</h2>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

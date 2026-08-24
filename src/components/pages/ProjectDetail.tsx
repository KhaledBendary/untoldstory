"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import Magnetic from '../Magnetic';
import RetryState from '../RetryState';
import { getProjectImage } from '@/lib/utils';
import type { PortfolioItem } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { usePageData } from '@/hooks/usePageData';
import { getProjectDetailData, type ProjectDetailData, type DetailResult } from '@/lib/page-data';

export default function ProjectDetail({ slug, initialData, initialLocale }: { slug: string; initialData: DetailResult<ProjectDetailData> | null; initialLocale: string }) {
  const { locale, t } = useLanguage();
  const { data: result, loading, failed: loadFailed, retry } = usePageData(
    initialData,
    initialLocale,
    (l) => getProjectDetailData(slug, l),
    [slug],
  );
  const notFound = result?.status === "notFound";
  const payload = result?.status === "ok" ? result.data : null;
  const project = payload?.project ?? null;
  const allProjects = payload?.allProjects ?? [];


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
        message={t("This project didn't load. It's not you — try again.")}
        onRetry={retry}
        fallbackHref="/work"
        fallbackLabel={t('Back to work')}
      />
    );
  }

  if (notFound || !project) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display font-extrabold uppercase text-4xl mb-6">{t('Project not found')}</h1>
        <Link href="/work" className="font-mono2 text-[11px] tracking-[0.25em] uppercase link-line">{t('Back to work')}</Link>
      </section>
    );
  }

  const idx = allProjects.findIndex(p => p.slug === slug);
  const next = allProjects[(idx + 1) % allProjects.length];
  const related = allProjects.filter(p => p.slug !== slug && p.category === project.category).slice(0, 3);

  return (
    <>

      {/* Hero */}
      <section className="relative h-[78svh] overflow-hidden">
        <img src={getProjectImage(project)} alt={`${project.title} — ${project.category || ''} for ${project.client || ''}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-[#0a0a0a]/40" />
        <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10 pb-10 md:pb-14">
          <Reveal>
            <Link href="/work" className="inline-flex items-center gap-2 font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 rtl:hidden" /> <ArrowRight className="w-4 h-4 hidden rtl:block" /> {t('All work')}
            </Link>
          </Reveal>
          <SplitWords
            as="h1"
            text={project.title}
            className="font-display heading-ar-spacious font-black uppercase tracking-tight leading-[0.92] text-[9vw] md:text-[5.5vw] max-w-6xl"
          />
        </div>
      </section>

      {/* Meta */}
      <section className="px-5 md:px-10 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-10 mb-14">
          {[
            [t('Client'), project.client || 'N/A'],
            [t('Category'), project.category || 'N/A'],
            [t('Metric'), project.metric || project.title],
            [t('Duration'), project.duration || 'N/A'],
          ].map(([k, v]) => (
            <Reveal key={k as string}>
              <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/40 mb-3">{k}</p>
              <p className="font-display font-bold text-lg md:text-xl uppercase">{v}</p>
            </Reveal>
          ))}
        </div>

        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/40">( {t('The brief & the build')} )</p>
          </div>
          <div className="md:col-span-8">
            <SplitWords
              as="h2"
              text={project.results || project.title}
              className="font-display font-bold leading-[1.25] text-2xl md:text-4xl normal-case tracking-tight"
            />
            <Reveal className="mt-10 flex flex-wrap gap-3">
              {project.category && (
                <span className="font-mono2 text-[10px] tracking-[0.2em] uppercase border border-white/20 px-4 py-2 text-white/70">{project.category}</span>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-24 border-t border-white/10">
          <h2 className="font-display font-extrabold uppercase tracking-tight text-3xl md:text-5xl mb-10">{t('Related productions')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(p => (
              <Link key={p.slug} href={`/work/${p.slug}`} className="group block">
                <div className="img-zoom aspect-[16/11] mb-4 bg-[#111]">
                  <img src={getProjectImage(p)} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">{p.client}</p>
                <h3 className="font-display font-bold uppercase leading-tight group-hover:opacity-70 transition-opacity">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Next */}
      <Link href={`/work/${next.slug}`} className="group block border-t border-white/10">
        <div className="px-5 md:px-10 py-16 md:py-24 flex items-center justify-between gap-6">
          <div>
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">( {t('Next project')} )</p>
            <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-[8vw] md:text-[5vw] group-hover:translate-x-3 rtl:group-hover:-translate-x-3 transition-transform duration-500">
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

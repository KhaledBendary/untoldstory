"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from '@/components/LocaleLink';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { SplitWords, Reveal, EASE } from '../Reveal';
import RetryState from '../RetryState';
import { getProjectImage } from '@/lib/utils';
import type { PortfolioItem } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { usePageData } from '@/hooks/usePageData';
import { getWorkData } from '@/lib/page-data';

function WorkCard({ project }: { project: PortfolioItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Driven explicitly (rather than via CSS :hover / group-hover) so the play
  // icon's visibility can never drift out of sync with the video's actual
  // play/pause state — e.g. on touch devices where :hover can stick, or if
  // the hover ends before the buffered video starts playing.
  const [hovering, setHovering] = useState(false);

  const handleEnter = () => {
    setHovering(true);
    videoRef.current?.play();
  };

  const handleLeave = () => {
    setHovering(false);
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; }
  };

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="img-zoom relative aspect-[4/5] bg-[#111]">
        {project.video ? (
          <video
            ref={videoRef}
            src={project.video}
            poster={getProjectImage(project)}
            muted
            loop
            playsInline
            preload="none"
            className="w-full h-full object-cover"
          />
        ) : (
          <Image src={getProjectImage(project)} alt={project.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="font-mono2 text-[9px] tracking-[0.2em] uppercase bg-black/40 backdrop-blur-sm border border-white/20 px-2.5 py-1">{project.category}</span>
        </div>
        {project.video && (
          <span
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
              hovering ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <Play className="w-10 h-10 text-white/90 fill-white/90" />
          </span>
        )}
        <span className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#fafafa] text-[#0a0a0a] flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500 rtl:-scale-x-100">
          <ArrowUpRight className="w-4 h-4" />
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/60 mb-2">{project.client || project.category}</p>
          <h2 className="font-display font-bold uppercase leading-tight text-xl">{project.title}</h2>
        </div>
      </div>
    </Link>
  );
}

export default function Work({ initialData, initialLocale }: { initialData: PortfolioItem[] | null; initialLocale: string }) {
  const [filter, setFilter] = useState('All');
  const { t } = useLanguage();
  const { data, loading, failed: loadFailed, retry } = usePageData(initialData, initialLocale, getWorkData);
  const projects = data ?? [];


  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean) as string[]))];

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
        message={t("This page didn't load. It's not you — try again.")}
        onRetry={retry}
      />
    );
  }

  return (
    <>
      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-10">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">( {t('Work')} )</p>
        <SplitWords
          as="h1"
          text={t('The story ends. The impact lives on.')}
          className="font-display font-black uppercase tracking-tight leading-[0.9] text-[13vw] md:text-[8vw]"
        />
        <Reveal className="mt-6 max-w-xl">
          <p className="text-white/60 leading-relaxed">
            {t('Selected work created to move beyond the brief across platforms, cultures and audiences.')}
          </p>
        </Reveal>
      </section>

      <section className="px-5 md:px-10 pb-24 md:pb-36">
        <div className="flex flex-wrap gap-2 md:gap-3 mb-10 md:mb-14 border-t border-white/10 pt-8">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`font-mono2 text-[10px] md:text-[11px] tracking-[0.2em] uppercase px-4 md:px-5 py-2.5 border transition-all duration-400 ${
                filter === c ? 'bg-[#fafafa] text-[#0a0a0a] border-[#fafafa]' : 'border-white/20 text-white/60 hover:border-white/60 hover:text-white'
              }`}
            >
              {c === 'All' ? (t('Home') === 'الرئيسية' ? 'الكل' : 'All') : c}
              <span className="ms-2 opacity-70">{c === 'All' ? projects.length : projects.filter(p => p.category === c).length}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: EASE }}
              >
                <WorkCard project={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="px-5 md:px-10 py-20 md:py-28 border-t border-white/10 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <div>
          <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">( {t('The story is yours')} )</p>
          <SplitWords
            text={t("Let's bring it to life")}
            className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[10vw] md:text-[5.5vw] mb-8"
          />
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors"
          >
            {t('Get in touch')} <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
          </Link>
        </div>
        <Image
          src="/images/logo-white.png"
          alt="Global Untold Story"
          width={348}
          height={191}
          className="h-14 md:h-20 w-auto self-end md:ms-auto"
        />
      </section>
    </>
  );
}

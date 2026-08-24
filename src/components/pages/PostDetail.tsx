"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import Magnetic from '../Magnetic';
import RetryState from '../RetryState';
import { getPostImage } from '@/lib/utils';
import type { BlogPost } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { usePageData } from '@/hooks/usePageData';
import { getPostDetailData, type PostDetailData, type DetailResult } from '@/lib/page-data';

export default function PostDetail({ slug, initialData, initialLocale }: { slug: string; initialData: DetailResult<PostDetailData> | null; initialLocale: string }) {
  const { locale, t } = useLanguage();
  const { data: result, loading, failed: loadFailed, retry } = usePageData(
    initialData,
    initialLocale,
    (l) => getPostDetailData(slug, l),
    [slug],
  );
  const notFound = result?.status === "notFound";
  const payload = result?.status === "ok" ? result.data : null;
  const post = payload?.post ?? null;
  const allPosts = payload?.allPosts ?? [];


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
        message={t("This article didn't load. It's not you — try again.")}
        onRetry={retry}
        fallbackHref="/insights"
        fallbackLabel={t('All insights')}
      />
    );
  }

  if (notFound || !post) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display font-extrabold uppercase text-4xl mb-6">{t('Article not found')}</h1>
        <Link href="/insights" className="font-mono2 text-[11px] tracking-[0.25em] uppercase link-line">{t('All insights')}</Link>
      </section>
    );
  }

  const idx = allPosts.findIndex(p => p.slug === slug);
  const next = allPosts[(idx + 1) % allPosts.length];
  const postImage = getPostImage(post);

  return (
    <>
      <article>
        <header className="px-5 md:px-10 pt-32 md:pt-44 pb-12 max-w-5xl mx-auto">
          <Reveal>
            <Link href="/insights" className="inline-flex items-center gap-2 font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 rtl:hidden" /> <ArrowRight className="w-4 h-4 hidden rtl:block" /> {t('All insights')}
            </Link>
          </Reveal>
          <Reveal>
            <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/40 mb-5">
              {post.category} — {new Date(post.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </Reveal>
          <SplitWords
            as="h1"
            text={post.title}
            className="font-display font-black tracking-tight leading-[1.02] text-[8.5vw] md:text-[4vw]"
          />
        </header>

        <div className="px-5 md:px-10 max-w-5xl mx-auto pb-12">
          <Reveal>
            <div className="aspect-[16/8] overflow-hidden">
              <img src={postImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>

        <div className="px-5 md:px-10 max-w-3xl mx-auto pb-20 md:pb-28">
          <Reveal>
            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:text-white/65 prose-p:leading-relaxed prose-p:text-lg
                prose-a:text-white prose-a:underline prose-a:decoration-white/30 hover:prose-a:decoration-white
                prose-strong:text-white prose-strong:font-bold
                prose-li:text-white/65"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </Reveal>
          <Reveal className="pt-6 mt-10 border-t border-white/10">
            <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/40">
              {t('Written by Global Untold Story — Film Production Services, Egypt · UAE · KSA')}
            </p>
          </Reveal>
        </div>
      </article>

      <Link href={`/insights/${next.slug}`} className="group block border-t border-white/10">
        <div className="px-5 md:px-10 py-16 md:py-20 flex items-center justify-between gap-6 max-w-none">
          <div>
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">( {t('Next article')} )</p>
            <h2 className="font-display font-black tracking-tight leading-[1] text-[6.5vw] md:text-[3.2vw] group-hover:translate-x-3 rtl:group-hover:-translate-x-3 transition-transform duration-500">
              {next.title}
            </h2>
          </div>
          <Magnetic>
            <span className="w-14 h-14 md:w-20 md:h-20 rounded-full border border-white/25 flex items-center justify-center shrink-0 group-hover:bg-[#fafafa] group-hover:text-[#0a0a0a] transition-colors duration-500">
              <ArrowRight className="w-5 h-5 md:w-7 md:h-7 rtl:rotate-180" />
            </span>
          </Magnetic>
        </div>
      </Link>
    </>
  );
}

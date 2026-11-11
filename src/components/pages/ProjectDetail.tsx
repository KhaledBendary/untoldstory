"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/LocaleLink';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import Magnetic from '../Magnetic';
import RetryState from '../RetryState';
import { getProjectImage } from '@/lib/utils';
import type { PortfolioItem } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { renderCmsHtml } from '@/lib/seo';
import { fitTitleStyle } from '@/lib/title-fit';
import { usePageData } from '@/hooks/usePageData';
import { getProjectDetailData, type ProjectDetailData, type DetailResult } from '@/lib/page-data';
import { youTubeIds } from '@/lib/youtube';
import YouTubeFilm from '../YouTubeFilm';
import { projectFacts, PRODUCED_BY } from '@/data/project-facts';

const META_COLS: Record<number, string> = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };

/** "N/A", "-", "TBD" and blanks are placeholders, not facts. */
function hasValue(v?: string | null): v is string {
  const s = (v ?? '').trim();
  return s !== '' && !/^(n\s*\/?\s*a|-+|—|–|tbd|tba)$/i.test(s);
}

/**
 * The facts box under the project title. A field is shown only when it says
 * something: every project read "Duration: N/A" and most repeated the page
 * title as their "Metric", which reads as an empty template to visitors and
 * search engines alike.
 *
 * Projects with confirmed facts (src/data/project-facts.ts) show year,
 * location, our role, crew size and "Produced by" in place of Metric and
 * Duration, as the projects writing standard sets out.
 */
function projectMeta(project: PortfolioItem, t: (s: string) => string): [string, string][] {
  const same = (a?: string | null, b?: string | null) =>
    (a ?? '').trim().toLocaleLowerCase() === (b ?? '').trim().toLocaleLowerCase();
  const facts = projectFacts(project);
  const items: [string, string][] = [];
  if (facts?.client) items.push([t('Client'), t(facts.client)]);
  else if (hasValue(project.client)) items.push([t('Client'), project.client]);
  if (hasValue(project.category)) items.push([t('Category'), project.category]);
  if (facts) {
    items.push([t('Year'), facts.year]);
    items.push([t('Location'), t(facts.location)]);
    if (facts.role) items.push([t('Our role'), t(facts.role)]);
    if (facts.crew) items.push([t('Crew size'), String(facts.crew)]);
    items.push([t('Produced by'), PRODUCED_BY]);
    return items;
  }
  if (hasValue(project.metric) && !same(project.metric, project.title)) items.push([t('Metric'), project.metric]);
  if (hasValue(project.duration)) items.push([t('Duration'), project.duration]);
  return items;
}

export default function ProjectDetail({ slug, initialData, initialLocale }: { slug: string; initialData: DetailResult<ProjectDetailData> | null; initialLocale: string }) {
  const { locale, t, setSlugOverride } = useLanguage();
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

  // So the language switcher lands on THIS project's own slug in the target
  // locale, instead of reusing the current URL's slug under a new prefix.
  useEffect(() => {
    if (!project) return;
    setSlugOverride({ basePath: "/work", canonicalSlug: project.canonicalSlug ?? project.slug, slugs: project.slugs });
    return () => setSlugOverride(null);
  }, [project, setSlugOverride]);


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
  const metaItems = projectMeta(project, t);
  // The project's films on YouTube, from the dashboard's video-link field.
  // The first is the main film; any others sit under it, two to a row.
  const films = youTubeIds(project.video);

  return (
    <>

      {/* Hero */}
      <section className="relative h-[78svh] overflow-hidden">
        <Image src={getProjectImage(project)} alt={`${project.title} — ${project.category || ''} for ${project.client || ''}`} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-[#0a0a0a]/65" />
        <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10 pb-10 md:pb-14">
          <Reveal>
            <Link href="/work" className="inline-flex items-center gap-2 font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4 rtl:hidden" /> <ArrowRight className="w-4 h-4 hidden rtl:block" /> {t('All work')}
            </Link>
          </Reveal>
          <SplitWords
            as="h1"
            text={project.title}
            style={fitTitleStyle(project.title, { locale })}
            className="fit-title [--t-max:7.5vw] md:[--t-max:2.75vw] font-display heading-ar-spacious font-black uppercase tracking-tight leading-[0.95]"
          />
        </div>
      </section>

      {/* Meta */}
      <section className="px-5 md:px-10 py-14 md:py-20">
        {metaItems.length > 0 && (
          <div className={`grid grid-cols-2 ${META_COLS[metaItems.length] || 'md:grid-cols-4'} gap-8 border-y border-white/10 py-10 mb-14`}>
            {metaItems.map(([k, v]) => (
              <Reveal key={k}>
                <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-3">{k}</p>
                <p className="font-display font-bold text-lg md:text-xl uppercase">{v}</p>
              </Reveal>
            ))}
          </div>
        )}

        {films.length > 0 && (
          <Reveal className="mx-auto mb-14 max-w-6xl md:mb-20">
            <YouTubeFilm
              id={films[0]}
              title={project.title}
              playLabel={t('Play the film')}
              poster={getProjectImage(project)}
            />
            {films.length > 1 && (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {films.slice(1).map((id, i) => (
                  <YouTubeFilm key={id} id={id} title={`${project.title} (${i + 2})`} playLabel={t('Play the film')} />
                ))}
              </div>
            )}
          </Reveal>
        )}

        <div className="read-col">
          <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55">( {t('The brief & the build')} )</p>
          <SplitWords
            as="p"
            text={project.results || project.title}
            className="lead-text mt-6 font-display font-semibold leading-[1.4] text-xl md:text-2xl normal-case tracking-tight text-white/90"
          />
          {project.description && (
            <Reveal>
              <div
                className="cms-prose mt-10"
                dangerouslySetInnerHTML={{ __html: renderCmsHtml(project.description) }}
              />
            </Reveal>
          )}
          <Reveal className="mt-10 flex flex-wrap gap-3">
            {project.category && (
              <span className="font-mono2 text-[10px] tracking-[0.2em] uppercase border border-white/20 px-4 py-2 text-white/70">{project.category}</span>
            )}
          </Reveal>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-5 md:px-10 py-16 md:py-24 border-t border-white/10">
          <h2 className="font-display heading-ar-spacious font-extrabold uppercase tracking-tight text-2xl md:text-3xl mb-10">{t('Related productions')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(p => (
              <Link key={p.slug} href={`/work/${p.slug}`} className="group block">
                <div className="img-zoom relative aspect-[16/11] mb-4 bg-[#111]">
                  <Image src={getProjectImage(p)} alt={p.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                </div>
                <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/55 mb-2">{p.client}</p>
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
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55 mb-4">( {t('Next project')} )</p>
            <h2
              style={fitTitleStyle(next.title, { locale })}
              className="fit-title [--t-max:6.5vw] md:[--t-max:2.5vw] md:[--t-avail:calc(100vw_-_13rem)] font-display font-black uppercase tracking-tight leading-[0.95] group-hover:translate-x-3 rtl:group-hover:-translate-x-3 transition-transform duration-500"
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

"use client";

import { useEffect, useRef, useState } from 'react';
import Link from '@/components/LocaleLink';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, ArrowDown, ArrowRight } from 'lucide-react';
import Marquee from '../Marquee';
import Magnetic from '../Magnetic';
import { SplitWords, Reveal, LineReveal, EASE } from '../Reveal';
import { useSiteReady } from '../SiteContext';
import { useHydrated } from '@/hooks/useHydrated';
import { useLanguage } from '../LanguageContext';
import { getHomeDataSafe, fallbackHomeData, type HomeData } from '@/lib/home-data';
import { getServiceImage, getProjectImage, getPostImage } from '@/lib/utils';
import type { Service, PortfolioItem, BlogPost } from '@/types/api';

const HERO_VIDEO = '/videos/hero.webm';

/* ---------------- HERO (from API) ---------------- */
function Hero({ ready, hero }: { ready: boolean; hero: { badge?: string; headline1?: string; headline2?: string; headline3?: string; subtext?: string; cta1?: { label: string; href: string }; cta2?: { label: string; href: string }; image?: string } | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const [frameReady, setFrameReady] = useState(false);
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headline = t('Film & Video Production');
  const headline2 = t('Egypt & MENA');
  const showVideo = reduceMotion !== true;

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;
    video.loop = true;
    video.muted = true;
    const markReady = () => setFrameReady(true);
    const keepPlaying = () => {
      if (document.visibilityState !== "visible") return;
      if (video.paused) video.play().catch(() => {});
    };
    const restart = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    if (video.readyState >= 2) markReady();
    video.addEventListener("loadeddata", markReady);
    video.addEventListener("playing", markReady);
    video.addEventListener("ended", restart);
    video.addEventListener("pause", keepPlaying);
    document.addEventListener("visibilitychange", keepPlaying);
    video.play().catch(() => {});
    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("playing", markReady);
      video.removeEventListener("ended", restart);
      video.removeEventListener("pause", keepPlaying);
      document.removeEventListener("visibilitychange", keepPlaying);
    };
  }, [showVideo]);

  const line = (text: string, i: number) => (
    <span className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
      {hydrated ? (
        <motion.span
          className="block will-change-transform text-inherit"
          initial={{ y: '112%' }}
          animate={ready ? { y: '0%' } : {}}
          transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: EASE }}
        >
          {text}
        </motion.span>
      ) : (
        <span className="block text-inherit">{text}</span>
      )}
    </span>
  );

  return (
    <section ref={ref} className="relative h-[100svh] overflow-hidden">
      <motion.div className="absolute inset-0 bg-[#0a0a0a]" style={hydrated ? { y: imgY, scale: imgScale } : undefined}>
        {showVideo ? (
          <motion.video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={HERO_VIDEO}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onEnded={() => {
              const video = videoRef.current;
              if (!video) return;
              video.currentTime = 0;
              video.play().catch(() => {});
            }}
            aria-hidden
            initial={{ opacity: 0, scale: 1.08 }}
            animate={
              frameReady
                ? { opacity: 1, scale: 1, filter: 'brightness(0.75)' }
                : { opacity: 0, scale: 1.08 }
            }
            transition={{ duration: 0.8, ease: EASE }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0a0a0a]" />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/65" />

      <motion.div className="relative z-10 h-full flex flex-col justify-end px-5 md:px-10 pb-10 md:pb-14" style={hydrated ? { opacity: fade } : undefined}>
        {hydrated ? (
          <motion.div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 font-mono2 text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white/70"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
          >
            <span>( {hero?.badge || t('Film & Video Production')} )</span>
            <span className="hidden md:inline text-white/55">/</span>
            <span className="hidden md:inline">{t('Egypt — MENA — Worldwide')}</span>
          </motion.div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 font-mono2 text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-white/70">
            <span>( {hero?.badge || t('Film & Video Production')} )</span>
            <span className="hidden md:inline text-white/55">/</span>
            <span className="hidden md:inline">{t('Egypt — MENA — Worldwide')}</span>
          </div>
        )}

        <h1 className="font-display font-black uppercase leading-[0.88] tracking-[-0.02em] text-[8vw] sm:text-[7.5vw] md:text-[7vw] lg:text-[6.5vw] xl:text-[6vw] select-none">
          {line(headline, 0)}
          <span className="flex items-center gap-[0.15em]">
            {line(headline2, 1)}
            {hydrated ? (
              <motion.span
                className="hidden md:block font-mono2 font-normal text-[11px] tracking-[0.25em] normal-case text-white/60 max-w-[240px] leading-relaxed mt-[1vw]"
                initial={{ opacity: 0 }}
                animate={ready ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 1.2 }}
              >
                {t('Film, advertising, documentary services, content, post-production and marketing across Egypt, UAE and Saudi Arabia. From the region to the world')}
              </motion.span>
            ) : (
              <span className="hidden md:block font-mono2 font-normal text-[11px] tracking-[0.25em] normal-case text-white/60 max-w-[240px] leading-relaxed mt-[1vw]">
                {t('Film, advertising, documentary services, content, post-production and marketing across Egypt, UAE and Saudi Arabia. From the region to the world')}
              </span>
            )}
          </span>
        </h1>

        {hydrated ? (
          <motion.div
            className="mt-8 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
          >
            <Link href={hero?.cta1?.href || '/work'}>
              <Magnetic>
                <span className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-7 md:px-9 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors">
                  {hero?.cta1?.label || t('Our Work')} <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                </span>
              </Magnetic>
            </Link>
            <div className="flex items-center gap-3 font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/60">
              <span className="hidden sm:inline">{t('Scroll')}</span>
              <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                <ArrowDown className="w-4 h-4" />
              </motion.span>
            </div>
          </motion.div>
        ) : (
          <div className="mt-8 flex items-center justify-between">
            <Link href={hero?.cta1?.href || '/work'}>
              <Magnetic>
                <span className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-7 md:px-9 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors">
                  {hero?.cta1?.label || t('Our Work')} <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                </span>
              </Magnetic>
            </Link>
            <div className="flex items-center gap-3 font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/60">
              <span className="hidden sm:inline">{t('Scroll')}</span>
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}

/* ---------------- SERVICES LIST ---------------- */
function ServicesList({ services }: { services: Service[] }) {
  const [active, setActive] = useState<number | null>(null);
  const { t } = useLanguage();
  return (
    <section className="px-5 md:px-10 py-24 md:py-36">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">( {t('Services')} )</p>
          <SplitWords
            text={t("The idea comes first. Everything else follows.")}
            className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[7.5vw] md:text-[4.2vw]"
          />
        </div>
        <Link href="/services" className="hidden md:flex items-center gap-2 font-mono2 text-[11px] tracking-[0.25em] uppercase link-line shrink-0 mb-3">
          {t('All services')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="relative">
        <div className="hidden lg:block pointer-events-none fixed end-[6vw] top-1/2 -translate-y-1/2 z-40 w-[24vw] max-w-[420px]">
          <div className="relative aspect-[4/3] overflow-hidden">
            {services.map((s, i) => (
              <motion.div
                key={s.slug}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.12 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <Image
                  src={getServiceImage(s)}
                  alt={`${s.title} — Global Untold Story`}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ))}
            <div className="absolute inset-0 ring-1 ring-white/20" />
          </div>
        </div>

        <ul>
          {services.map((s, i) => (
            <li key={s.slug} className="border-t border-white/10 last:border-b">
              <Link
                href={`/services/${s.slug}`}
                className="group flex items-center gap-5 md:gap-10 py-5 md:py-7"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="font-mono2 text-[11px] text-white/55 w-8 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className={`font-display font-bold uppercase tracking-tight leading-none text-[6.4vw] md:text-[3.4vw] transition-all duration-500 ${active === i ? 'text-white rtl:-translate-x-3 md:rtl:-translate-x-6 translate-x-3 md:translate-x-6' : 'text-white/55'}`}>
                  {s.title}
                </span>
                <ArrowUpRight className={`ms-auto w-6 h-6 md:w-8 md:h-8 shrink-0 transition-all duration-500 rtl:-scale-x-100 ${active === i ? 'opacity-100 rotate-45' : 'opacity-20'}`} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- HORIZONTAL WORK ---------------- */
function workPriority(p: PortfolioItem) {
  const text = `${p.client || ''} ${p.title || ''} ${p.slug || ''}`.toLowerCase();
  if (/netflix|farag|farrag|catalog|casa/.test(text)) return 2;
  if (p.isFeatured) return 1;
  return 0;
}

function WorkScroll({ projects }: { projects: PortfolioItem[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const featured = [...projects]
    .sort((a, b) => workPriority(b) - workPriority(a))
    .slice(0, 7);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const dist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${dist()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => {
      // Unpin before unmount so the fixed pin spacer cannot leak onto the next route
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === section || section.contains(st.trigger as Node)) {
          st.kill(true);
        }
      });
    };
  }, [projects]);

  return null;
  /*
    SECTION COMMENTED OUT — "Selected work" / "Projects that speak" horizontal strip
    <section ref={sectionRef} className="relative h-[100svh] overflow-hidden bg-[#0d0d0d]">
    //   <div className="absolute top-0 left-0 right-0 z-10 px-5 md:px-10 pt-24 md:pt-28 flex items-end justify-between">
    //     <div>
    //       <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">( Selected work )</p>
    //       <h2 className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[9.5vw] md:text-[5vw]">
    //         Projects that <span className="text-outline">speak</span>
    //       </h2>
    //     </div>
    //     <Link href="/work" className="hidden md:flex items-center gap-2 font-mono2 text-[11px] tracking-[0.25em] uppercase link-line shrink-0 mb-2">
    //       View all <ArrowRight className="w-4 h-4" />
    //     </Link>
    //   </div>
    //
    //   <div ref={trackRef} className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center gap-6 md:gap-10 pl-5 md:pl-10 pr-[10vw] will-change-transform mt-8">
    //     {featured.map((p, i) => (
    //       <Link key={p.slug} href={`/work/${p.slug}`} className="group relative shrink-0 w-[78vw] sm:w-[52vw] md:w-[38vw] lg:w-[30vw]">
    //         <div className="img-zoom keep-color relative aspect-[4/5] bg-[#111]">
    //               <Image
    //                 src={getProjectImage(p)}
    //                 alt={p.title}
    //                 fill
    //                 className="object-cover keep-color"
    //                 loading="lazy"
    //               />
    //               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
    //               <span className="absolute top-4 left-4 font-mono2 text-[10px] tracking-[0.25em] text-white/70">
    //                 {String(i + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
    //               </span>
    //               <span className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/30 backdrop-blur-sm">
    //                 <ArrowUpRight className="w-4 h-4" />
    //               </span>
    //               <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
    //                 <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/60 mb-2">{p.client || p.category}</p>
    //                 <h3 className="font-display font-bold uppercase leading-tight text-xl md:text-2xl">{p.title}</h3>
    //               </div>
    //             </div>
    //       </Link>
    //     ))}
    //     <Link href="/work" className="group shrink-0 w-[60vw] sm:w-[30vw] md:w-[22vw] aspect-[4/5] border border-white/15 flex flex-col items-center justify-center gap-6 hover:bg-white hover:text-[#0a0a0a] transition-colors duration-500">
    //       <span className="font-display font-extrabold uppercase text-3xl md:text-4xl text-center leading-tight">All<br />Projects</span>
    //       <span className="w-14 h-14 rounded-full border border-current flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
    //         <ArrowUpRight className="w-5 h-5" />
    //       </span>
      </Link>
    </div>
    </section>
  */
}

/* ---------------- CLIENT LOGOS ---------------- */
const CLIENT_LOGO_ROWS = [
  { src: '/images/clients-row-5.png', w: 1702, h: 84 },
  { src: '/images/clients-row-1.png', w: 1463, h: 90 },
  { src: '/images/clients-row-6.png', w: 1527, h: 88 },
  { src: '/images/clients-row-2.png', w: 1479, h: 89 },
  { src: '/images/clients-row-3.png', w: 1631, h: 86 },
  { src: '/images/clients-row-4.png', w: 1660, h: 85 },
];

function ClientLogos({ stats }: { stats: Array<{ value: number; suffix: string; label: string }> }) {
  const { t } = useLanguage();
  return (
    <section className="py-24 md:py-36 border-t border-white/10">
      <div className="px-5 md:px-10 mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">( {t('Trusted by')} )</p>
          <SplitWords
            text={t('Our journey with the Titans')}
            className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[10vw] md:text-[5.5vw]"
          />
        </div>
        <Reveal className="font-mono2 text-[11px] tracking-[0.2em] uppercase text-white/50 md:text-right leading-loose">
          {stats[0]?.value || 50}+ {t('clients')}<br />{stats[1]?.value || 90}% {t('repeat business')}
        </Reveal>
      </div>

      <div className="mt-14 md:mt-20 border-t border-white/10 divide-y divide-white/10">
        {CLIENT_LOGO_ROWS.map((row, i) => (
          <Reveal key={row.src} delay={i * 0.06} className="relative w-full bg-[#0a0a0a]">
            <Image
              src={row.src}
              alt="Brands and platforms Global Untold Story has produced for"
              width={row.w}
              height={row.h}
              sizes="100vw"
              className="w-full h-auto"
              loading="lazy"
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- MANIFESTO ---------------- */
function Manifesto({
  manifesto,
}: {
  manifesto?: {
    badge?: string;
    title?: string;
    heading?: string;
    desc1?: string;
    desc2?: string;
    p1?: string;
    p2?: string;
  } | null;
}) {
  const { t } = useLanguage();

  const badgeText = manifesto?.badge || 'The studio';
  const titleText =
    manifesto?.title ||
    manifesto?.heading ||
    t("Every great story begins with the right creative partner, united by one belief. Every brand, every institution and every culture has a story worth telling.");
  const p1Text =
    manifesto?.desc1 ||
    manifesto?.p1 ||
    t("We choose our clients as carefully as they choose us. The strongest work begins with shared ambition, honest collaboration and the confidence to challenge one another when the story demands it.");
  const p2Text =
    manifesto?.desc2 ||
    manifesto?.p2 ||
    t("Not your regular vendors waiting for instructions. We arrive as creative partners prepared to question, contribute and take ownership.");

  return (
    <section className="px-5 md:px-10 py-24 md:py-36 border-t border-white/10">
      <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-8">( {t(badgeText)} )</p>
      <SplitWords
        as="h2"
        text={titleText}
        className="font-display font-bold uppercase tracking-tight leading-[1.02] text-[7.5vw] md:text-[4.2vw] max-w-[1200px]"
      />
      <div className="mt-10 md:mt-14 grid md:grid-cols-2 gap-8 max-w-4xl">
        <Reveal>
          <p className="text-white/60 leading-relaxed">
            {p1Text}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-white/60 leading-relaxed">
            {p2Text}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- PROCESS (from API) ---------------- */
function Process({ process }: { process: { badge?: string; title?: string; steps?: Array<{ step: string; title: string; desc: string }> } | null }) {
  const { t } = useLanguage();
  const steps = process?.steps || [
    { step: '1', title: t('Think & Align'), desc: t('Objectives, audiences, scope, feasibility and success criteria.') },
    { step: '2', title: t('Create'), desc: t('Concepts, scripts, treatments, formats and creative direction.') },
    { step: '3', title: t('Prepare'), desc: t('Budgets, schedules, crews, casting, locations, permits and technical planning.') },
    { step: '4', title: t('Produce'), desc: t('Film, photography, studio, live and on-ground execution.') },
    { step: '5', title: t('Finish'), desc: t('Editing, color, sound, motion, CGI, mastering and versioning.') },
    { step: '6', title: t('Localize & Amplify'), desc: t('Multi-language delivery, campaign adaptations, distribution and performance support.') },
    { step: '7', title: t('Grow'), desc: t('Launch, test, optimize and turn finished content into measurable audience and business momentum.') },
    { step: '8', title: t('Scale'), desc: t('Expand winning ideas across platforms, formats, markets and languages without losing creative consistency.') },
  ];

  return (
    <section className="px-5 md:px-10 py-24 md:py-36 bg-[#fafafa] text-[#0a0a0a]">
      <div className="flex items-end justify-between mb-12 md:mb-20">
        <div>
          <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a]/65 mb-4">( {process?.badge || t('Services')} )</p>
          <SplitWords
            text={process?.title || t('ENTER AT ANY STAGE LEAVE WITH ONE EPIC RESULT')}
            className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[8vw] md:text-[4.2vw]"
          />
        </div>
        <Link href="/contact" className="hidden md:flex items-center gap-2 font-mono2 text-[11px] tracking-[0.25em] uppercase link-line shrink-0 mb-3">
          {t('Get in touch')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#0a0a0a]/10 border border-[#0a0a0a]/10">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={i * 0.08} className="bg-[#fafafa]">
            <div className="group p-6 md:p-8 h-full flex flex-col min-h-[280px] md:min-h-[320px]">
              <div className="flex items-start justify-between">
                <span className="font-display font-black text-4xl md:text-5xl text-outline-dark leading-none">{String(i + 1).padStart(2, '0')}</span>
                <ArrowUpRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-500 rtl:-scale-x-100" />
              </div>
              <h3 className="font-display font-extrabold uppercase tracking-tight text-xl md:text-2xl mt-auto leading-tight">{s.title}</h3>
              <p className="mt-4 text-sm text-[#0a0a0a]/60 leading-relaxed">{s.desc}</p>
              <LineReveal className="mt-6 !opacity-30" />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- INSIGHTS ---------------- */
function InsightsTeaser({ posts }: { posts: BlogPost[] }) {
  const featuredPosts = posts.slice(0, 3);
  const { locale, t } = useLanguage();
  return (
    <section className="px-5 md:px-10 py-24 md:py-36">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">( {t('Insights')} )</p>
          <SplitWords
            text={t("Insights")}
            className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[9.5vw] md:text-[5.5vw]"
          />
        </div>
        <Link href="/insights" className="hidden md:flex items-center gap-2 font-mono2 text-[11px] tracking-[0.25em] uppercase link-line shrink-0 mb-3">
          {t('Insights')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {featuredPosts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.1}>
            <Link href={`/insights/${p.slug}`} className="group block">
              <div className="img-zoom relative aspect-[16/10] mb-5 bg-[#111]">
                <Image
                  src={getPostImage(p)}
                  alt={p.title}
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/55 mb-3">
                {p.category} — {new Date(p.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <h3 className="font-display font-bold text-xl md:text-2xl leading-snug group-hover:opacity-70 transition-opacity">{p.title}</h3>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- AWARDS (from API) ---------------- */
function Awards({ awards }: { awards: Array<{ icon: string; color: string; title: string; organization: string; yearLabel: string }> }) {
  const { t } = useLanguage();
  if (!awards?.length) return null;
  return (
    <section className="px-5 md:px-10 py-24 md:py-36 border-t border-white/10">
      <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-8">( {t('Services')} )</p>
      <SplitWords
        text={t("Thirteen crafts. One cycle.")}
        className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[9.5vw] md:text-[5.5vw]"
      />
      <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {awards.map((a, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="border border-white/10 p-6 md:p-8 hover:bg-white/5 transition-colors">
              {/* <span className="text-3xl md:text-4xl">{a.icon}</span> */}
              <h3 className="font-display font-bold uppercase text-xl md:text-2xl mt-4">{a.title}</h3>
              <p className="text-white/50 text-sm mt-2">{a.organization}</p>
              <span className="inline-block mt-3 font-mono2 text-[10px] tracking-[0.2em] uppercase text-white/55 border border-white/15 px-3 py-1">{a.yearLabel}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- BIG IMAGE BREAK ---------------- */
function ImageBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  return (
    <section ref={ref} className="relative h-[70vh] md:h-[90vh] overflow-hidden">
      <motion.div
        className="absolute inset-0 w-full h-[124%]"
        style={hydrated ? { y } : undefined}
      >
        <Image
          src="/images/film-production-abu-simbel.jpg"
          alt="Film production at Abu Simbel temple, Egypt — on-ground production services by Global Untold Story"
          fill
          className="object-cover"
          loading="lazy"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5 text-white">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/70 mb-6">
          {t('Some stories are greater than time.')}
        </p>
        <SplitWords
          text={t('THOUSANDS OF YEARS PASS.')}
          className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[10vw] md:text-[6vw]"
        />
        <SplitWords
          text={t('THE STORY REMAINS.')}
          className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[10vw] md:text-[6vw]"
        />
        <Reveal className="mt-6 max-w-3xl">
          <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/70">
            {t('Production support for documentaries, factual series and international crews filming Egypt’s history, culture and heritage.')}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- PAGE ---------------- */
export default function Home({ initialData, initialLocale }: { initialData: HomeData | null; initialLocale: string }) {
  const ready = useSiteReady();
  const { locale, t } = useLanguage();
  const [data, setData] = useState<HomeData>(initialData ?? fallbackHomeData());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && locale === initialLocale) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const next = await getHomeDataSafe(locale);
        if (!cancelled) setData(next);
      } catch (err) {
        console.error("Failed to fetch home data:", err);
        if (!cancelled) setData(fallbackHomeData());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [locale, initialData, initialLocale]);

  if (loading && !initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 font-mono2 text-sm">{t('Loading...')}</div>
      </div>
    );
  }

  return (
    <>
      <Hero ready={ready} hero={data.hero} />
      <Marquee duration={36} className="border-y border-white/10 py-5 md:py-6 bg-[#0a0a0a]">
        {['Film', 'Commercials', 'Documentaries', 'Corporate', 'Event Coverage', 'TV & Live', 'Podcast', 'Post-Production', 'Motion · CGI · AI', 'Localization', 'Photography'].map(label => (
          <span key={label} className="font-display font-extrabold uppercase tracking-tight text-3xl md:text-5xl mx-6 whitespace-nowrap">
            {t(label)} <span className="text-white/50 mx-2">—</span>
          </span>
        ))}
      </Marquee>
      <ClientLogos stats={data.stats} />
      <Manifesto manifesto={data.manifesto} />
      <ServicesList services={data.services} />
      <WorkScroll projects={data.projects} />
      <Awards awards={data.awards} />
      <Process process={data.process} />
      <InsightsTeaser posts={data.posts} />
      <ImageBreak />
    </>
  );
}

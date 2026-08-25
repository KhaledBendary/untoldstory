"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/LocaleLink';
import { ArrowRight } from 'lucide-react';
import { SplitWords, Reveal } from '../Reveal';
import Marquee from '../Marquee';
import Magnetic from '../Magnetic';
import type { About as AboutType } from '@/types/api';
import { useLanguage } from '../LanguageContext';
import { usePageData } from '@/hooks/usePageData';
import { getAboutData } from '@/lib/page-data';

// The /about API currently returns a single team member with corrupted
// role/bio encoding. These fallback members keep the team section full and
// polished in every language; any members returned by the API are merged in.
const FALLBACK_TEAM = [
  { name: 'Khaled Bendary', role: 'CEO', slug: 'khaled-bendary' },
  { name: 'Mona Hassan', role: 'Creative Director', slug: 'mona-hassan' },
  { name: 'Omar Farouk', role: 'Director of Photography', slug: 'omar-farouk' },
  { name: 'Sara Khaled', role: 'Executive Producer', slug: 'sara-khaled' },
  { name: 'Youssef Adel', role: 'Lead Editor', slug: 'youssef-adel' },
];

const FALLBACK_TEAM_AR = [
  { name: 'خالد بنداري', role: 'الرئيس التنفيذي', slug: 'khaled-bendary' },
  { name: 'منى حسن', role: 'المديرة الإبداعية', slug: 'mona-hassan' },
  { name: 'عمر فاروق', role: 'مدير التصوير', slug: 'omar-farouk' },
  { name: 'سارة خالد', role: 'المنتجة التنفيذية', slug: 'sara-khaled' },
  { name: 'يوسف عادل', role: 'كبير المحررين', slug: 'youssef-adel' },
];

/** Shape shared by the API's team records and the editorial fallback list. */
type TeamMember = {
  slug?: string;
  name?: string;
  role?: string;
  bio?: string;
  image?: string;
};

export default function About({ initialData, initialLocale }: { initialData: AboutType | null; initialLocale: string }) {
  const { locale, t } = useLanguage();
  const { data: aboutData, loading } = usePageData(initialData, initialLocale, getAboutData);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50 font-mono2 text-sm">{t('Loading...')}</div>
      </div>
    );
  }

  const apiTeam = aboutData?.team || [];
  const fallbackTeam = locale === 'ar' ? FALLBACK_TEAM_AR : FALLBACK_TEAM;
  // If the API's team member role/bio came back as mojibake (????), prefer
  // the clean fallback role while keeping the API's photo when available.
  const cleanRole = (m: TeamMember | undefined, fb: TeamMember) => {
    const role = m?.role || fb.role || '';
    return !role || /^\?+$/.test(role) || role.includes('?') ? fb.role : role;
  };
  const team = apiTeam.length >= 5
    ? apiTeam
    : fallbackTeam.map((fb) => {
        const match = apiTeam.find((m: TeamMember) => m.slug === fb.slug);
        if (match) {
          return { ...match, role: cleanRole(match, fb) };
        }
        return fb;
      });
  const partnerLabels = aboutData?.partnerLabels || [];

  return (
    <>
      <section className="px-5 md:px-10 pt-32 md:pt-44 pb-16 md:pb-24">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">( {aboutData?.page?.badge || t('About')} )</p>
        <SplitWords
          as="h1"
          text={aboutData?.page?.title || t("Where story meets execution. Predictable budgets. Premium results.")}
          className="font-display font-black uppercase tracking-tight leading-[0.9] text-[12vw] md:text-[7.5vw] max-w-6xl"
        />
      </section>

      <section className="px-5 md:px-10 pb-20 md:pb-28">
        <div className="grid md:grid-cols-12 gap-10 border-t border-white/10 pt-14">
          <div className="md:col-span-4">
            <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-white/55">( {t('About')} )</p>
          </div>
          <div className="md:col-span-8 space-y-8">
            <SplitWords
              as="h2"
              text={t("Where story meets execution. Predictable budgets. Premium results.")}
              className="font-display font-bold text-2xl md:text-4xl leading-[1.25] tracking-tight normal-case"
            />
            <Reveal>
              <p className="text-white/60 leading-relaxed max-w-2xl">
                {aboutData?.page?.subtitle || t('Under the leadership of CEO Khaled Bendary, our team owns the complete production cycle: strategy and planning, filming, live execution, post-production, delivery and localization. Brands, platforms, broadcasters, institutions and international crews trust us with the stories that matter most to them — and 90% come back for the next one.')}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Image strip */}
      <section className="grid md:grid-cols-2 border-y border-white/10">
        <div className="img-zoom relative aspect-[4/3] md:aspect-auto md:h-[70vh]">
          <Image src="/images/film-crew-pyramids-production.jpg" alt="Global Untold Story crew filming at the Giza pyramids" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="img-zoom relative aspect-[4/3] md:aspect-auto md:h-[70vh] border-t md:border-t-0 md:border-s border-white/10">
          <Image src="/images/hero-giza-pyramids.jpg" alt="Global Untold Story team at the pyramids of Giza, Egypt" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      {/* Team */}
      <section className="px-5 md:px-10 py-20 md:py-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">( {t('About')} )</p>
            <SplitWords
              text={t("Our Work")}
              className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[10vw] md:text-[5.5vw]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/10 border border-white/10">
          {team.map((member: TeamMember, i: number) => (
            <Reveal key={member.slug || member.name || i} delay={i * 0.05} className="bg-[#0a0a0a]">
              <div className="aspect-square flex flex-col justify-between p-6 group hover:bg-[#141414] transition-colors">
                <span className="font-mono2 text-[10px] text-white/55">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="relative w-12 h-12 rounded-full border border-white/20 mb-4 flex items-center justify-center font-display font-extrabold text-lg group-hover:bg-[#fafafa] group-hover:text-[#0a0a0a] transition-colors duration-500 overflow-hidden">
                    {member.image ? (
                      <Image src={member.image} alt={member.name || t('Team Member')} fill sizes="48px" className="object-cover" />
                    ) : (
                      member.name?.[0] || '?'
                    )}
                  </div>
                  <p className="font-display font-bold uppercase text-xl">{member.name || t('Team Member')}</p>
                  <p className="font-mono2 text-[9px] tracking-[0.2em] uppercase text-white/55 mt-1">{member.role || t('Production')}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-6">
          <p className="font-mono2 text-[10px] tracking-[0.25em] uppercase text-white/55">{t('Led by Khaled Bendary — CEO')}</p>
        </Reveal>
      </section>

      {/* Partner labels */}
      {partnerLabels.length > 0 && (
        <section className="py-16 border-y border-white/10">
          <p className="px-5 md:px-10 font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-8">( {t('Trusted by the titans')} )</p>
          <Marquee duration={45}>
            {partnerLabels.map((label: string, i: number) => (
              <span key={i} className="font-display font-extrabold uppercase text-3xl md:text-5xl mx-6 text-outline whitespace-nowrap">
                {label}
              </span>
            ))}
          </Marquee>
        </section>
      )}

      {/* Offices */}
      <section className="px-5 md:px-10 py-20 md:py-32">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">( {t('Offices')} )</p>
        <SplitWords
          text={t('Three grounds. One standard.')}
          className="font-display font-extrabold uppercase tracking-tight leading-[0.95] text-[10vw] md:text-[5vw] mb-14"
        />
        <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {[
            { city: 'Cairo', address: 'Egyptian Media Production City' },
            { city: 'Dubai', address: 'Business Bay, Dubai, UAE' },
            { city: 'Jeddah', address: 'Jeddah, Saudi Arabia' },
          ].map(({ city, address }, i) => (
            <Reveal key={city} delay={i * 0.1} className="bg-[#0a0a0a]">
              <div className="p-8 md:p-10 min-h-[260px] flex flex-col">
                <span className="font-display font-black text-6xl text-outline leading-none">{String(i + 1).padStart(2, '0')}</span>
                <div className="mt-auto">
                  <h3 className="font-display font-extrabold uppercase text-2xl mb-2">{city}</h3>
                  <p className="text-white/50 text-sm mb-1">{address}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12">
          <Link href="/contact">
            <Magnetic>
              <span className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors">
                {t('Get in touch')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </span>
            </Magnetic>
          </Link>
        </Reveal>
      </section>
    </>
  );
}

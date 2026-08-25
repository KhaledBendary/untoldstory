"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/LocaleLink';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import Marquee from './Marquee';
import Magnetic from './Magnetic';
import { Reveal, SplitWords } from './Reveal';
import type { Service, LayoutData } from '@/types/api';
import { useLanguage } from './LanguageContext';
import { usePageData } from '@/hooks/usePageData';
import { getShellData, type ShellData } from '@/lib/page-data';

const DEFAULT_SOCIAL = {
  instagram: 'https://www.instagram.com/globaluntoldstory',
  facebook: 'https://www.facebook.com/theuntoldstory.adv',
  linkedin: 'https://www.linkedin.com/company/the-untold-story-film-production-services/',
  vimeo: 'https://vimeo.com/user252566067',
};

export default function Footer({ initialData, initialLocale }: { initialData: ShellData | null; initialLocale: string }) {
  const { locale, t } = useLanguage();
  const { data } = usePageData(initialData, initialLocale, getShellData);
  const services = data?.services ?? [];
  const layout = data?.layout ?? null;

  const footer = layout?.footer;
  const siteConfig = layout?.site_config;
  const socialLinks = siteConfig?.socialLinks;

  return (
    <footer className="bg-[#fafafa] text-[#0a0a0a] relative">
      {/* CTA */}
      <div className="px-5 md:px-10 pt-20 md:pt-32 pb-14 md:pb-20">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-[#0a0a0a]/65 mb-6">( {t('Start a project')} )</p>
        <Link href="/contact" className="group block">
          <SplitWords
            as="h2"
            text={footer?.contactUs || t("Let's tell your untold story")}
            className="font-display font-extrabold uppercase tracking-tight leading-[0.92] text-[7.5vw] md:text-[8.5vw]"
          />
        </Link>
        <Reveal className="mt-8 flex items-center gap-4">
          <Magnetic>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 bg-[#0a0a0a] text-[#fafafa] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] transition-colors"
            >
              {t('Get in touch')} <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500 rtl:-scale-x-100" />
            </Link>
          </Magnetic>
          <a href={`mailto:${siteConfig?.email || 'bendary@globaluntoldstory.com'}`} className="hidden sm:inline font-mono2 text-[11px] tracking-[0.2em] uppercase link-line">
            {siteConfig?.email || 'bendary@globaluntoldstory.com'}
          </a>
        </Reveal>
      </div>

      {/* Marquee */}
      <Marquee duration={30} className="border-y border-[#0a0a0a]/10 py-5">
        {['Where story meets execution', 'Predictable budgets', 'Premium results', 'The complete production cycle'].map((item) => (
          <span key={item} className="font-display font-extrabold uppercase tracking-tight text-2xl md:text-4xl mx-6 text-[#0a0a0a]/90">
            {t(item)} <span className="text-[#0a0a0a]/30 mx-4">—</span>
          </span>
        ))}
      </Marquee>

      {/* Columns */}
      <div className="px-5 md:px-10 py-14 md:py-20 grid grid-cols-2 md:grid-cols-12 gap-10">
        <div className="col-span-2 md:col-span-4">
          <p className="text-sm text-[#0a0a0a]/60 max-w-xs leading-relaxed">
            {footer?.brandDesc || t('Full-service film, video and content production studio serving Egypt, MENA and clients worldwide.')}
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/65 mb-5">{footer?.aboutTitle || t('Menu')}</p>
          <ul className="space-y-2.5 text-sm">
            {(footer?.aboutLinks || [['/', 'Home'], ['/work', 'Work'], ['/services', 'Services'], ['/about', 'About'], ['/insights', 'Insights'], ['/contact', 'Contact']].map(([to, label]) => ({ href: to, label }))).map((l: { href: string; label: string }) => (
              <li key={l.href}><Link href={l.href} className="link-line">{t(l.label)}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/65 mb-5">{footer?.servicesTitle || t('Services')}</p>
          <ul className="space-y-2.5 text-sm">
            {services.slice(0, 7).map(s => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className="link-line">{s.title}</Link></li>
            ))}
            <li><Link href="/services" className="link-line text-[#0a0a0a]/65">{t('All services')} →</Link></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-3">
          <p className="font-mono2 text-[10px] tracking-[0.3em] uppercase text-[#0a0a0a]/65 mb-5">{t('Offices')}</p>
          <ul className="space-y-4 text-sm">
            {(footer?.offices || []).map((o: { region?: string; address?: string; phone?: string }, i: number) => (
              <li key={o.region || i}>
                <p className="font-medium">{o.region}</p>
                <p className="text-[#0a0a0a]/65 text-[13px]">{o.address}</p>
                {o.phone && (
                  <a href={`tel:${o.phone}`} className="text-[#0a0a0a]/70 link-line text-[13px]">{o.phone}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-5 md:px-10 py-6 border-t border-[#0a0a0a]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <p className="font-mono2 text-[10px] tracking-[0.2em] uppercase text-[#0a0a0a]/65">
          © {new Date().getFullYear()} {siteConfig?.name || 'Global Untold Story'}. {footer?.allRights || t('All rights reserved.')}
        </p>
        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          <Image src="/images/logo-black.png" alt="Global Untold Story" width={348} height={191} className="h-6 w-auto" />
          <div className="flex gap-5 font-mono2 text-[10px] tracking-[0.2em] uppercase">
            <a href={socialLinks?.instagram || DEFAULT_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="link-line">Instagram</a>
            <a href={socialLinks?.facebook || DEFAULT_SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="link-line">Facebook</a>
            <a href={socialLinks?.linkedin || DEFAULT_SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="link-line">LinkedIn</a>
            <a href={socialLinks?.vimeo || DEFAULT_SOCIAL.vimeo} target="_blank" rel="noopener noreferrer" className="link-line">Vimeo</a>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="flex items-center gap-2 font-mono2 text-[10px] tracking-[0.2em] uppercase hover:opacity-60 transition-opacity"
          >
            {t('Back to top')} <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}

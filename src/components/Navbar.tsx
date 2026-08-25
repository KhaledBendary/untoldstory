"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from '@/components/LocaleLink';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Globe, ChevronDown } from 'lucide-react';
import Magnetic from './Magnetic';
import { EASE } from './Reveal';
import type { LayoutData } from '@/types/api';
import { useLanguage, LANGUAGES } from './LanguageContext';
import { usePageData } from '@/hooks/usePageData';
import { getShellData, type ShellData } from '@/lib/page-data';

const DEFAULT_SOCIAL = {
  instagram: 'https://www.instagram.com/globaluntoldstory',
  facebook: 'https://www.facebook.com/theuntoldstory.adv',
  linkedin: 'https://www.linkedin.com/company/the-untold-story-film-production-services/',
  vimeo: 'https://vimeo.com/user252566067',
};

const LINKS = [
  { to: '/', label: 'Home', index: '01' },
  { to: '/work', label: 'Work', index: '02' },
  { to: '/services', label: 'Services', index: '03' },
  { to: '/about', label: 'About', index: '04' },
  { to: '/insights', label: 'Insights', index: '05' },
  { to: '/contact', label: 'Contact', index: '06' },
];

export default function Navbar({ initialData, initialLocale }: { initialData: ShellData | null; initialLocale: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { locale, changeLocale, t } = useLanguage();
  const { data } = usePageData(initialData, initialLocale, getShellData);
  const layout = data?.layout ?? null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const socialLinks = layout?.site_config?.socialLinks;
  const announcement = layout?.announcement;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-500 ${scrolled && !open ? 'bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/10' : ''}`}>
        {announcement?.enabled && (
          <div className="bg-[#fafafa] text-[#0a0a0a] text-center py-2 font-mono2 text-[10px] tracking-[0.2em] uppercase">
            {announcement.text}
          </div>
        )}
        <div className="flex items-center justify-between px-5 md:px-10 py-4 md:py-5">
          <Link href="/" onClick={() => setOpen(false)} aria-label="Global Untold Story — Home" className="relative z-[110]">
            <Image src="/images/logo-white.png" alt="Global Untold Story logo" width={348} height={191} priority className="h-7 md:h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/contact" onClick={() => setOpen(false)} className="hidden lg:inline-block font-mono2 text-[11px] tracking-[0.25em] uppercase link-line relative z-[110]">
              {t('Get a Quote')}
            </Link>

            {/* Language Selector Toggle */}
            <div className="relative z-[110]" ref={dropdownRef}>
              <Magnetic strength={0.3}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="Change language"
                  className="flex items-center gap-1.5 font-mono2 text-[11px] tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors py-2 px-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{locale}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </Magnetic>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} top-full mt-2 w-56 bg-[#0a0a0a]/95 border border-white/10 backdrop-blur-md shadow-2xl rounded-none`}
                  >
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 p-3 max-h-[70vh] overflow-y-auto">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLocale(lang.code);
                            setDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between font-mono2 text-[10px] tracking-widest py-2 px-2 hover:bg-white/5 transition-colors text-left ${
                            locale === lang.code ? 'text-white bg-white/10' : 'text-white/55'
                          }`}
                        >
                          <span className="uppercase font-bold">{lang.code}</span>
                          <span className="text-[9px] font-normal leading-none opacity-60 text-right">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Magnetic strength={0.4}>
              <button
                onClick={() => setOpen(!open)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="relative z-[110] flex items-center gap-3 group"
              >
                <span className="font-mono2 text-[11px] tracking-[0.25em] uppercase hidden sm:inline">
                  {open ? t('Close') : t('Menu')}
                </span>
                <span className="relative w-8 h-8 flex flex-col items-center justify-center gap-[6px]">
                  <span className={`block w-7 h-px bg-white transition-transform duration-300 origin-center ${open ? 'translate-y-[4px] rotate-45' : ''}`} />
                  <span className={`block w-7 h-px bg-white transition-transform duration-300 origin-center ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[105] bg-[#0a0a0a] flex flex-col"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="flex-1 flex flex-col justify-center px-5 md:px-10 pt-24">
              <nav aria-label="Main navigation">
                {LINKS.map((l, i) => (
                  <div key={l.to} className="overflow-hidden border-b border-white/10">
                    <motion.div
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '110%', transition: { duration: 0.4, delay: 0 } }}
                      transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: EASE }}
                    >
                      <Link
                        href={l.to}
                        onClick={() => setOpen(false)}
                        className={`group flex items-baseline gap-4 md:gap-8 py-2 md:py-3 transition-colors ${pathname === l.to ? 'text-white' : 'text-white/60 hover:text-white'}`}
                      >
                        <span className="font-mono2 text-[11px] tracking-[0.2em] text-white/55">{l.index}</span>
                        <span className="font-display menu-title-3rem font-extrabold uppercase tracking-tight leading-[0.95] text-[8vw] sm:text-6xl md:text-7xl lg:text-8xl group-hover:translate-x-3 rtl:group-hover:-translate-x-3 transition-transform duration-500">
                          {t(l.label)}
                        </span>
                        <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 md:w-10 md:h-10 self-center rtl:-scale-x-100" />
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </nav>
            </div>
            <motion.div
              className="px-5 md:px-10 pb-8 flex flex-col md:flex-row justify-between gap-4 font-mono2 text-[11px] tracking-[0.15em] uppercase text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <a href={`mailto:${layout?.site_config?.email || 'bendary@globaluntoldstory.com'}`} className="hover:text-white transition-colors">
                {layout?.site_config?.email || 'bendary@globaluntoldstory.com'}
              </a>
              <div className="flex gap-6">
                <a href={socialLinks?.instagram || DEFAULT_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                <a href={socialLinks?.facebook || DEFAULT_SOCIAL.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
                <a href={socialLinks?.linkedin || DEFAULT_SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
                <a href={socialLinks?.vimeo || DEFAULT_SOCIAL.vimeo} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Vimeo</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

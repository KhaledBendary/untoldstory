"use client";

import Link from 'next/link';
import Magnetic from '../Magnetic';
import { useLanguage } from '../LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">( {t('Error 404')} )</p>
        <h1 className="font-display font-black uppercase leading-[0.85] tracking-tight text-[28vw] md:text-[16vw] text-outline select-none">404</h1>
        <p className="font-display font-bold uppercase text-xl md:text-2xl -mt-4 md:-mt-8 mb-10">{t("This story hasn't been shot yet")}</p>
        <Link href="/">
          <Magnetic>
            <span className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors">
              {t('Back home')}
            </span>
          </Magnetic>
        </Link>
      </section>
    </>
  );
}

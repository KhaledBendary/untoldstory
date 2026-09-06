"use client";

import translations from '@/data/ui-translations.json';
import { createContext, useContext, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DEFAULT_LOCALE, isLocale, localeDir, localizedPath } from '@/lib/i18n';

export interface Language {
  code: string;
  name: string;
  dir: 'ltr' | 'rtl';
}

const ALL_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'it', name: 'Italiano', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'zh', name: '中文', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
  { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'pl', name: 'Polski', dir: 'ltr' },
  { code: 'sw', name: 'Kiswahili', dir: 'ltr' }
];

export const LANGUAGES = ALL_LANGUAGES;

export { translations };

interface LanguageContextProps {
  locale: string;
  dir: 'ltr' | 'rtl';
  changeLocale: (code: string) => void;
  /** Where this same page lives in another language. */
  localeHref: (code: string) => string;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  // The URL is the single source of truth. Reading it here (instead of
  // localStorage) means the server and the client agree on the language, so
  // the rendered HTML is the language the URL promises — which is what makes
  // the translated pages indexable at all.
  const { locale, bare } = useMemo(() => {
    const [, first, ...rest] = pathname.split('/');
    /*
     * Strip the prefix for English too. English is served unprefixed, but the
     * app route is [locale], so at prerender the pathname is "/en/services"
     * while in the browser it is "/services". Excluding the default locale
     * here left `bare` as "/en/services" during the build, and the language
     * links came out as "/ar/en/services". The locale is the same either way;
     * only `bare` was wrong, and only in the HTML the crawler reads.
     */
    if (isLocale(first)) {
      return { locale: first, bare: `/${rest.join('/')}`.replace(/\/$/, '') || '/' };
    }
    return { locale: DEFAULT_LOCALE, bare: pathname };
  }, [pathname]);

  /*
   * The switcher needs a real URL, not just a handler. It was a row of
   * <button onClick>, so the rendered HTML contained no link to any other
   * language: readers without JavaScript had no way across, and crawlers had
   * only the hreflang tags and the sitemaps to go on. Those do the job, but a
   * link is what the page should have been offering all along.
   */
  const localeHref = (code: string) => localizedPath(bare, code);

  const changeLocale = (code: string) => {
    if (!isLocale(code) || code === locale) return;
    router.push(localizedPath(bare, code));
  };

  const t = (key: string) => (translations as Record<string, Record<string, string>>)[locale]?.[key] || translations.en[key as keyof typeof translations.en] || key;

  return (
    <LanguageContext.Provider value={{ locale, dir: localeDir(locale), changeLocale, localeHref, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { locale, t } = useLanguage();
  return { t, locale };
}

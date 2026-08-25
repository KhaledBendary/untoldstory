"use client";

import Link from '@/components/LocaleLink';
import Magnetic from './Magnetic';
import { useLanguage } from './LanguageContext';

// Shown when a client-side data fetch fails after the ApiClient's built-in
// retries are exhausted (network blip, upstream 5xx, timeout). Distinct from
// a real "not found" page — the resource likely exists, the request just
// didn't land, and a manual retry (no full reload needed) usually clears it.
export default function RetryState({
  message = "We couldn't load this right now.",
  onRetry,
  fallbackHref,
  fallbackLabel,
}: {
  message?: string;
  onRetry: () => void;
  fallbackHref?: string;
  fallbackLabel?: string;
}) {
  const { t } = useLanguage();
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <p className="font-mono2 text-[11px] tracking-[0.3em] uppercase text-white/50 mb-6">
        ( {t('Something went wrong')} )
      </p>
      <h1 className="font-display font-black uppercase text-2xl md:text-4xl mb-10 max-w-xl">
        {message}
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Magnetic>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-3 bg-[#fafafa] text-[#0a0a0a] px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:bg-white transition-colors"
          >
            {t('Try again')}
          </button>
        </Magnetic>
        {fallbackHref && fallbackLabel && (
          <Link
            href={fallbackHref}
            className="inline-flex items-center gap-3 border border-white/20 px-8 py-4 font-mono2 text-[11px] tracking-[0.25em] uppercase hover:border-white/60 transition-colors"
          >
            {fallbackLabel}
          </Link>
        )}
      </div>
    </section>
  );
}

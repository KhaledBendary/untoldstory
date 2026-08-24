"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";

/**
 * Seeds a page from server-rendered data and only refetches when it has to.
 *
 * Pages used to fetch everything in a useEffect, which meant the HTML sent to
 * crawlers held no content at all. Now the server renders with the default
 * locale and passes the result in as `initialData`; the client refetches only
 * when the visitor switches language or asks to retry.
 */
export function usePageData<T>(
  initialData: T | null,
  initialLocale: string,
  fetcher: (locale: string) => Promise<T>,
  deps: unknown[] = [],
) {
  const { locale } = useLanguage();
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [failed, setFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  // Held in a ref so callers can pass an inline closure over `slug` without
  // re-running the effect on every render. Assigned in its own effect rather
  // than during render, which React forbids.
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const depsKey = JSON.stringify(deps);

  // What `data` currently holds. Starts at the server locale when the server
  // succeeded, so mounting costs no request — but switching away and back
  // still refetches, rather than leaving the other language's copy on screen.
  const loadedKeyRef = useRef(initialData ? `${initialLocale}|${depsKey}` : null);

  useEffect(() => {
    const key = `${locale}|${depsKey}`;
    if (loadedKeyRef.current === key && retryToken === 0) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        const next = await fetcherRef.current(locale);
        if (cancelled) return;
        setData(next);
        loadedKeyRef.current = key;
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load page data:", err);
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [locale, depsKey, retryToken]);

  return {
    data,
    loading,
    failed,
    retry: () => setRetryToken((n) => n + 1),
  };
}

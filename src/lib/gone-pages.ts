import { isLocale } from "@/lib/i18n";

/**
 * Pages removed for good. Their addresses answer 410 Gone (not 404, not a
 * redirect) so search engines drop them quickly.
 *
 * The 13 project pages that were built into the code from the previous site
 * (never in the CMS, never in the sitemap). Every one of them was also served
 * under each language prefix, so /de/work/<slug> is gone too.
 */
const GONE_PROJECT_SLUGS = new Set([
  "huawei-advertising-film",
  "la-casa-de-papel-promo-netflix",
  "a-corporate-film-apache-egypt",
  "adnoc-shared-services-gathering-uae-2025",
  "energy-operations-overview-enap-in-egypt",
  "a-corporate-story-engazat",
  "ilo-x-ue-documentary-film",
  "hamaki-haga-mestakhabeya-10-years-concert-live",
  "alliance-dubai-economy-tourism-corporate-event",
  "corporate-content-beauty-shots-engazat",
  "the-garage-abu-dhabi-fine-dining-brand-film",
  "tanashy-design-fashion-brand-promo",
  "apache-egypt-operations-community-impact",
]);

export function isGonePath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts.shift();
  if (parts.length !== 2 || parts[0] !== "work") return false;
  let slug = parts[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {}
  return GONE_PROJECT_SLUGS.has(slug.toLowerCase());
}

export const GONE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page removed | Global Untold Story</title></head><body style="font-family:Arial,sans-serif;max-width:560px;margin:15vh auto;padding:0 20px;color:#111"><h1 style="font-size:22px">This page has been removed</h1><p>This project is no longer on our website.</p><p><a href="/work">See our current work</a></p></body></html>`;

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

/**
 * CMS projects deleted on purpose, with every address they ever had: the
 * English slug, each language's slug, and the older translated slugs that used
 * to forward to them. Lowercase, NFC.
 *
 * Engazat Agricultural Irrigation Production in Egypt: deleted 12 Nov 2026 by
 * the owner (a duplicate of the Engazaat Dakhla documentary, no film).
 */
const DELETED_CMS_PROJECT_SLUGS = new Set([
  "antaj-alry-alzraay-fy-msr-mn-khlal-shrka-msharya",
  "engazat-agricultural-irrigation-production-in-egypt",
  "engazat-landwirtschaftliche-bewässerungsproduktion-in-ägypten",
  "engazat-이집트-농업-관개-영상-제작",
  "engazatエジプト農業灌漑映像制作",
  "engazat埃及农业灌溉项目制作",
  "misir-da-engazat-tarimsal-sulama-uretimi",
  "mısır-da-engazat-tarımsal-sulama-üretimi",
  "mısırda-engazat-tarımsal-sulama-üretimi",
  "producción-de-irrigación-agrícola-engazat-en-egipto",
  "producción-de-riego-agrícola-de-engazat-en-egipto",
  "production-d-irrigation-agricole-engazat-en-egypte",
  "production-d-irrigation-agricole-engazat-en-égypte",
  "production-dirrigation-agricole-engazat-en-égypte",
  "produkcja-nawadniania-rolniczego-engazat-w-egipcie",
  "produzione-di-irrigazione-agricola-engazat-in-egitto",
  "produção-de-irrigação-agrícola-da-engazat-no-egito",
  "produção-de-irrigação-agrícola-engazat-no-egito",
  "uzalishaji-wa-umwagiliaji-wa-kilimo-wa-engazat-nchini-misri",
  "производство-сельскохозяйственного-орошен",
  "производство-сельскохозяйственного-орошения-engazat-в-египте",
  "фильм-об-орошении-engazat-в-египте",
  "إنتاج-إنجازات-للري-الزراعي-في-مصر",
  "エンガザットの農業灌漑生産-エジプト",
  "埃及engazat农业灌溉生产",
  "이집트의-engazat-농업-관개-생산",
]);

export function isGonePath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0])) parts.shift();
  if (parts.length !== 2 || parts[0] !== "work") return false;
  let slug = parts[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {}
  slug = slug.normalize("NFC").toLowerCase();
  return GONE_PROJECT_SLUGS.has(slug) || DELETED_CMS_PROJECT_SLUGS.has(slug);
}

export const GONE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page removed | The Untold Story</title></head><body style="font-family:Arial,sans-serif;max-width:560px;margin:15vh auto;padding:0 20px;color:#111"><h1 style="font-size:22px">This page has been removed</h1><p>This project is no longer on our website.</p><p><a href="/work">See our current work</a></p></body></html>`;

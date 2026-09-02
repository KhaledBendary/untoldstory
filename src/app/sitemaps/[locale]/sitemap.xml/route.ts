import { collectRoutes } from "@/lib/sitemap-routes";
import { SITE_URL } from "@/lib/seo";
import { INDEXABLE_LOCALES, LOCALE_TAGS, DEFAULT_LOCALE, isIndexableLocale, localizedPath } from "@/lib/i18n";

/**
 * One sitemap per indexable language, at /sitemaps/<locale>/sitemap.xml.
 *
 * A single file covering every language makes a coverage problem hard to read:
 * when Search Console reports pages as not indexed, you cannot tell which
 * language they belong to. Split by locale, each report points at one file.
 *
 * Every <url> still carries the full hreflang cluster, so the alternates stay
 * intact whichever file Google reads first.
 */

export function generateStaticParams() {
  return INDEXABLE_LOCALES.map((locale) => ({ locale }));
}

export const dynamicParams = false;

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isIndexableLocale(locale)) return new Response("Not found", { status: 404 });

  const routes = await collectRoutes();

  const urls = routes.map((route) => {
    const loc = `${SITE_URL}${localizedPath(route.path, locale)}`;
    const alternates = INDEXABLE_LOCALES.map(
      (code) =>
        `    <xhtml:link rel="alternate" hreflang="${LOCALE_TAGS[code]}" href="${xmlEscape(`${SITE_URL}${localizedPath(route.path, code)}`)}"/>`,
    ).join("\n");

    return [
      "  <url>",
      `    <loc>${xmlEscape(loc)}</loc>`,
      route.lastModified ? `    <lastmod>${route.lastModified.toISOString()}</lastmod>` : null,
      `    <changefreq>${route.changeFrequency}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      alternates,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(`${SITE_URL}${localizedPath(route.path, DEFAULT_LOCALE)}`)}"/>`,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

import { SITE_URL } from "@/lib/seo";
import { INDEXABLE_LOCALES } from "@/lib/i18n";

/**
 * Sitemap index, pointing at one sitemap per indexable language.
 *
 * Stays at /sitemap.xml so the address already submitted to Search Console and
 * named in robots.txt keeps working — Google follows an index the same way it
 * reads a flat sitemap, and the per-language files are where coverage problems
 * become readable.
 */
export const dynamic = "force-static";

export function GET() {
  const now = new Date().toISOString();

  const entries = INDEXABLE_LOCALES.map((locale) =>
    [
      "  <sitemap>",
      `    <loc>${SITE_URL}/sitemaps/${locale}/sitemap.xml</loc>`,
      `    <lastmod>${now}</lastmod>`,
      "  </sitemap>",
    ].join("\n"),
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</sitemapindex>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

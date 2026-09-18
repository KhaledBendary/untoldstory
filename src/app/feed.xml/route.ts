import { getPosts } from "@/lib/db/repo";

/**
 * /feed.xml — RSS 2.0 for the Insights articles. Helps readers' feed apps,
 * content aggregators and some AI ingestion pipelines pick up new posts. Built
 * from the published posts (English canonical), newest first.
 */
export const dynamic = "force-dynamic";
export const revalidate = 3600;

const SITE = "https://globaluntoldstory.com";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export async function GET() {
  let items = "";
  try {
    const posts = await getPosts();
    const live = posts
      .filter((p) => p.status === "published")
      .sort((a, b) => {
        const da = a.published_at ? new Date(a.published_at).getTime() : 0;
        const db = b.published_at ? new Date(b.published_at).getTime() : 0;
        return db - da;
      });
    items = live
      .map((p) => {
        const title = (p.data?.title as Record<string, string> | undefined)?.en || p.slug;
        const excerpt = (p.data?.excerpt as Record<string, string> | undefined)?.en || "";
        const body = (p.data?.body as Record<string, string> | undefined)?.en || "";
        const desc = excerpt || strip(body).slice(0, 300);
        const url = `${SITE}/insights/${p.slug}`;
        const date = p.published_at ? new Date(p.published_at).toUTCString() : new Date().toUTCString();
        return `    <item>
      <title>${esc(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      ${p.category_slug ? `<category>${esc(p.category_slug)}</category>` : ""}
      <description>${esc(desc)}</description>
    </item>`;
      })
      .join("\n");
  } catch {
    items = "";
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Global Untold Story — Insights</title>
    <link>${SITE}/insights</link>
    <description>Articles on film and video production, storytelling and the MENA market from Global Untold Story.</description>
    <language>en</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}

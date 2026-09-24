import "server-only";
import { SITE_URL } from "./seo";
import { INDEXABLE_LOCALES, LOCALE_CODES, localizedPath } from "./i18n";

/**
 * IndexNow — tell Bing/Yandex/Seznam (and, through the shared protocol, others)
 * the moment a URL changes, instead of waiting for the next crawl.
 *
 * Set INDEXNOW_KEY to any 8–128 char hex-ish string. The same value is served
 * at /<key>.txt via the route below, and we pass keyLocation so search engines
 * can verify ownership. Without the key, this is a no-op — nothing breaks.
 *
 * Google does not use IndexNow; it's pinged for its own coverage separately
 * (Search Console / sitemap). This still covers a large slice of search traffic.
 */

const ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = new URL(SITE_URL).host;

export const indexNowConfigured = (): boolean => Boolean(process.env.INDEXNOW_KEY);

/** Absolute-ify a path or URL against the site origin. */
function toAbsolute(u: string): string {
  return u.startsWith("http") ? u : `${SITE_URL}${u.startsWith("/") ? u : `/${u}`}`;
}

/**
 * Submit up to 10,000 changed URLs. Best-effort: any failure is swallowed and
 * logged, never thrown, so publishing is never blocked by a ping.
 */
export async function pingIndexNow(urls: string[]): Promise<{ submitted: number; ok: boolean }> {
  const key = process.env.INDEXNOW_KEY;
  const list = [...new Set(urls.map(toAbsolute))].slice(0, 10_000);
  if (!key || list.length === 0) return { submitted: 0, ok: false };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `${SITE_URL}/indexnow-key.txt`,
        urlList: list,
      }),
    });
    if (!res.ok) {
      console.warn("IndexNow ping returned", res.status);
      return { submitted: list.length, ok: false };
    }
    return { submitted: list.length, ok: true };
  } catch (e) {
    console.warn("IndexNow ping failed:", (e as Error).message);
    return { submitted: list.length, ok: false };
  }
}

/** The public base path for a content type: how its slug maps onto a URL. */
const TYPE_PATH: Record<string, string> = {
  services: "/services",
  projects: "/work",
  posts: "/insights",
};

/**
 * The public URLs for one content item across every indexable locale — what
 * changed when a service/project/post is saved. Localized paths are built by the
 * same helper the site uses, so these match the real canonical URLs.
 */
export function contentUrls(type: string, slug: string): string[] {
  const base = TYPE_PATH[type];
  if (!base || !slug) return [];
  const path = `${base}/${slug}`;
  return INDEXABLE_LOCALES.map((loc) => toAbsolute(localizedPath(path, loc)));
}

/**
 * The relative public path for one content item across every site locale
 * (not just the indexable ones — a shell-language page still resolves and
 * needs the same redirect when a slug changes). Used to wire up 301s.
 */
export function contentPaths(type: string, slug: string): string[] {
  const base = TYPE_PATH[type];
  if (!base || !slug) return [];
  const path = `${base}/${slug}`;
  return LOCALE_CODES.map((loc) => localizedPath(path, loc));
}

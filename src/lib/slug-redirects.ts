import "server-only";
import { addRedirect } from "@/lib/db/repo";
import { localizedPath, DEFAULT_LOCALE } from "@/lib/i18n";

type Dict = Record<string, string>;

const BASE: Record<string, string> = { services: "/services", projects: "/work", posts: "/insights" };

/**
 * 301 from each locale's previous URL to its new one when that locale's slug
 * changes (manually, or because translation produced a native-script slug).
 * A locale with no slug yet was being served under the canonical English slug,
 * so that old URL is redirected too. Best-effort; takes effect on the next deploy.
 */
export async function addLocaleSlugRedirects(
  type: string,
  canonicalSlug: string,
  before: Dict | undefined,
  after: Dict | undefined,
): Promise<number> {
  const base = BASE[type];
  if (!base || !after) return 0;
  let added = 0;
  for (const [loc, next] of Object.entries(after)) {
    if (loc === DEFAULT_LOCALE || !next) continue;
    const previous = before?.[loc] || canonicalSlug;
    if (previous === next) continue;
    const from = localizedPath(`${base}/${previous}`, loc);
    const to = localizedPath(`${base}/${next}`, loc);
    try {
      await addRedirect(from, to);
      added++;
    } catch (e) {
      console.error("slug redirect failed:", from, "→", to, e);
    }
  }
  return added;
}

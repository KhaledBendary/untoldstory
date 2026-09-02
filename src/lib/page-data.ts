import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-client";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { POSTS as FALLBACK_POSTS, PROJECTS as FALLBACK_PROJECTS, SERVICES as FALLBACK_SERVICES } from "@/data/content";
import { POST_SLUG_ALIASES, POST_SLUGS_THAT_REDIRECT, legacyDestination, relatedPostSlugs, relatedServiceSlugs } from "@/lib/legacy-redirects";
import { isoPostDate } from "@/lib/dates";
import { postTranslation } from "@/data/post-translations";
import { isUnreadable, nameFromSlug } from "@/lib/seo";
import type { About, BlogPost, LayoutData, PortfolioItem, Service } from "@/types/api";

/**
 * Per-page data fetchers, written so the same function runs on the server
 * (during render, to produce crawlable HTML) and in the browser (after a
 * language switch). Each returns a plain serialisable object.
 */

/** Shape the editorial fallback list like an API Service so the UI is agnostic. */
export function mappedFallbackServices(): Service[] {
  return FALLBACK_SERVICES.map((s, i) => ({
    id: s.slug,
    slug: s.slug,
    icon: "",
    imageUrl: s.image,
    title: s.title,
    shortDesc: s.short,
    fullDesc: s.description,
    price: "",
    features: s.capabilities || [],
    capabilities: s.capabilities,
    isFeatured: i < 4,
    sortOrder: i,
  } as unknown as Service));
}

export function mappedFallbackProjects(): PortfolioItem[] {
  return FALLBACK_PROJECTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    client: p.client,
    image: p.image,
    category: p.categories[0],
    results: p.description,
    isFeatured: false,
  }));
}

/*
 * Give every record a title the page can print.
 *
 * Unreadable CMS text is dropped where it enters the app, which leaves the
 * Arabic portfolio records with no title at all — and the detail page then
 * rendered an empty <h1>. The metadata already reads a name out of the slug;
 * the visible heading has to come from the same place, or the page has a title
 * in the tab and nothing at the top.
 */
function withDisplayTitle<T extends { slug?: string; title?: string }>(record: T): T {
  return record.title ? record : { ...record, title: nameFromSlug(record.slug) };
}

function normalizeBlogPost(post: BlogPost): BlogPost {
  const iso = isoPostDate(post);
  return withDisplayTitle({ ...post, date: iso || post.date, publishedAt: iso || post.publishedAt });
}

/*
 * Two insights articles live in this repo rather than the CMS, so every locale
 * was serving them in English while the rest of the page around them was
 * translated. They were the only untranslated pages left in the seven locales
 * opened for indexing. The translations sit in post-translations.ts; a locale
 * with none keeps the English text, which is the honest fallback.
 */
function allMappedFallbackPosts(locale?: string): BlogPost[] {
  return FALLBACK_POSTS.map((p) => {
    const translated = locale ? postTranslation(p.slug, locale) : undefined;
    const title = translated?.title ?? p.title;
    const excerpt = translated?.excerpt ?? p.excerpt;
    const body = translated?.body ?? p.body;

    return {
      id: p.slug,
      slug: p.slug,
      title,
      excerpt,
      date: p.date,
      publishedAt: p.date,
      category: p.category,
      categorySlug: p.category.toLowerCase().replace(/\s+/g, "-"),
      authorName: "Global Untold Story",
      authorImage: null,
      featuredImage: p.image,
      body: Array.isArray(body) ? body.map((block) => `<p>${block}</p>`).join("") : String(body || ""),
      readTimeMinutes: 6,
      tags: [],
      isFeatured: false,
    };
  });
}

export function mappedFallbackPosts(locale?: string): BlogPost[] {
  const canonical = allMappedFallbackPosts(locale).map((p) => {
    const slug = POST_SLUG_ALIASES[p.slug];
    return slug && slug !== p.slug ? { ...p, id: slug, slug } : p;
  });
  return [...new Map(canonical.map((p) => [p.slug, p])).values()].filter(
    (p) => !POST_SLUGS_THAT_REDIRECT.has(p.slug),
  );
}

function findFallbackPost(slug: string, locale?: string) {
  const related = relatedPostSlugs(slug);
  return allMappedFallbackPosts(locale).find((p) => related.includes(p.slug));
}

function findFallbackService(slug: string) {
  const related = relatedServiceSlugs(slug);
  return mappedFallbackServices().find((s) => related.includes(s.slug));
}

export async function getServicesData(locale?: string): Promise<Service[]> {
  try {
    const list = await api.getServices(locale);
    return list?.length ? list : mappedFallbackServices();
  } catch (e) {
    console.error("Failed to fetch services:", e);
    return mappedFallbackServices();
  }
}

/*
 * The CMS holds this team's Arabic role and bio in a column that lost the
 * encoding, so they arrive as runs of "?". About.tsx already substitutes clean
 * copy at render, but it is a client component: the raw record still travelled
 * in the flight payload, shipping several kilobytes of corrupt text on every
 * Arabic page view. Drop the unusable fields here and the payload carries only
 * what is displayable — the component's existing fallback fills the gap.
 *
 * This masks broken data, it does not repair it. The Arabic role and bio need
 * re-entering in the CMS before the real text can appear.
 */
export async function getAboutData(locale?: string): Promise<About> {
  const about = await api.getAbout(locale);
  if (!Array.isArray(about?.team)) return about;

  return {
    ...about,
    team: about.team.map((member) => ({
      ...member,
      role: isUnreadable(member?.role) ? undefined : member?.role,
      bio: isUnreadable(member?.bio) ? undefined : member?.bio,
    })),
  };
}

export async function getInsightsData(locale?: string): Promise<BlogPost[]> {
  const extras = mappedFallbackPosts(locale);
  try {
    const data = await api.getBlogPosts({ page: 1, per_page: 50, locale });
    const items = (data?.items || []).map(normalizeBlogPost);
    const seen = new Set(items.map((p) => p.slug));
    return [...items, ...extras.filter((p) => !seen.has(p.slug))];
  } catch (e) {
    console.error("Failed to fetch insights:", e);
    return extras;
  }
}

export async function getWorkData(locale?: string): Promise<PortfolioItem[]> {
  try {
    const { items } = await api.getPortfolio({ per_page: 100, locale });
    return items?.length ? items.map(withDisplayTitle) : mappedFallbackProjects();
  } catch (e) {
    console.error("Failed to fetch work:", e);
    return mappedFallbackProjects();
  }
}

export type ContactData = { services: Service[]; layout: LayoutData | null };

export async function getContactData(locale?: string): Promise<ContactData> {
  try {
    const [services, layout] = await Promise.all([getServicesData(locale), api.getLayout(locale)]);
    return { services: services || [], layout: layout ?? null };
  } catch (e) {
    console.error("Failed to fetch contact data:", e);
    return { services: mappedFallbackServices(), layout: null };
  }
}

/** Server render must degrade to a client fetch, never crash the page. */
export async function safeFetch<T>(load: () => Promise<T>, label: string): Promise<T | null> {
  try {
    return await load();
  } catch (e) {
    console.error(`Server fetch failed (${label}):`, e);
    return null;
  }
}

/* -------------------------------------------------------------------------
 * Detail pages
 *
 * A real 404 from the API means the record doesn't exist and the visitor
 * should see "not found". Anything else (5xx, timeout) is transient and gets a
 * retry, so the two are kept apart here rather than collapsed into one error.
 * ---------------------------------------------------------------------- */

export type DetailResult<T> = { status: "ok"; data: T } | { status: "notFound" };

async function asDetail<T>(load: () => Promise<T>): Promise<DetailResult<T>> {
  try {
    return { status: "ok", data: await load() };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return { status: "notFound" };
    throw e;
  }
}

export type ServiceDetailData = {
  service: Service;
  allServices: Service[];
  relatedProjects: PortfolioItem[];
};

export function getServiceDetailData(slug: string, locale?: string) {
  return asDetail<ServiceDetailData>(async () => {
    const [service, allServices, portfolio] = await Promise.all([
      api.getServiceBySlug(slug, locale),
      api.getServices(locale),
      api.getPortfolio({ per_page: 100, locale }),
    ]);

    const firstWord = (value?: string) => (value || "").split(" ")[0].toLowerCase();
    const relatedProjects = (portfolio.items || [])
      .filter((p) =>
        p.category && service.title && (
          p.category.toLowerCase().includes(firstWord(service.title)) ||
          service.title.toLowerCase().includes(firstWord(p.category))
        ),
      )
      .slice(0, 3);

    return { service, allServices: allServices || [], relatedProjects };
  });
}

export type ProjectDetailData = { project: PortfolioItem; allProjects: PortfolioItem[] };

export function getProjectDetailData(slug: string, locale?: string) {
  return asDetail<ProjectDetailData>(async () => {
    const [project, portfolio] = await Promise.all([
      api.getPortfolioBySlug(slug, locale),
      api.getPortfolio({ per_page: 100, locale }),
    ]);
    return { project: withDisplayTitle(project), allProjects: (portfolio.items || []).map(withDisplayTitle) };
  });
}

export type PostDetailData = { post: BlogPost; allPosts: BlogPost[] };

export function getPostDetailData(slug: string, locale?: string) {
  return asDetail<PostDetailData>(async () => {
    const [post, blog] = await Promise.all([
      api.getBlogPostBySlug(slug, locale),
      api.getBlogPosts({ page: 1, per_page: 50, locale }),
    ]);
    return { post: normalizeBlogPost(post), allPosts: (blog?.items || []).map(normalizeBlogPost) };
  });
}

/* -------------------------------------------------------------------------
 * Last-resort lookups
 *
 * When a per-slug request fails (the upstream API returns 500s under the load
 * of a full build), fall back to the *list* endpoint rather than the editorial
 * snapshot in data/content.ts — the list is already in Next's data cache, and
 * its slugs are by definition current, whereas the snapshot's had drifted and
 * matched nothing, which is what left pages on default metadata.
 * ---------------------------------------------------------------------- */

export async function findServiceInList(slug: string, locale?: string): Promise<Service | null> {
  try {
    return (await api.getServices(locale))?.find((s) => s.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function findProjectInList(slug: string, locale?: string): Promise<PortfolioItem | null> {
  try {
    const { items } = await api.getPortfolio({ per_page: 100, locale });
    const found = items?.find((p) => p.slug === slug);
    return found ? withDisplayTitle(found) : null;
  } catch {
    return null;
  }
}

export async function findPostInList(slug: string, locale?: string): Promise<BlogPost | null> {
  try {
    const data = await api.getBlogPosts({ page: 1, per_page: 50, locale });
    return data?.items?.find((p) => p.slug === slug) ?? null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------
 * Server-render fallbacks
 *
 * If the per-slug request exhausts its retries, the page used to hand the
 * client a null and render a spinner — HTML with no <h1> and no copy, which is
 * precisely the state crawlers must never see. The list endpoints are cached
 * and carry enough for a real page, so build the payload from those instead.
 * ---------------------------------------------------------------------- */

/**
 * Try the requested language, then the default. A translated page showing the
 * English record still carries the headline, the copy and the <h1>; an empty
 * page carries nothing and is the one outcome worth avoiding.
 */
function localeChain(locale?: string): string[] {
  return locale && locale !== DEFAULT_LOCALE ? [locale, DEFAULT_LOCALE] : [DEFAULT_LOCALE];
}

export async function serviceDetailWithFallback(
  slug: string,
  locale?: string,
): Promise<DetailResult<ServiceDetailData> | null> {
  const direct = await safeFetch(() => getServiceDetailData(slug, locale), `service:${slug}`);
  if (direct?.status === "ok") return direct;

  for (const attempt of localeChain(locale)) {
    const [service, allServices] = await Promise.all([
      findServiceInList(slug, attempt),
      getServicesData(attempt),
    ]);
    if (service) return { status: "ok", data: { service, allServices, relatedProjects: [] } };
  }
  const fallback = findFallbackService(slug);
  if (fallback) {
    return { status: "ok", data: { service: fallback, allServices: mappedFallbackServices(), relatedProjects: [] } };
  }
  return direct ?? null;
}

export async function projectDetailWithFallback(
  slug: string,
  locale?: string,
): Promise<DetailResult<ProjectDetailData> | null> {
  const direct = await safeFetch(() => getProjectDetailData(slug, locale), `project:${slug}`);
  if (direct?.status === "ok") return direct;

  for (const attempt of localeChain(locale)) {
    const project = await findProjectInList(slug, attempt);
    if (!project) continue;
    const allProjects = await safeFetch(() => getWorkData(attempt), "work-list");
    return { status: "ok", data: { project, allProjects: allProjects ?? [project] } };
  }
  const fallback = mappedFallbackProjects().find((p) => p.slug === slug);
  if (fallback) {
    return { status: "ok", data: { project: fallback, allProjects: mappedFallbackProjects() } };
  }
  return direct ?? null;
}

export async function postDetailWithFallback(
  slug: string,
  locale?: string,
): Promise<DetailResult<PostDetailData> | null> {
  const direct = await safeFetch(() => getPostDetailData(slug, locale), `post:${slug}`);
  if (direct?.status === "ok") return direct;

  for (const attempt of localeChain(locale)) {
    const post = await findPostInList(slug, attempt);
    if (!post) continue;
    const allPosts = await safeFetch(() => getInsightsData(attempt), "insights-list");
    return { status: "ok", data: { post, allPosts: allPosts ?? [post] } };
  }
  const fallback = findFallbackPost(slug, locale);
  if (fallback) return { status: "ok", data: { post: fallback, allPosts: mappedFallbackPosts(locale) } };
  return direct ?? null;
}

/* Same locale chain the page bodies use, so metadata degrades identically
 * instead of dropping to the site-wide default title. */

export async function findServiceAnyLocale(slug: string, locale?: string) {
  for (const attempt of localeChain(locale)) {
    const found = await findServiceInList(slug, attempt);
    if (found) return found;
  }
  return null;
}

export async function findProjectAnyLocale(slug: string, locale?: string) {
  for (const attempt of localeChain(locale)) {
    const found = await findProjectInList(slug, attempt);
    if (found) return found;
  }
  return null;
}

export async function findPostAnyLocale(slug: string, locale?: string) {
  for (const attempt of localeChain(locale)) {
    const found = await findPostInList(slug, attempt);
    if (found) return found;
  }
  return findFallbackPost(slug) ?? null;
}

/**
 * Navigation and footer content.
 *
 * The Navbar and Footer each ran their own client fetch on every page — three
 * requests after hydration (layout twice, services once) before the menu and
 * footer could show anything. Fetched on the server instead, the shell arrives
 * complete in the HTML and those round trips disappear.
 */
export type ShellData = { layout: LayoutData | null; services: Service[] };

/*
 * Point CMS-authored links at the URL they end up on.
 *
 * The footer menu comes from the CMS, and the CMS still held "/portfolio" from
 * the WordPress site — so every page linked to a 301 rather than to /work, on
 * eighty pages across both languages. The middleware caught the hop and the
 * visitor arrived, but an internal link should never spend a redirect: it slows
 * the click and it makes Google discover the site through URLs that are meant
 * to be retired.
 *
 * Rewriting through the same table the redirects use fixes the whole class,
 * not just the one link, and costs nothing when a link is already current.
 * Fragments are kept: /services#slug maps as /services and gets its hash back.
 */
function currentHref(href: unknown): string | undefined {
  if (typeof href !== "string" || !href.startsWith("/")) return typeof href === "string" ? href : undefined;
  const [path, hash] = href.split("#");
  const destination = legacyDestination(path);
  return destination ? `${destination}${hash ? `#${hash}` : ""}` : href;
}

function withCurrentLinks(layout: LayoutData | null): LayoutData | null {
  if (!layout?.footer) return layout;
  const fix = (links: unknown) =>
    Array.isArray(links)
      ? links.map((link) =>
          link && typeof link === "object" ? { ...link, href: currentHref((link as { href?: unknown }).href) } : link,
        )
      : links;

  return {
    ...layout,
    footer: {
      ...layout.footer,
      aboutLinks: fix(layout.footer.aboutLinks) as LayoutData["footer"]["aboutLinks"],
      serviceLinks: fix(layout.footer.serviceLinks) as LayoutData["footer"]["serviceLinks"],
    },
  };
}

export async function getShellData(locale?: string): Promise<ShellData> {
  const [layout, services] = await Promise.all([
    safeFetch(() => api.getLayout(locale), "layout"),
    safeFetch(() => getServicesData(locale), "shell-services"),
  ]);
  return { layout: withCurrentLinks(layout ?? null), services: services ?? [] };
}

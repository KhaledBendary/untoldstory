import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-client";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { SERVICES as FALLBACK_SERVICES } from "@/data/content";
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

export async function getServicesData(locale?: string): Promise<Service[]> {
  try {
    return (await api.getServices(locale)) || [];
  } catch (e) {
    console.error("Failed to fetch services:", e);
    return mappedFallbackServices();
  }
}

export async function getAboutData(locale?: string): Promise<About> {
  return api.getAbout(locale);
}

export async function getInsightsData(locale?: string): Promise<BlogPost[]> {
  const data = await api.getBlogPosts({ page: 1, per_page: 20, locale });
  return data?.items || [];
}

export async function getWorkData(locale?: string): Promise<PortfolioItem[]> {
  // /home's work_showcase.projects is a stripped-down shape (no client, video,
  // results, categorySlug). /portfolio carries the fields this grid filters by.
  const { items } = await api.getPortfolio({ per_page: 100, locale });
  return items || [];
}

export type ContactData = { services: Service[]; layout: LayoutData | null };

export async function getContactData(locale?: string): Promise<ContactData> {
  const [services, layout] = await Promise.all([api.getServices(locale), api.getLayout(locale)]);
  return { services: services || [], layout: layout ?? null };
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
    return { project, allProjects: portfolio.items || [] };
  });
}

export type PostDetailData = { post: BlogPost; allPosts: BlogPost[] };

export function getPostDetailData(slug: string, locale?: string) {
  return asDetail<PostDetailData>(async () => {
    const [post, blog] = await Promise.all([
      api.getBlogPostBySlug(slug, locale),
      api.getBlogPosts({ page: 1, per_page: 50, locale }),
    ]);
    return { post, allPosts: blog?.items || [] };
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
    return items?.find((p) => p.slug === slug) ?? null;
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
  if (direct) return direct;

  for (const attempt of localeChain(locale)) {
    const [service, allServices] = await Promise.all([
      findServiceInList(slug, attempt),
      getServicesData(attempt),
    ]);
    if (service) return { status: "ok", data: { service, allServices, relatedProjects: [] } };
  }
  return null;
}

export async function projectDetailWithFallback(
  slug: string,
  locale?: string,
): Promise<DetailResult<ProjectDetailData> | null> {
  const direct = await safeFetch(() => getProjectDetailData(slug, locale), `project:${slug}`);
  if (direct) return direct;

  for (const attempt of localeChain(locale)) {
    const project = await findProjectInList(slug, attempt);
    if (!project) continue;
    const allProjects = await safeFetch(() => getWorkData(attempt), "work-list");
    return { status: "ok", data: { project, allProjects: allProjects ?? [project] } };
  }
  return null;
}

export async function postDetailWithFallback(
  slug: string,
  locale?: string,
): Promise<DetailResult<PostDetailData> | null> {
  const direct = await safeFetch(() => getPostDetailData(slug, locale), `post:${slug}`);
  if (direct) return direct;

  for (const attempt of localeChain(locale)) {
    const post = await findPostInList(slug, attempt);
    if (!post) continue;
    const allPosts = await safeFetch(() => getInsightsData(attempt), "insights-list");
    return { status: "ok", data: { post, allPosts: allPosts ?? [post] } };
  }
  return null;
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
  return null;
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

export async function getShellData(locale?: string): Promise<ShellData> {
  const [layout, services] = await Promise.all([
    safeFetch(() => api.getLayout(locale), "layout"),
    safeFetch(() => getServicesData(locale), "shell-services"),
  ]);
  return { layout: layout ?? null, services: services ?? [] };
}

import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-client";
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

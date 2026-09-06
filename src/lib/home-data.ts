import { api } from "@/lib/api";
import type { BlogPost, PortfolioItem, Service } from "@/types/api";
import { mappedFallbackPosts, mappedFallbackProjects, mappedFallbackServices } from "@/lib/page-data";

/**
 * Home page payload, assembled from four endpoints.
 *
 * Lives outside the component so the server can build it during render and hand
 * it to <Home> as `initialData`. Before this, the whole page was fetched in a
 * useEffect, so the HTML search engines received contained no page content at
 * all — no headline, no services, no h1.
 */
/*
 * The homepage lists names and pictures; it never renders a body.
 *
 * These were the full records. Each service carries its complete article in
 * `fullDesc` — thousands of words, up to 45 kb apiece — and all thirteen were
 * serialised into the homepage to render thirteen links, alongside every
 * project and post in full. The page came to 1.2 mb of HTML for about 4 kb of
 * visible text.
 *
 * Narrowed to exactly what the three sections read. Adding a field to a card
 * means adding it here too, which is the point: the cost of shipping it is
 * visible at the place you decide to.
 */
export type HomeService = Pick<Service, "slug" | "title" | "imageUrl">;
export type HomeProject = Pick<PortfolioItem, "slug" | "title" | "client" | "category" | "image" | "img">;
export type HomePost = Pick<BlogPost, "slug" | "title" | "category" | "featuredImage" | "date" | "publishedAt">;

export type HomeData = {
  services: HomeService[];
  projects: HomeProject[];
  posts: HomePost[];
  stats: Array<{ value: number; suffix: string; label: string }>;
  clients: Array<{ name: string; displayName: string }>;
  hero: {
    badge?: string;
    headline1?: string;
    headline2?: string;
    headline3?: string;
    subtext?: string;
    cta1?: { label: string; href: string };
    cta2?: { label: string; href: string };
    image?: string;
  } | null;
  manifesto: {
    badge?: string;
    title?: string;
    heading?: string;
    desc1?: string;
    desc2?: string;
    p1?: string;
    p2?: string;
  } | null;
  process: { badge?: string; title?: string; steps?: Array<{ step: string; title: string; desc: string }> } | null;
  awards: Array<{ icon: string; color: string; title: string; organization: string; yearLabel: string }>;
};

export function parseStatValue(value: string | number) {
  if (typeof value === "number") return { num: value, suffix: "" };
  const match = value.match(/^(\d+)(.*)$/);
  if (match) return { num: parseInt(match[1], 10), suffix: match[2] };
  return { num: 0, suffix: value };
}

function valueOf<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === "fulfilled" ? result.value : undefined;
}

export async function getHomeData(locale?: string): Promise<HomeData> {
  const [homeResult, servicesResult, layoutResult, portfolioResult] = await Promise.allSettled([
    api.getHome(locale),
    api.getServices(locale),
    api.getLayout(locale),
    api.getPortfolio({ per_page: 100, locale }),
  ]);

  const homeData = valueOf(homeResult);
  const servicesData = valueOf(servicesResult);
  const layoutData = valueOf(layoutResult);
  const portfolioData = valueOf(portfolioResult);

  if (!homeData && !servicesData && !layoutData && !portfolioData) {
    throw new Error("All homepage API endpoints failed");
  }

  const home = (homeData || {}) as NonNullable<typeof homeData> & {
    manifesto?: HomeData["manifesto"];
    studio?: HomeData["manifesto"];
    home_data?: HomeData["manifesto"];
    stats?: Array<{ value: string | number; label: string }>;
    blog_preview?: HomeData["posts"];
    hero?: HomeData["hero"];
    process?: HomeData["process"];
    awards?: HomeData["awards"];
  };

  const stats = (home.stats || []).map((stat) => {
    const { num, suffix } = parseStatValue(stat.value);
    return { value: num, suffix: suffix || "", label: stat.label };
  });

  return {
    services: (servicesData || []).map(toHomeService),
    projects: (portfolioData?.items || []).map(toHomeProject),
    posts: (home.blog_preview || []).map(toHomePost),
    stats,
    clients: layoutData?.client_logos || [],
    hero: home.hero || null,
    manifesto: home.manifesto || home.studio || home.home_data || null,
    process: home.process || null,
    awards: home.awards || [],
  };
}

/* Keep only the fields the homepage cards actually read. */
const toHomeService = (s: Service): HomeService => ({ slug: s.slug, title: s.title, imageUrl: s.imageUrl });
const toHomeProject = (p: PortfolioItem): HomeProject =>
  ({ slug: p.slug, title: p.title, client: p.client, category: p.category, image: p.image, img: p.img });
const toHomePost = (p: BlogPost): HomePost =>
  ({ slug: p.slug, title: p.title, category: p.category, featuredImage: p.featuredImage,
     date: p.date || p.publishedAt, publishedAt: p.publishedAt || p.date });

/** Server render must never take the whole page down over an API blip. */
export function fallbackHomeData(locale?: string): HomeData {
  return {
    services: mappedFallbackServices().map(toHomeService),
    projects: mappedFallbackProjects().map(toHomeProject),
    posts: mappedFallbackPosts(locale).map(toHomePost),
    // Mirrors what the CMS serves, so a fallback render says the same thing
    // the live page does rather than a quietly different pair of numbers.
    // Mirrors what the CMS serves, so a fallback render says the same thing the
    // live page does rather than a quietly different pair of numbers. It used
    // to read 3 offices and 90% — and the homepage paired that 3 with the word
    // "clients".
    stats: [
      { value: 50, suffix: "+", label: "Satisfied clients" },
      { value: 90, suffix: "%", label: "Repeat business rate" },
    ],
    clients: [],
    hero: {
      badge: "Film & Video Production",
      headline1: "Film & Video Production",
      headline2: "Egypt & MENA",
      subtext: "Full-service film, video and content production across Egypt, UAE and Saudi Arabia.",
      cta1: { label: "Our Work", href: "/work" },
      cta2: { label: "Get a Quote", href: "/contact" },
      image: "/images/on-ground-production-giza.jpg",
    },
    manifesto: null,
    process: null,
    awards: [],
  };
}

export async function getHomeDataSafe(locale?: string): Promise<HomeData> {
  try {
    const data = await getHomeData(locale);
    if (!data.services.length) data.services = mappedFallbackServices().map(toHomeService);
    if (!data.projects.length) data.projects = mappedFallbackProjects().map(toHomeProject);
    if (!data.posts.length) data.posts = mappedFallbackPosts(locale).map(toHomePost);
    return data;
  } catch (e) {
    console.error("Failed to fetch home data on the server:", e);
    return fallbackHomeData(locale);
  }
}

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
export type HomeData = {
  services: Service[];
  projects: PortfolioItem[];
  posts: BlogPost[];
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
    services: servicesData || [],
    projects: portfolioData?.items || [],
    posts: (home.blog_preview || []).map((post) => ({
      ...post,
      date: post.date || post.publishedAt,
      publishedAt: post.publishedAt || post.date,
    })),
    stats,
    clients: layoutData?.client_logos || [],
    hero: home.hero || null,
    manifesto: home.manifesto || home.studio || home.home_data || null,
    process: home.process || null,
    awards: home.awards || [],
  };
}

/** Server render must never take the whole page down over an API blip. */
export function fallbackHomeData(): HomeData {
  return {
    services: mappedFallbackServices(),
    projects: mappedFallbackProjects(),
    posts: mappedFallbackPosts(),
    stats: [
      { value: 3, suffix: "+", label: "Offices" },
      { value: 90, suffix: "%", label: "Repeat business" },
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
    if (!data.services.length) data.services = mappedFallbackServices();
    if (!data.projects.length) data.projects = mappedFallbackProjects();
    if (!data.posts.length) data.posts = mappedFallbackPosts();
    return data;
  } catch (e) {
    console.error("Failed to fetch home data on the server:", e);
    return fallbackHomeData();
  }
}

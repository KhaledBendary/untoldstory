import { api } from "@/lib/api";
import type { BlogPost, PortfolioItem, Service } from "@/types/api";

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

export async function getHomeData(locale?: string): Promise<HomeData> {
  const [homeData, servicesData, layoutData, portfolioData] = await Promise.all([
    api.getHome(locale),
    api.getServices(locale),
    api.getLayout(locale),
    // /home's work_showcase.projects is a stripped-down shape with no client
    // name — the "Projects that speak" strip needs the full /portfolio record.
    api.getPortfolio({ per_page: 100, locale }),
  ]);

  const home = homeData as typeof homeData & {
    manifesto?: HomeData["manifesto"];
    studio?: HomeData["manifesto"];
    home_data?: HomeData["manifesto"];
    stats?: Array<{ value: string | number; label: string }>;
  };

  const stats = (home.stats || []).map((stat) => {
    const { num, suffix } = parseStatValue(stat.value);
    return { value: num, suffix: suffix || "", label: stat.label };
  });

  return {
    services: servicesData || [],
    projects: portfolioData.items || [],
    posts: homeData.blog_preview || [],
    stats,
    clients: layoutData?.client_logos || [],
    hero: homeData.hero || null,
    manifesto: home.manifesto || home.studio || home.home_data || null,
    process: homeData.process || null,
    awards: homeData.awards || [],
  };
}

/** Server render must never take the whole page down over an API blip. */
export async function getHomeDataSafe(locale?: string): Promise<HomeData | null> {
  try {
    return await getHomeData(locale);
  } catch (e) {
    console.error("Failed to fetch home data on the server:", e);
    return null;
  }
}

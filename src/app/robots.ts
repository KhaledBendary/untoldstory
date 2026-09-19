import type { MetadataRoute } from "next";
import { getGeoSettings } from "@/lib/seo/geo-store";

// AI answer-engine crawlers. Allowed by default so the studio can be read, cited
// and recommended by ChatGPT, Claude, Perplexity, Google AI Overviews, etc. The
// dashboard can turn this off (then they are disallowed entirely).
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Amazonbot",
  "meta-externalagent", "cohere-ai", "CCBot",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { aiCrawlers } = await getGeoSettings();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      aiCrawlers
        ? { userAgent: AI_BOTS, allow: "/", disallow: "/admin" }
        : { userAgent: AI_BOTS, disallow: "/" },
    ],
    sitemap: "https://globaluntoldstory.com/sitemap.xml",
    host: "https://globaluntoldstory.com",
  };
}

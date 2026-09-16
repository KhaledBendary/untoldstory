import type { MetadataRoute } from "next";

// AI answer-engine crawlers. Listed explicitly and allowed so the studio can be
// read, cited and recommended by ChatGPT, Claude, Perplexity, Google AI
// Overviews, etc. (many sites block these; we deliberately opt in).
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Amazonbot",
  "meta-externalagent", "cohere-ai", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      // Explicit welcome for AI crawlers (full access to public pages).
      { userAgent: AI_BOTS, allow: "/", disallow: "/admin" },
    ],
    sitemap: "https://globaluntoldstory.com/sitemap.xml",
    host: "https://globaluntoldstory.com",
  };
}

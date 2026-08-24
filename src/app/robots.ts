import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://globaluntoldstory.com/sitemap.xml",
    host: "https://globaluntoldstory.com",
  };
}

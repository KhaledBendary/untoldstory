import { buildLocaleSitemap } from "@/lib/sitemap-routes";

// Prerendered at build time and refreshed on the same cycle as the pages it
// lists, so a sitemap request never waits on the CMS API.
export const dynamic = "force-static";
export const revalidate = 86400;

export const GET = () => buildLocaleSitemap("tr");

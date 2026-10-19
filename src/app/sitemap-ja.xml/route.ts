import { buildLocaleSitemap } from "@/lib/sitemap-routes";

export const dynamic = "force-static";
export const revalidate = 86400;

export const GET = () => buildLocaleSitemap("ja");

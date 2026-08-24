import type { Metadata } from "next";
import Home from "@/components/pages/Home";
import { applySeoOverrides } from "@/data/seo-overrides";
import { getHomeDataSafe } from "@/lib/home-data";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";

export const metadata: Metadata = applySeoOverrides("/", {
  title: { absolute: "Film & Video Production in Egypt & MENA | Global Untold Story" },
  description: "Full-cycle film, advertising and content production across Egypt, UAE and Saudi Arabia. Offices in Egyptian Media Production City, Dubai and Jeddah.",
  alternates: { canonical: "/" },
});

export default async function Page() {
  // Fetched here rather than in a client effect so the HTML crawlers receive
  // carries the headline, services and copy instead of an empty shell.
  const initialData = await getHomeDataSafe(DEFAULT_LOCALE);
  return <Home initialData={initialData} initialLocale={DEFAULT_LOCALE} />;
}

import type { Metadata } from "next";
import About from "@/components/pages/About";
import { applySeoOverrides } from "@/data/seo-overrides";
import { getAboutData, safeFetch } from "@/lib/page-data";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";

export const metadata: Metadata = applySeoOverrides("/about", {
  title: { absolute: "About Global Untold Story — Creative Production Studio" },
  description: "An international creative production studio working across film, advertising, documentary, television, live production, post and original IP.",
  alternates: { canonical: "/about" },
});

export default async function Page() {
  const initialData = await safeFetch(() => getAboutData(DEFAULT_LOCALE), "about");
  return <About initialData={initialData} initialLocale={DEFAULT_LOCALE} />;
}

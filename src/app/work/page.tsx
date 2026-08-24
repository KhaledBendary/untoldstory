import type { Metadata } from "next";
import Work from "@/components/pages/Work";
import { applySeoOverrides } from "@/data/seo-overrides";
import { getWorkData, safeFetch } from "@/lib/page-data";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";

export const metadata: Metadata = applySeoOverrides("/work", {
  title: { absolute: "Portfolio — Film & Advertising Work | Global Untold Story" },
  description: "Selected commercials, documentaries, corporate films, live productions and photography created for brands and institutions worldwide.",
  alternates: { canonical: "/work" },
});

export default async function Page() {
  const initialData = await safeFetch(() => getWorkData(DEFAULT_LOCALE), "work");
  return <Work initialData={initialData} initialLocale={DEFAULT_LOCALE} />;
}

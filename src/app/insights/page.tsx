import type { Metadata } from "next";
import Insights from "@/components/pages/Insights";
import { applySeoOverrides } from "@/data/seo-overrides";
import { getInsightsData, safeFetch } from "@/lib/page-data";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";

export const metadata: Metadata = applySeoOverrides("/insights", {
  title: { absolute: "Insights — Notes From the Field | Global Untold Story" },
  description: "Production insights, practical guides and field notes across film, commercials, documentaries, corporate video and MENA production.",
  alternates: { canonical: "/insights" },
});

export default async function Page() {
  const initialData = await safeFetch(() => getInsightsData(DEFAULT_LOCALE), "insights");
  return <Insights initialData={initialData} initialLocale={DEFAULT_LOCALE} />;
}

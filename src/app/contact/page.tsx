import type { Metadata } from "next";
import Contact from "@/components/pages/Contact";
import { applySeoOverrides } from "@/data/seo-overrides";
import { getContactData, safeFetch } from "@/lib/page-data";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_API_LOCALE || "en";

export const metadata: Metadata = applySeoOverrides("/contact", {
  title: { absolute: "Contact — Start Your Production | Global Untold Story" },
  description: "Get a quote from Global Untold Story. Offices in Egyptian Media Production City, Business Bay Dubai and Jeddah. Email bendary@globaluntoldstory.com.",
  alternates: { canonical: "/contact" },
});

export default async function Page() {
  const initialData = await safeFetch(() => getContactData(DEFAULT_LOCALE), "contact");
  return <Contact initialData={initialData} initialLocale={DEFAULT_LOCALE} />;
}

import type { Metadata } from "next";
import "../globals.css";
import { Alexandria, Archivo, Inter, JetBrains_Mono } from "next/font/google";
import SiteShell from "@/components/SiteShell";
import StructuredData from "@/components/StructuredData";
import { DEFAULT_LOCALE, PRERENDER_LOCALES, LOCALE_TAGS, isLocale, localeDir } from "@/lib/i18n";
import { getCommandCenterSchemas } from "@/data/seo-command-schema";
import { getShellData } from "@/lib/page-data";

/**
 * Self-hosted through next/font rather than a <link> to fonts.googleapis.com.
 * The stylesheet request was render-blocking on every page, and the browser
 * had to reach a second origin before any text could paint.
 */
const alexandria = Alexandria({ subsets: ["arabic", "latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-alexandria", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains", display: "swap" });

const fontClass = [alexandria.variable, archivo.variable, inter.variable, jetbrains.variable].join(" ");

const siteUrl = "https://globaluntoldstory.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Global Untold Story — Film & Video Production Services in Egypt & MENA",
    template: "%s | Global Untold Story",
  },
  description: "Global Untold Story is a full-service film, video and content production studio based in Egyptian Media Production City, Dubai and Jeddah, serving Egypt, MENA and international clients.",
  keywords: [
    "film production Egypt", "video production company Cairo", "on-ground production services Egypt",
    "TV commercial production Egypt", "documentary production", "corporate video production Cairo",
    "media production agency Egypt", "production house MENA", "Dubai production company",
    "line production Egypt", "fixer Egypt",
  ],
  authors: [{ name: "Global Untold Story" }],
  creator: "Global Untold Story",
  publisher: "Global Untold Story",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: { icon: "/images/favicon.png", apple: "/images/favicon.png" },
  openGraph: {
    type: "website",
    siteName: "Global Untold Story",
    title: "Global Untold Story — Film & Video Production Services in Egypt & MENA",
    description: "Full-service film, video and content production studio. Where story meets execution — predictable budgets, premium results across Egypt, MENA and worldwide.",
    url: siteUrl,
    images: [{ url: "/images/on-ground-production-giza.jpg", width: 1200, height: 630, alt: "Global Untold Story production in Egypt" }],
    locale: "en_US",
    alternateLocale: ["ar_AR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Untold Story — Film & Video Production Services in Egypt & MENA",
    description: "Full-service film, video and content production studio. Where story meets execution.",
    images: ["/images/on-ground-production-giza.jpg"],
  },
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "Global Untold Story",
  url: `${siteUrl}/`,
  logo: `${siteUrl}/images/logo-white.png`,
  description: "Full-service film, video, advertising, documentary, corporate, live, podcast, photography, motion/CGI/AI, localization, marketing and original-IP studio serving Egypt, MENA and international clients.",
  email: "bendary@globaluntoldstory.com",
  founder: { "@type": "Person", name: "Khaled Bendary", jobTitle: "CEO" },
  address: [
    { "@type": "PostalAddress", addressLocality: "Egyptian Media Production City", addressCountry: "EG" },
    { "@type": "PostalAddress", addressLocality: "Business Bay, Dubai", addressCountry: "AE" },
  ],
  contactPoint: [
    { "@type": "ContactPoint", telephone: "+201001299639", contactType: "sales", areaServed: "EG", availableLanguage: ["en", "ar"] },
    { "@type": "ContactPoint", telephone: "+971547711772", contactType: "sales", areaServed: "AE", availableLanguage: ["en", "ar"] },
  ],
  sameAs: [
    "https://www.facebook.com/theuntoldstory.adv",
    "https://www.instagram.com/globaluntoldstory",
    "https://vimeo.com/user252566067",
    "https://www.linkedin.com/company/the-untold-story-film-production-services/",
  ],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "Global Untold Story",
  url: `${siteUrl}/`,
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: ["en", "ar"],
};

/**
 * One ProfessionalService per office so the studio can surface in local results
 * for Cairo, Dubai and Jeddah rather than as a single country-less Organization.
 *
 * TODO: add `streetAddress`, `geo` and `openingHoursSpecification` per office —
 * left out deliberately rather than guessed, since wrong coordinates are worse
 * than none for local ranking.
 */
const offices = [
  {
    id: "cairo",
    name: "Global Untold Story — Cairo",
    locality: "Egyptian Media Production City, 6th of October City",
    region: "Giza",
    country: "EG",
    telephone: "+201001299639",
  },
  {
    id: "dubai",
    name: "Global Untold Story — Dubai",
    locality: "Business Bay",
    region: "Dubai",
    country: "AE",
    telephone: "+971547711772",
  },
  {
    id: "jeddah",
    name: "Global Untold Story — Jeddah",
    locality: "Jeddah",
    region: "Makkah Province",
    country: "SA",
  },
].map((office) => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${siteUrl}/#office-${office.id}`,
  name: office.name,
  url: `${siteUrl}/contact`,
  image: `${siteUrl}/images/on-ground-production-giza.jpg`,
  logo: `${siteUrl}/images/logo-white.png`,
  email: "bendary@globaluntoldstory.com",
  ...(office.telephone ? { telephone: office.telephone } : {}),
  parentOrganization: { "@id": `${siteUrl}/#organization` },
  address: {
    "@type": "PostalAddress",
    addressLocality: office.locality,
    addressRegion: office.region,
    addressCountry: office.country,
  },
  areaServed: ["Egypt", "United Arab Emirates", "Saudi Arabia", "MENA"],
  knowsLanguage: ["en", "ar"],
  serviceType: [
    "Film production",
    "Commercial advertising production",
    "Documentary production",
    "Corporate video production",
    "Live broadcast production",
    "Post production",
  ],
}));

export function generateStaticParams() {
  return PRERENDER_LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  // The locale comes from the route segment, so <html lang>/<dir> are correct
  // in the static HTML — no headers() call, which would force every page to
  // render on demand and give up static generation entirely.
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const shell = await getShellData(locale);

  return (
    <html lang={LOCALE_TAGS[locale]} dir={localeDir(locale)} className={fontClass} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StructuredData data={[organization, website, ...offices, ...getCommandCenterSchemas()]} />
        <SiteShell shell={shell} locale={locale}>{children}</SiteShell>
      </body>
    </html>
  );
}

import "@/lib/db/register"; // server-only: publishes the DB content-source for api.ts
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { Alexandria, Archivo, Inter, JetBrains_Mono } from "next/font/google";
import SiteShell from "@/components/SiteShell";
import Tracker from "@/components/Tracker";
import StructuredData from "@/components/StructuredData";
import { DEFAULT_LOCALE, PRERENDER_LOCALES, LOCALE_TAGS, OG_LOCALES, isLocale, localeDir, INDEXABLE_LOCALES, isIndexableLocale } from "@/lib/i18n";
import { getCommandCenterSchemas } from "@/data/seo-command-schema";
import { getShellData } from "@/lib/page-data";
import { BRAND, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import { pageMeta } from "@/data/page-meta";

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

const siteUrl = SITE_URL;
/*
 * No GA4 measurement id here any more — G-G38ZL9GYXF is configured inside the
 * GTM container instead.
 *
 * Worth carrying over the lesson that id cost: it was G-CV7T8W6SDJ for two
 * days after the migration, a valid-looking id belonging to a different
 * property. Google accepts any id without checking it, so the tag fired, the
 * network showed a clean /g/collect, and the property read zero. Whatever id
 * the container holds, verify it against Admin → Data Streams — not against
 * whether the request succeeds.
 */

/**
 * Meta Pixel. Overridable per environment so a preview deployment can point at
 * a test pixel — or set it empty to switch tracking off without a code change.
 * A pixel id is public by design; it ships in the page on every site using one.
 */
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "780471777947136";

/**
 * Google Tag Manager. GA4 is configured inside this container, not here.
 *
 * The measurement id used to be hardcoded in a gtag.js snippet on this page.
 * That means the site now measures nothing unless GTM-TJ66KW2R actually holds
 * a GA4 tag for G-G38ZL9GYXF — the container is the only thing standing
 * between a visit and the property.
 */
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-TJ66KW2R";

/**
 * Which deployment this is, on the dataLayer before the container loads.
 *
 * Both tags used to fire wherever the page was served, so every preview
 * deployment on *.vercel.app and every `next dev` session was recorded as live
 * traffic — the people building the site mixed into the numbers the ads are
 * judged on. That was fixed by refusing to configure GA4 off the production
 * host, and configuring GA4 is now GTM's job, so the guard has to move with
 * it: this publishes the environment and a trigger condition in the container
 * keeps preview traffic out. Without that condition the pollution comes back.
 */
const ANALYTICS_HOST = new URL(SITE_URL).hostname;

export async function generateMetadata({
  params,
}: {
  params?: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const raw = (await params)?.locale;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const home = pageMeta("home", locale);
  const others = INDEXABLE_LOCALES.filter((code) => code !== locale).map((code) => OG_LOCALES[code]);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: home.title, template: "%s" },
    description: home.description,
    /*
     * No `keywords`. Google stopped using the meta keywords tag for ranking in
     * 2009 and says so plainly; Bing treats stuffing it as a negative signal.
     * All it did here was publish the exact phrase list this site competes on,
     * in English, on every page including the Arabic and Russian ones.
     */
    authors: [{ name: BRAND }],
    creator: BRAND,
    publisher: BRAND,
    robots: isIndexableLocale(locale)
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    verification: {
      google: "9bgQyGP_WoXpY61HhzlvjYaaRM586odUzrLq4u_eawE",
    },
    icons: { icon: "/images/favicon.png", apple: "/images/favicon.png", shortcut: "/images/favicon.png" },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      siteName: BRAND,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Global Untold Story production in Egypt" }],
      locale: OG_LOCALES[locale],
      alternateLocale: others,
    },
    twitter: { card: "summary_large_image" },
    // Geo-targeting meta for local search — the studio's primary HQ (Cairo/Giza).
    other: {
      "geo.region": "EG-GZ",
      "geo.placename": "6th of October City, Giza",
      "geo.position": "29.9773;30.944",
      "ICBM": "29.9773, 30.944",
    },
  };
}

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
    { "@type": "PostalAddress", addressLocality: "Jeddah", addressCountry: "SA" },
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
  // Entity signals for AI answer engines: what the studio does and where.
  slogan: "Film and video production in Egypt and MENA, from idea to impact.",
  areaServed: [
    { "@type": "Country", name: "Egypt" },
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "Saudi Arabia" },
    { "@type": "Place", name: "Middle East and North Africa" },
  ],
  foundingLocation: { "@type": "Place", name: "Cairo, Egypt" },
  knowsAbout: [
    "Film production", "Commercial and advertising production", "Documentary production",
    "Corporate and brand video", "Live broadcast production", "Podcast production",
    "Photography", "Motion graphics, CGI and AI video", "Video post-production",
    "Localization and subtitling", "Production services in Egypt for international crews",
  ],
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "Global Untold Story",
  url: `${siteUrl}/`,
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: [...INDEXABLE_LOCALES],
};

/**
 * One ProfessionalService (a LocalBusiness subtype) per office so the studio can
 * surface in local results for Cairo, Dubai and Jeddah rather than as a single
 * country-less Organization. Coordinates are district/city level — accurate to
 * the area each office sits in (EMPC, Business Bay, Jeddah), which is what local
 * ranking uses; not a precise street pin.
 */
const offices = [
  {
    id: "cairo",
    name: "Global Untold Story — Cairo",
    locality: "Egyptian Media Production City, 6th of October City",
    region: "Giza",
    country: "EG",
    telephone: "+201001299639",
    geo: { lat: 29.9773, lng: 30.944 },
  },
  {
    id: "dubai",
    name: "Global Untold Story — Dubai",
    locality: "Business Bay",
    region: "Dubai",
    country: "AE",
    telephone: "+971547711772",
    geo: { lat: 25.1857, lng: 55.2654 },
  },
  {
    id: "jeddah",
    name: "Global Untold Story — Jeddah",
    locality: "Jeddah",
    region: "Makkah Province",
    country: "SA",
    geo: { lat: 21.5433, lng: 39.1728 },
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
  geo: { "@type": "GeoCoordinates", latitude: office.geo.lat, longitude: office.geo.lng },
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    opens: "09:00",
    closes: "18:00",
  }],
  priceRange: "$$",
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

/**
 * A short, factual FAQ as FAQPage structured data. Answer engines lean heavily
 * on Q&A, so this is one of the highest-value GEO signals — it states the core
 * facts (where, what, who) in a form an assistant can quote directly. Arabic for
 * the Arabic site, English everywhere else.
 */
function faqSchema(locale: string) {
  const ar = locale === "ar";
  const qa = ar
    ? [
        { q: "فين مقر Global Untold Story؟", a: "المقر الرئيسي في مدينة الإنتاج الإعلامي بمدينة السادس من أكتوبر، الجيزة، مصر، وفيه مكاتب كمان في دبي (الإمارات) وجدة (السعودية)." },
        { q: "Global Untold Story بتقدّم أنهي خدمات؟", a: "إنتاج أفلام وإعلانات، أفلام وثائقية، فيديوهات الشركات والعلامات التجارية، البث المباشر، البودكاست، التصوير الفوتوغرافي، الموشن جرافيك والـCGI والذكاء الاصطناعي، ما بعد الإنتاج، والتوطين والترجمة." },
        { q: "بتشتغلوا في أنهي مناطق؟", a: "مصر والإمارات والسعودية ومنطقة الشرق الأوسط وشمال إفريقيا كلها، بالإضافة لخدمات الإنتاج للطواقم الدولية اللي بتصوّر في المنطقة." },
        { q: "إزاي أطلب عرض سعر؟", a: "من صفحة التواصل globaluntoldstory.com/contact أو على البريد bendary@globaluntoldstory.com أو تليفون +20 100 129 9639." },
        { q: "بتقدّموا خدمات إنتاج للطواقم الأجنبية في مصر؟", a: "أيوة — تصاريح التصوير، الطواقم المحلية، المعدات، المواقع، والتنسيق اللوجستي للإنتاجات الدولية اللي بتصوّر في مصر والخليج." },
      ]
    : [
        { q: "Where is Global Untold Story based?", a: "Its headquarters is in Egyptian Media Production City, 6th of October City, Giza, Egypt, with additional offices in Dubai (UAE) and Jeddah (Saudi Arabia)." },
        { q: "What services does Global Untold Story offer?", a: "Film and commercial production, documentaries, corporate and brand video, live broadcast, podcasts, photography, motion graphics/CGI/AI video, post-production, and localization/subtitling." },
        { q: "Which regions does it serve?", a: "Egypt, the UAE, Saudi Arabia and the wider MENA region, plus production services for international crews filming in the region." },
        { q: "How do I get a quote?", a: "Use the contact page at globaluntoldstory.com/contact, email bendary@globaluntoldstory.com, or call +20 100 129 9639." },
        { q: "Do you provide production services for foreign crews in Egypt?", a: "Yes — filming permits, local crews, equipment, locations and full logistics for international productions shooting in Egypt and the Gulf." },
      ];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    inLanguage: ar ? "ar" : "en",
    mainEntity: qa.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/*
 * Every locale is built, so an unrecognised one is a 404 rather than something
 * to render. The proxy already rewrites a non-locale first segment to /en, so
 * this segment only ever sees real locales — this closes the path that does not
 * go through it.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PRERENDER_LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params?: Promise<{ locale: string }> }>) {
  // The locale comes from the route segment, so <html lang>/<dir> are correct
  // in the static HTML — no headers() call, which would force every page to
  // render on demand and give up static generation entirely.
  //
  // `params` is optional on purpose: Next renders the not-found boundary
  // without them, and destructuring an absent promise threw here — which is
  // why every 404 shipped an empty Suspense shell instead of a page.
  const raw = (await params)?.locale;
  // Unknown first segments used to render the English homepage (e.g. /index.php
  // matching [locale]). 404 unless middleware already redirected them.
  if (raw && !isLocale(raw)) notFound();
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const shell = await getShellData(locale);

return (
  <html
    lang={LOCALE_TAGS[locale]}
    dir={localeDir(locale)}
    className={fontClass}
    suppressHydrationWarning
  >
    {/*
      * Consent defaults, inlined in <head> so they run before anything else.
      *
      * next/script's beforeInteractive was not early enough — the gtag tag
      * still appeared first in the document. Consent Mode only holds if the
      * denial is on the dataLayer before gtag initialises; set after, the
      * first page_view has already gone.
      *
      * Denied to begin with, then granted from localStorage for anyone who
      * already agreed — and granted outright outside the regions that require
      * asking, so this does not quietly stop measuring Egypt and the Gulf.
      */}
    <head>
      <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
          try {
            var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '');
            // Plain string tests, not a regex. This was a regex literal, and a
            // backslash inside a template literal is an escape: the emitted
            // script read /^(Europe|Atlantic/ and threw SyntaxError, so the
            // whole block died — consent defaults were never set and the
            // banner's answer was never applied.
            var EEA_ISLANDS = ['Atlantic/Canary','Atlantic/Madeira','Atlantic/Azores','Atlantic/Faroe','Atlantic/Reykjavik'];
            var mustAsk = tz.indexOf('Europe/') === 0 || EEA_ISLANDS.indexOf(tz) !== -1;
            var stored = JSON.parse(localStorage.getItem('gus_consent') || 'null');
            var ok = (stored && stored.version === 1 && stored.choice === 'granted') || !mustAsk;
            if (ok) {
              gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
              });
            }
          } catch (e) {}` }} />

      {/*
        * The container, inline and directly after the consent defaults above.
        * Consent Mode only holds if the denial is already on the dataLayer
        * when the container initialises; next/script's beforeInteractive was
        * not early enough for the tag it replaced, and it would not be early
        * enough for this one either.
        *
        * Loaded on the production host only. Before Tag Manager, GA4 refused
        * to configure anywhere else, which is what stopped preview deployments
        * and local dev being counted as live traffic. Doing the same thing
        * with a trigger condition inside the container would be the tidier
        * home for it — `environment` is pushed below for exactly that — but
        * this way the protection does not depend on a setting no one can see
        * from the code.
        *
        * The cost is real: no tag in this container fires on a preview URL, so
        * a new tag cannot be exercised there. Drop the isProduction check to
        * test one, or move the condition into the container and drop it for
        * good.
        */}
      <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || [];
          var isProduction = location.hostname === '${ANALYTICS_HOST}';
          window.dataLayer.push({ environment: isProduction ? 'production' : 'preview' });
          if (isProduction) {
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
          }` }} />
    </head>
    <body suppressHydrationWarning>

      {/* The container's no-JavaScript fallback, first thing in the body. */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>

      {FB_PIXEL_ID ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              if (location.hostname === '${ANALYTICS_HOST}') {
                fbq('init', '${FB_PIXEL_ID}');
                fbq('track', 'PageView');
              }
            `}
          </Script>
          {/* Keeps the pixel working for visitors who block scripts. A real
              <img> on purpose: next/image would rewrite the URL through the
              optimizer and the beacon would never reach Meta. */}
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}

      <StructuredData
        data={[
          organization,
          website,
          ...offices,
          faqSchema(locale),
          ...getCommandCenterSchemas(),
        ]}
      />

      <SiteShell shell={shell} locale={locale}>
        {children}
      </SiteShell>

      <Tracker />
    </body>
  </html>
);
}

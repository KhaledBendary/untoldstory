import { SITE_URL } from "@/lib/seo";

/**
 * GEO / SEO settings — the single source of truth for the site's structured
 * data (Organization, LocalBusiness offices, FAQ), the geo meta tags, the
 * llms.txt brief and whether AI crawlers are welcomed.
 *
 * These used to be hard-coded in the layout. They now live in one editable
 * document (the `seo_settings` singleton) so the dashboard can change them, and
 * fall back to DEFAULTS below whenever a field is missing — so the site keeps
 * emitting correct schema even before anything is saved.
 */

export type GeoOffice = {
  id: string;
  name: string;
  locality: string;
  region: string;
  country: string;   // ISO-2, e.g. EG
  phone?: string;
  lat?: number | null;
  lng?: number | null;
  days?: string;     // human note, e.g. "Sun–Thu"
  opens?: string;    // "09:00"
  closes?: string;   // "18:00"
};

export type GeoFaq = { qEn: string; aEn: string; qAr: string; aAr: string };

export type GeoSettings = {
  organization: {
    name: string;
    description: string;
    slogan: string;
    email: string;
    knowsAbout: string[];
    sameAs: string[];
  };
  offices: GeoOffice[];
  faq: GeoFaq[];
  llmsIntro: string;
  aiCrawlers: boolean;
};

export const GEO_DEFAULTS: GeoSettings = {
  organization: {
    name: "Global Untold Story",
    description:
      "Full-service film, video, advertising, documentary, corporate, live, podcast, photography, motion/CGI/AI, localization, marketing and original-IP studio serving Egypt, MENA and international clients.",
    slogan: "Film and video production in Egypt and MENA, from idea to impact.",
    email: "bendary@globaluntoldstory.com",
    knowsAbout: [
      "Film production", "Commercial and advertising production", "Documentary production",
      "Corporate and brand video", "Live broadcast production", "Podcast production",
      "Photography", "Motion graphics, CGI and AI video", "Video post-production",
      "Localization and subtitling", "Production services in Egypt for international crews",
    ],
    sameAs: [
      "https://www.facebook.com/theuntoldstory.adv",
      "https://www.instagram.com/globaluntoldstory",
      "https://vimeo.com/user252566067",
      "https://www.linkedin.com/company/the-untold-story-film-production-services/",
    ],
  },
  offices: [
    { id: "cairo", name: "Global Untold Story — Cairo", locality: "Egyptian Media Production City, 6th of October City", region: "Giza", country: "EG", phone: "+201001299639", lat: 29.9773, lng: 30.944, days: "Sun–Thu", opens: "09:00", closes: "18:00" },
    { id: "dubai", name: "Global Untold Story — Dubai", locality: "Business Bay", region: "Dubai", country: "AE", phone: "+971547711772", lat: 25.1857, lng: 55.2654, days: "Sun–Thu", opens: "09:00", closes: "18:00" },
    { id: "jeddah", name: "Global Untold Story — Jeddah", locality: "Jeddah", region: "Makkah Province", country: "SA", phone: "", lat: 21.5433, lng: 39.1728, days: "Sun–Thu", opens: "09:00", closes: "18:00" },
  ],
  faq: [
    { qEn: "Where is Global Untold Story based?", aEn: "Its headquarters is in Egyptian Media Production City, 6th of October City, Giza, Egypt, with additional offices in Dubai (UAE) and Jeddah (Saudi Arabia).", qAr: "فين مقر Global Untold Story؟", aAr: "المقر الرئيسي في مدينة الإنتاج الإعلامي بمدينة السادس من أكتوبر، الجيزة، مصر، وفيه مكاتب كمان في دبي (الإمارات) وجدة (السعودية)." },
    { qEn: "What services does Global Untold Story offer?", aEn: "Film and commercial production, documentaries, corporate and brand video, live broadcast, podcasts, photography, motion graphics/CGI/AI video, post-production, and localization/subtitling.", qAr: "Global Untold Story بتقدّم أنهي خدمات؟", aAr: "إنتاج أفلام وإعلانات، أفلام وثائقية، فيديوهات الشركات والعلامات التجارية، البث المباشر، البودكاست، التصوير الفوتوغرافي، الموشن جرافيك والـCGI والذكاء الاصطناعي، ما بعد الإنتاج، والتوطين والترجمة." },
    { qEn: "Which regions does it serve?", aEn: "Egypt, the UAE, Saudi Arabia and the wider MENA region, plus production services for international crews filming in the region.", qAr: "بتشتغلوا في أنهي مناطق؟", aAr: "مصر والإمارات والسعودية ومنطقة الشرق الأوسط وشمال إفريقيا كلها، بالإضافة لخدمات الإنتاج للطواقم الدولية اللي بتصوّر في المنطقة." },
    { qEn: "How do I get a quote?", aEn: "Use the contact page at globaluntoldstory.com/contact, email bendary@globaluntoldstory.com, or call +20 100 129 9639.", qAr: "إزاي أطلب عرض سعر؟", aAr: "من صفحة التواصل globaluntoldstory.com/contact أو على البريد bendary@globaluntoldstory.com أو تليفون +20 100 129 9639." },
    { qEn: "Do you provide production services for foreign crews in Egypt?", aEn: "Yes — filming permits, local crews, equipment, locations and full logistics for international productions shooting in Egypt and the Gulf.", qAr: "بتقدّموا خدمات إنتاج للطواقم الأجنبية في مصر؟", aAr: "أيوة — تصاريح التصوير، الطواقم المحلية، المعدات، المواقع، والتنسيق اللوجستي للإنتاجات الدولية اللي بتصوّر في مصر والخليج." },
  ],
  llmsIntro:
    "Full-service film and video production studio based in Egypt, serving the Middle East, North Africa (MENA) and international clients — from concept and shooting through post-production, localization and distribution.",
  aiCrawlers: true,
};

/** Deep-merge a stored settings document over the defaults (missing → default). */
export function mergeGeo(stored: unknown): GeoSettings {
  const s = (stored && typeof stored === "object" ? stored : {}) as Partial<GeoSettings>;
  const org = (s.organization && typeof s.organization === "object" ? s.organization : {}) as Partial<GeoSettings["organization"]>;
  return {
    organization: {
      name: org.name?.trim() || GEO_DEFAULTS.organization.name,
      description: org.description?.trim() || GEO_DEFAULTS.organization.description,
      slogan: org.slogan?.trim() || GEO_DEFAULTS.organization.slogan,
      email: org.email?.trim() || GEO_DEFAULTS.organization.email,
      knowsAbout: cleanArr(org.knowsAbout) ?? GEO_DEFAULTS.organization.knowsAbout,
      sameAs: cleanArr(org.sameAs) ?? GEO_DEFAULTS.organization.sameAs,
    },
    offices: Array.isArray(s.offices) && s.offices.length ? s.offices.map(normOffice) : GEO_DEFAULTS.offices,
    faq: Array.isArray(s.faq) && s.faq.length ? s.faq.filter((f) => f && (f.qEn || f.qAr)) : GEO_DEFAULTS.faq,
    llmsIntro: (typeof s.llmsIntro === "string" && s.llmsIntro.trim()) ? s.llmsIntro : GEO_DEFAULTS.llmsIntro,
    aiCrawlers: typeof s.aiCrawlers === "boolean" ? s.aiCrawlers : GEO_DEFAULTS.aiCrawlers,
  };
}

const cleanArr = (v: unknown): string[] | null => {
  if (!Array.isArray(v)) return null;
  const out = v.map((x) => String(x).trim()).filter(Boolean);
  return out.length ? out : null;
};
function normOffice(o: GeoOffice, i: number): GeoOffice {
  return {
    id: o.id || `office-${i}`,
    name: o.name || "",
    locality: o.locality || "",
    region: o.region || "",
    country: (o.country || "").toUpperCase().slice(0, 2),
    phone: o.phone || "",
    lat: o.lat != null && o.lat !== ("" as unknown) ? Number(o.lat) : null,
    lng: o.lng != null && o.lng !== ("" as unknown) ? Number(o.lng) : null,
    days: o.days || "Sun–Thu",
    opens: o.opens || "09:00",
    closes: o.closes || "18:00",
  };
}

// ---- schema builders (identical output shape to the previous hard-coded ones) ----

export function organizationSchema(s: GeoSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: s.organization.name,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/images/logo-white.png`,
    description: s.organization.description,
    email: s.organization.email,
    founder: { "@type": "Person", name: "Khaled Bendary", jobTitle: "CEO" },
    address: s.offices.map((o) => ({ "@type": "PostalAddress", addressLocality: o.locality, addressCountry: o.country })),
    contactPoint: s.offices.filter((o) => o.phone).map((o) => ({
      "@type": "ContactPoint", telephone: o.phone, contactType: "sales", areaServed: o.country, availableLanguage: ["en", "ar"],
    })),
    sameAs: s.organization.sameAs,
    slogan: s.organization.slogan,
    areaServed: [
      { "@type": "Country", name: "Egypt" },
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "Place", name: "Middle East and North Africa" },
    ],
    foundingLocation: { "@type": "Place", name: "Cairo, Egypt" },
    knowsAbout: s.organization.knowsAbout,
  };
}

export function officeSchemas(s: GeoSettings) {
  return s.offices.map((office) => ({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#office-${office.id}`,
    name: office.name,
    url: `${SITE_URL}/contact`,
    image: `${SITE_URL}/images/on-ground-production-giza.jpg`,
    logo: `${SITE_URL}/images/logo-white.png`,
    email: s.organization.email,
    ...(office.phone ? { telephone: office.phone } : {}),
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    address: { "@type": "PostalAddress", addressLocality: office.locality, addressRegion: office.region, addressCountry: office.country },
    ...(office.lat != null && office.lng != null
      ? { geo: { "@type": "GeoCoordinates", latitude: office.lat, longitude: office.lng } }
      : {}),
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: office.opens || "09:00",
      closes: office.closes || "18:00",
    }],
    priceRange: "$$",
    areaServed: ["Egypt", "United Arab Emirates", "Saudi Arabia", "MENA"],
    knowsLanguage: ["en", "ar"],
    serviceType: [
      "Film production", "Commercial advertising production", "Documentary production",
      "Corporate video production", "Live broadcast production", "Post production",
    ],
  }));
}

export function faqSchema(s: GeoSettings, locale: string) {
  const ar = locale === "ar";
  const items = s.faq
    .map((f) => ({ q: ar ? (f.qAr || f.qEn) : (f.qEn || f.qAr), a: ar ? (f.aAr || f.aEn) : (f.aEn || f.aAr) }))
    .filter((x) => x.q && x.a);
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    inLanguage: ar ? "ar" : "en",
    mainEntity: items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };
}

/** geo.* meta tags for the primary (first) office. */
export function geoMeta(s: GeoSettings): Record<string, string> {
  const o = s.offices[0];
  if (!o || o.lat == null || o.lng == null) return {};
  return {
    "geo.region": `${o.country}`,
    "geo.placename": o.locality,
    "geo.position": `${o.lat};${o.lng}`,
    "ICBM": `${o.lat}, ${o.lng}`,
  };
}

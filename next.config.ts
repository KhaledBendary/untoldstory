import type { NextConfig } from "next";

const root = process.cwd();

// The upstream Laravel API. Browser requests are proxied through the Next.js
// server via rewrites() below so the browser only ever talks to same-origin
// URLs, avoiding CORS errors on api.globaluntoldstory.com.
const UPSTREAM_API_BASE_URL =
  process.env.API_BASE_URL || "https://api.globaluntoldstory.com/api/v1";
const UPSTREAM_ORIGIN = new URL(UPSTREAM_API_BASE_URL).origin;

/**
 * Content Security Policy.
 *
 * `script-src` has to allow inline script: a statically prerendered Next app
 * ships its hydration payload as inline `<script>` and there is no request to
 * attach a nonce to. The XSS defence for the one place untrusted markup enters
 * the page — CMS rich text — is sanitising it before render (see
 * `sanitizeCmsHtml`), and the policy below removes every other avenue:
 * no plugins, no framing, no injected <base>, and form posts and network calls
 * restricted to this origin and the API.
 */
/*
 * Everywhere Google's tags actually send data.
 *
 * The policy listed https://*.analytics.google.com and not
 * https://analytics.google.com — and a `*.` wildcard does not match the bare
 * host. That is the host GA4 posts every page_view to, and its fallbacks
 * (www.google.com, stats.g.doubleclick.net) were missing too, so every hit was
 * refused by the browser and the property recorded nothing at all. The tag
 * loaded, the cookies were written, and the network panel showed gtag.js
 * arriving, which is exactly what makes this hard to see: the failure is in
 * the console, not in whether the tag is present.
 *
 * Verify a change here by loading the site and reading the console for
 * "violates the following Content Security Policy directive", not by checking
 * that the tag is on the page.
 */
const GOOGLE_MEASUREMENT = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://analytics.google.com",
  "https://*.analytics.google.com",
  "https://stats.g.doubleclick.net",
].join(" ");

/* Google Ads conversion and remarketing tags, which ride on the same gtag. */
const GOOGLE_ADS = [
  "https://www.google.com",
  "https://googleads.g.doubleclick.net",
  "https://ad.doubleclick.net",
  "https://www.googleadservices.com",
].join(" ");

/*
 * Google sends a visitor to their own country domain — an Egyptian visitor to
 * www.google.com.eg — and a CSP cannot express "any Google country domain"
 * without allowing far more than Google. Listed here are the markets this
 * studio sells into.
 *
 * These belong in connect-src as well as img-src. They were in img-src alone,
 * on the assumption that only remarketing pixels used them; Google Ads posts
 * its conversions to /pagead/1p-conversion on the same country domain, so an
 * Egyptian visitor completing the contact form had their conversion refused by
 * this policy while the form itself succeeded. Found in the browser console on
 * the live site — nothing about the page or the network panel looks wrong when
 * this happens.
 */
const GOOGLE_COUNTRY_DOMAINS = [
  "https://www.google.com.eg",
  "https://www.google.ae",
  "https://www.google.com.sa",
  "https://www.google.co.uk",
  "https://www.google.de",
  "https://www.google.fr",
].join(" ");

const META = "https://www.facebook.com https://connect.facebook.net";

// Images uploaded through the admin (media library, rich-text editor) are
// stored in Vercel Blob, at a per-project random subdomain — not the same
// "blob:" URL scheme already allowed below. Without this, every such image
// loads fine directly (curl, the API) but is silently blocked in the browser
// by this very policy, showing as a broken image with no console-visible error
// on the page itself (only in devtools' CSP violation log).
const VERCEL_BLOB = "https://*.public.blob.vercel-storage.com";

// React's dev server needs eval() for fast-refresh/debugging; production never
// does. Allow it only in development so the live CSP stays strict.
const DEV_SCRIPT = process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : "";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV_SCRIPT} https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://connect.facebook.net`,
  // framer-motion and GSAP animate via inline style attributes.
  "style-src 'self' 'unsafe-inline'",
  // Fonts are self-hosted through next/font, so no third-party origin here.
  "font-src 'self' data:",
  `img-src 'self' data: blob: ${UPSTREAM_ORIGIN} ${VERCEL_BLOB} ${GOOGLE_MEASUREMENT} ${GOOGLE_ADS} ${GOOGLE_COUNTRY_DOMAINS} https://www.facebook.com`,
  `media-src 'self' ${UPSTREAM_ORIGIN} ${VERCEL_BLOB}`,
  `connect-src 'self' ${UPSTREAM_ORIGIN} ${GOOGLE_MEASUREMENT} ${GOOGLE_ADS} ${GOOGLE_COUNTRY_DOMAINS} ${META}`,
  "object-src 'none'",
  "base-uri 'self'",
  // The Meta Pixel posts to facebook.com/tr/ from a hidden form.
  "form-action 'self' https://www.facebook.com",
  "frame-ancestors 'none'",
  // …and frames facebook.com as its fallback transport.
  "frame-src https://www.facebook.com",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // Belt and braces for the handful of agents that still ignore frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/**
 * Redirects managed from the dashboard. Read straight from Postgres at build
 * time (next.config runs in Node, never in the browser) and turned into 301s.
 * Fails safe to no extra redirects if the database is unreachable, so a DB blip
 * can never break the build.
 */
async function dbRedirects() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return [];
  try {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { ssl: "require", max: 1, connect_timeout: 15, prepare: false, onnotice: () => {} });
    try {
      const rows = await sql<{ from_path: string; to_path: string }[]>`select from_path, to_path from redirects`;
      return rows.map((r) => ({ source: r.from_path, destination: r.to_path, permanent: true }));
    } finally {
      await sql.end({ timeout: 5 });
    }
  } catch (e) {
    console.warn("dbRedirects: could not load redirects from DB —", (e as Error).message);
    return [];
  }
}

const nextConfig: NextConfig = {
  // Hostinger runs the app under Passenger, which starts a plain Node process
  // and needs the self-contained server bundle. Gated so Vercel keeps using
  // its own adapter: set HOSTINGER_BUILD=1 only for that build.
  ...(process.env.HOSTINGER_BUILD ? { output: "standalone" as const } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  // Next's default trailing-slash hop is 308. Old WordPress URLs then need a
  // second 301 onto the canonical path. Handle the slash ourselves as 301.
  skipTrailingSlashRedirect: true,
  // Renamed in Next 16; the old name still works but warns on every build.
  skipProxyUrlNormalize: true,
  outputFileTracingRoot: root,
  // The Japanese slug romanizer (translate/apply.ts) loads kuromoji's
  // dictionary from node_modules at runtime — a dynamic require the file
  // tracer can't follow statically, so its files are named here explicitly
  // for every route that can reach updateSlugs(). Best-effort by design
  // (see transliterateJapanese): if this is ever wrong, Japanese slugs just
  // keep falling back to the canonical slug, not a broken build.
  outputFileTracingIncludes: {
    "/api/admin/translate-all": ["./node_modules/kuromoji/dict/**"],
    "/api/admin/content/[type]": ["./node_modules/kuromoji/dict/**"],
    "/api/admin/content/[type]/[slug]": ["./node_modules/kuromoji/dict/**"],
  },
  // kuromoji ships its dictionary as .dat.gz files loaded from disk at
  // runtime, not bundled JS — same reason sharp/nodemailer are external.
  serverExternalPackages: ["nodemailer", "sharp", "kuromoji", "kuroshiro", "kuroshiro-analyzer-kuromoji"],
  // Static generation defaults to one worker per core. Against the shared-host
  // Laravel API that burst returns 500s, and pages then prerender with fallback
  // metadata. Fewer workers make the build slower but deterministic.
  experimental: {
    cpus: 2,
  },
  turbopack: {
    root,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.globaluntoldstory.com",
        pathname: "/storage/media/**",
      },
      {
        protocol: "https",
        hostname: "api.globaluntoldstory.com",
        pathname: "/api/public/storage/media/**",
      },
    ],
    // The image optimizer will render SVG as-is, which makes it a script
    // delivery vehicle. No CMS asset needs it.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/videos/:path*",
        headers: [
          ...SECURITY_HEADERS,
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      { source: "/:path*", headers: SECURITY_HEADERS },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.globaluntoldstory.com" }],
        destination: "https://globaluntoldstory.com/:path*",
        permanent: true,
      },
      ...(await dbRedirects()),
    ];
  },
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/images/favicon.png" },
      // Only the versioned API surface is proxied. A previous catch-all on
      // `/api/proxy/:path*` exposed every route on the upstream host — admin
      // included — through this domain, and nothing in the app used it.
      {
        source: "/api/v1/:path*",
        destination: `${UPSTREAM_API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;

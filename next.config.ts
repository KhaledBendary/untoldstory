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
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  // framer-motion and GSAP animate via inline style attributes.
  "style-src 'self' 'unsafe-inline'",
  // Fonts are self-hosted through next/font, so no third-party origin here.
  "font-src 'self' data:",
  `img-src 'self' data: blob: ${UPSTREAM_ORIGIN} https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.facebook.com`,
  `media-src 'self' ${UPSTREAM_ORIGIN}`,
  `connect-src 'self' ${UPSTREAM_ORIGIN} https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.facebook.com https://connect.facebook.net`,
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
  serverExternalPackages: ["nodemailer"],
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

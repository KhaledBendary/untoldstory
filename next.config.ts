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
  "script-src 'self' 'unsafe-inline'",
  // framer-motion and GSAP animate via inline style attributes.
  "style-src 'self' 'unsafe-inline'",
  // Fonts are self-hosted through next/font, so no third-party origin here.
  "font-src 'self' data:",
  `img-src 'self' data: blob: ${UPSTREAM_ORIGIN}`,
  `media-src 'self' ${UPSTREAM_ORIGIN}`,
  `connect-src 'self' ${UPSTREAM_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
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
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: root,
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
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async rewrites() {
    return [
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

import type { NextConfig } from "next";

const root = process.cwd();

// The upstream Laravel API. Browser requests are proxied through the Next.js
// server via rewrites() below so the browser only ever talks to same-origin
// URLs, avoiding CORS errors on api.globaluntoldstory.com.
const UPSTREAM_API_BASE_URL =
  process.env.API_BASE_URL || "https://api.globaluntoldstory.com/api/v1";
const UPSTREAM_ORIGIN = new URL(UPSTREAM_API_BASE_URL).origin;

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
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${UPSTREAM_API_BASE_URL}/:path*`,
      },
      {
        source: "/api/proxy/:path*",
        destination: `${UPSTREAM_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { Metadata } from "next";
import overridesJson from "./seo-overrides.json";

export type SeoOverride = {
  title?: string;
  description?: string;
  canonical?: string;
  /** e.g. "index,follow" | "noindex,nofollow" */
  robots?: string;
};

/** Written by SEO Command Center via seo-overrides.json */
export const SEO_OVERRIDES = overridesJson as Record<string, SeoOverride>;

export function normalizeSeoPath(input: string): string {
  try {
    if (input.startsWith("http://") || input.startsWith("https://")) {
      input = new URL(input).pathname;
    }
  } catch {
    /* keep raw */
  }
  let p = input.trim() || "/";
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

function robotsFromString(value: string): Metadata["robots"] {
  const v = value.toLowerCase();
  return {
    index: !v.includes("noindex"),
    follow: !v.includes("nofollow"),
  };
}

/** Merge Command Center overrides onto base App Router metadata. */
export function applySeoOverrides(path: string, base: Metadata): Metadata {
  const o = SEO_OVERRIDES[normalizeSeoPath(path)];
  if (!o) return base;

  const next: Metadata = { ...base };
  if (o.title) {
    // Dynamic pages use { absolute: string }; static pages use string
    if (base.title && typeof base.title === "object" && "absolute" in base.title) {
      next.title = { absolute: o.title };
    } else {
      next.title = o.title;
    }
  }
  if (o.description) next.description = o.description;
  if (o.canonical) {
    next.alternates = { ...(base.alternates || {}), canonical: o.canonical };
  }
  if (o.robots) next.robots = robotsFromString(o.robots);
  return next;
}

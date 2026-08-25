import type { Metadata } from "next";
import overridesJson from "./seo-overrides.json";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { BRAND } from "@/lib/seo";

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


/**
 * Reject an override that was clearly produced by a fixed-width truncator
 * rather than written by a person.
 *
 * Command Center once wrote 35 entries cut at ~44 characters — including the
 * brand itself ("… | Global Untol", "… | Global Untold S"), which shipped a
 * broken company name into 32 titles. A truncated override is always worse
 * than the metadata the page computes for itself, so drop it.
 */
function looksTruncated(value: string): boolean {
  const trimmed = value.trimEnd();
  // A partial brand suffix: "| Global Unt…" that never reaches the full name.
  const tail = trimmed.split("|").pop()?.trim() ?? "";
  if (tail && BRAND.startsWith(tail) && tail !== BRAND) return true;
  // A sentence chopped mid-word: no terminal punctuation, right at the limit.
  if (trimmed.length >= 150 && !/[.!?…”"')\]]$/.test(trimmed)) return true;
  return false;
}

/**
 * Merge Command Center overrides onto base App Router metadata.
 *
 * `path` is the unprefixed route ("/about"), and `locale` says which language
 * is being rendered. Command Center writes locale-agnostic keys, so a single
 * English "/" entry would otherwise overwrite the title on all fourteen
 * languages — an override only reaches a translated page when it is keyed for
 * that language explicitly ("/ar/about").
 */
export function applySeoOverrides(path: string, base: Metadata, locale: string = DEFAULT_LOCALE): Metadata {
  const bare = normalizeSeoPath(path);
  const scoped = normalizeSeoPath(`/${locale}${bare === "/" ? "" : bare}`);
  const o = SEO_OVERRIDES[scoped] ?? (locale === DEFAULT_LOCALE ? SEO_OVERRIDES[bare] : undefined);
  if (!o) return base;

  const next: Metadata = { ...base };
  if (o.title && !looksTruncated(o.title)) {
    // Dynamic pages use { absolute: string }; static pages use string
    if (base.title && typeof base.title === "object" && "absolute" in base.title) {
      next.title = { absolute: o.title };
    } else {
      next.title = o.title;
    }
  }
  if (o.description && !looksTruncated(o.description)) next.description = o.description;
  if (o.canonical) {
    next.alternates = { ...(base.alternates || {}), canonical: o.canonical };
  }
  if (o.robots) next.robots = robotsFromString(o.robots);
  return next;
}

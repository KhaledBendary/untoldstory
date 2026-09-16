import "server-only";
import { cache } from "react";
import { getSingleton } from "@/lib/db/repo";
import { mergeGeo, type GeoSettings } from "./geo";

/**
 * Load the GEO/SEO settings, merged over defaults. Wrapped in React cache so a
 * single render (generateMetadata + the layout body) reads the row once. Any
 * failure falls back to the built-in defaults so the site never loses its schema.
 */
export const getGeoSettings = cache(async (): Promise<GeoSettings> => {
  try {
    return mergeGeo(await getSingleton("seo_settings"));
  } catch {
    return mergeGeo(null);
  }
});

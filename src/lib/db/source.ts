import "server-only";
import {
  getServices, getProjects, getPosts, getSingleton,
  type ServiceRow, type ProjectRow, type PostRow, type Singleton,
} from "@/lib/db/repo";
import {
  localizeService, localizeProject, localizePost, localizePostCard, localizeSingleton,
} from "@/lib/db/localize";

/**
 * The site's data, served from the new database in the exact shape the Laravel
 * API used to return for each locale. api.ts calls these on the server; every
 * function returns null on any miss or failure, so api.ts falls back to Laravel
 * and the site never goes dark during the transition.
 *
 * Parity with the old API is proven field-by-field by scripts/db-parity.mjs.
 *
 * Reads are cached in-process for a short TTL. A build renders ~1,200 pages and
 * each locale asks for the same three small tables over and over; without this
 * the site would re-query the database thousands of times. The tables are tiny,
 * so each is fetched whole once and every list/by-slug read is served from it —
 * one query per table per TTL window, not per page. Every by-slug read derives
 * from the cached list too, so a detail page costs no extra query. The public
 * site is prerendered, so a 60s window never shows stale content to visitors;
 * the dashboard reads the database directly (repo.ts), so editors always see
 * their latest save immediately.
 */

type Paginated<T> = { items: T[]; pagination: { current_page: number; last_page: number; per_page: number; total: number } };

const TTL_MS = 60_000;
type Entry = { at: number; value: Promise<unknown> };
const CACHE_KEY = Symbol.for("globaluntoldstory.dbsource.cache");
const store = ((globalThis as unknown as Record<symbol, Map<string, Entry>>)[CACHE_KEY] ??= new Map());

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as Promise<T>;
  const value = load().catch((e) => { store.delete(key); throw e; }); // never cache a failure
  store.set(key, { at: Date.now(), value });
  return value;
}

// The public site only ever sees published rows; drafts exist only in the dashboard.
const isPublished = <T extends { status: string }>(r: T) => r.status === "published";
const allServices = async () => (await cached<ServiceRow[]>("services", getServices)).filter(isPublished);
const allProjects = async () => (await cached<ProjectRow[]>("projects", getProjects)).filter(isPublished);
const allPosts = async () => (await cached<PostRow[]>("posts", getPosts)).filter(isPublished);
const oneSingleton = (key: string) => cached<Singleton | null>(`singleton:${key}`, () => getSingleton(key));

function paginate<T>(all: T[], page = 1, perPage = all.length || 1): Paginated<T> {
  const total = all.length;
  const per = Math.max(1, perPage);
  const last = Math.max(1, Math.ceil(total / per));
  const current = Math.min(Math.max(1, page), last);
  const start = (current - 1) * per;
  return { items: all.slice(start, start + per), pagination: { current_page: current, last_page: last, per_page: per, total } };
}

// Collections and singletons swallow errors and return null, so api.ts can fall
// back to Laravel on a database blip. The by-slug readers below do NOT swallow:
// they return null only for a genuine "no such row", and let real errors throw,
// so api.ts can tell "not found" (→ 404, no Laravel) from "database failed"
// (→ Laravel). That is what keeps a build with the DB active off Laravel.
const guard = async <T>(fn: () => Promise<T>): Promise<T | null> => {
  try { return await fn(); } catch (e) { console.error("DB source error:", e); return null; }
};

export const services = (locale = "en") =>
  guard(async () => (await allServices()).map((r) => localizeService(r, locale)));

export const service = async (slug: string, locale = "en") => {
  const r = (await allServices()).find((x) => x.slug === slug);
  return r ? localizeService(r, locale) : null;
};

export const portfolio = (params: { locale?: string; category?: string; page?: number; per_page?: number } = {}) =>
  guard(async () => {
    const loc = params.locale ?? "en";
    const all = await allProjects();
    const rows = params.category ? all.filter((r) => r.category_slug === params.category) : all;
    return paginate(rows.map((r) => localizeProject(r, loc)), params.page ?? 1, params.per_page ?? rows.length);
  });

export const portfolioItem = async (slug: string, locale = "en") => {
  const r = (await allProjects()).find((x) => x.slug === slug);
  return r ? localizeProject(r, locale) : null;
};

export const blog = (params: { locale?: string; category?: string; tag?: string; search?: string; page?: number; per_page?: number } = {}) =>
  guard(async () => {
    const loc = params.locale ?? "en";
    const all = await allPosts();
    const rows = all.filter((r) =>
      (!params.category || r.category_slug === params.category) &&
      (!params.tag || (r.tags ?? []).includes(params.tag!)));
    return paginate(rows.map((r) => localizePostCard(r, loc)), params.page ?? 1, params.per_page ?? rows.length);
  });

export const blogPost = async (slug: string, locale = "en") => {
  const r = (await allPosts()).find((x) => x.slug === slug);
  return r ? localizePost(r, locale) : null;
};

export const home = (locale = "en") =>
  guard(async () => { const doc = await oneSingleton("home"); return doc ? localizeSingleton(doc, locale) : null; });

export const layout = (locale = "en") =>
  guard(async () => { const doc = await oneSingleton("layout"); return doc ? localizeSingleton(doc, locale) : null; });

export const about = (locale = "en") =>
  guard(async () => { const doc = await oneSingleton("about"); return doc ? localizeSingleton(doc, locale) : null; });

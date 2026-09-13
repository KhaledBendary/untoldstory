import "server-only";
import { sql } from "@/lib/db/client";

/**
 * Reading and writing content rows.
 *
 * Translatable fields come back as { en, ar, fr, ... }; the dashboard shows the
 * language tabs, the public site picks one. Row shapes mirror the schema: fixed
 * columns plus a `data` object holding the translatable fields.
 */

export type Dict = Record<string, string>;

export type ServiceRow = {
  id: number; slug: string; icon: string | null; image_url: string | null;
  price: string | null; is_featured: boolean; sort_order: number;
  data: { title?: Dict; shortDesc?: Dict; fullDesc?: Dict; features?: Record<string, unknown> };
};

export type ProjectRow = {
  id: number; slug: string; image: string | null; video: string | null;
  video_embed: string | null; video_type: string | null; category_slug: string | null;
  grid_size: string | null; is_featured: boolean; sort_order: number;
  data: { title?: Dict; client?: Dict; category?: Dict; shortDescription?: Dict; description?: Dict; results?: Dict; metric?: Dict };
};

export type PostRow = {
  id: number; slug: string; featured_image: string | null; author_name: string | null;
  author_image: string | null; category_slug: string | null; read_minutes: number | null;
  tags: string[]; is_featured: boolean; sort_order: number; published_at: Date | null;
  data: { title?: Dict; excerpt?: Dict; body?: Dict; category?: Dict; seo?: Record<string, unknown> };
};

// ---- collections (dashboard order: sort_order) ----

export const getServices = () =>
  sql<ServiceRow[]>`select * from services order by sort_order, id`;

export const getProjects = () =>
  sql<ProjectRow[]>`select * from projects order by sort_order, id`;

export const getPosts = () =>
  sql<PostRow[]>`select * from posts order by published_at desc nulls last, id`;

export const getService = async (slug: string) =>
  (await sql<ServiceRow[]>`select * from services where slug = ${slug}`)[0] ?? null;

export const getProject = async (slug: string) =>
  (await sql<ProjectRow[]>`select * from projects where slug = ${slug}`)[0] ?? null;

export const getPost = async (slug: string) =>
  (await sql<PostRow[]>`select * from posts where slug = ${slug}`)[0] ?? null;

// ---- singletons ----

export type Singleton = Record<string, Record<string, unknown>>; // { en: {...}, ar: {...} }

export const getSingleton = async (key: string): Promise<Singleton | null> =>
  (await sql<{ data: Singleton }[]>`select data from singletons where key = ${key}`)[0]?.data ?? null;

// ---- dashboard overview ----

export async function counts() {
  const [row] = await sql<{ services: number; projects: number; posts: number }[]>`
    select
      (select count(*) from services)::int as services,
      (select count(*) from projects)::int as projects,
      (select count(*) from posts)::int    as posts
  `;
  return row;
}

// ---- writes ----

/**
 * Save an edit. The dashboard sends the fixed columns and the { en, ar }
 * values it edited; the other languages already in `data` are preserved by
 * merging field-by-field, so saving Arabic never wipes a French translation.
 */
export async function saveService(
  slug: string,
  fixed: { icon: string | null; image_url: string | null; price: string | null; is_featured: boolean },
  editedData: Record<string, Dict>,
) {
  const current = await getService(slug);
  const data = mergeI18n(current?.data as Record<string, Dict> | undefined, editedData);
  await sql`
    update services set
      icon = ${fixed.icon}, image_url = ${fixed.image_url}, price = ${fixed.price},
      is_featured = ${fixed.is_featured}, data = ${sql.json(data as Parameters<typeof sql.json>[0])}, updated_at = now()
    where slug = ${slug}
  `;
}

/** Merge edited { field: { en, ar } } into existing { field: { en, ar, fr… } }. */
function mergeI18n(existing: Record<string, Dict> = {}, edited: Record<string, Dict>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...existing };
  for (const [field, dict] of Object.entries(edited)) {
    out[field] = { ...(existing[field] as Dict | undefined), ...dict };
  }
  return out;
}

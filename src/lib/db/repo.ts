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

/**
 * Save edits to specific paths inside a singleton, for English and Arabic only.
 * The whole document is read, the given paths are written into the en and ar
 * copies, and it is written back — so every other language and every untouched
 * field is preserved exactly.
 */
export async function saveSingletonPaths(
  key: string,
  edits: { path: string; en: string; ar: string }[],
  setPath: (obj: Record<string, unknown>, path: string, value: unknown) => void,
) {
  const doc = (await getSingleton(key)) ?? {};
  const en = (doc.en as Record<string, unknown>) ?? (doc.en = {});
  const ar = (doc.ar as Record<string, unknown>) ?? (doc.ar = {});
  for (const e of edits) {
    setPath(en, e.path, e.en);
    setPath(ar, e.path, e.ar);
  }
  await sql`update singletons set data = ${sql.json(doc as Parameters<typeof sql.json>[0])}, updated_at = now() where key = ${key}`;
}

// ---- media ----

export type MediaRow = {
  id: number; url: string; pathname: string; filename: string;
  content_type: string | null; size_bytes: number | null; uploaded_at: Date;
};

export const getMedia = () =>
  sql<MediaRow[]>`select * from media order by uploaded_at desc`;

export async function addMedia(m: {
  url: string; pathname: string; filename: string; content_type: string | null; size_bytes: number | null;
}) {
  const [row] = await sql<MediaRow[]>`
    insert into media (url, pathname, filename, content_type, size_bytes)
    values (${m.url}, ${m.pathname}, ${m.filename}, ${m.content_type}, ${m.size_bytes})
    returning *
  `;
  return row;
}

export async function deleteMedia(id: number): Promise<string | null> {
  const [row] = await sql<{ pathname: string }[]>`delete from media where id = ${id} returning pathname`;
  return row?.pathname ?? null;
}

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

// ---- reads by type (dashboard) ----

const TABLES = { services: getServices, projects: getProjects, posts: getPosts } as const;

export async function listByType(type: keyof typeof TABLES) {
  return TABLES[type]();
}

export async function getByType(type: keyof typeof TABLES, slug: string) {
  if (type === "services") return getService(slug);
  if (type === "projects") return getProject(slug);
  return getPost(slug);
}

// ---- writes ----

/**
 * Save an edit. The dashboard sends the fixed columns for this type and the
 * { en, ar } values it edited; the other languages already in `data` are kept
 * by merging field-by-field, so saving Arabic never wipes a French translation.
 *
 * Fixed columns are written per table with their real names — no dynamic
 * column names reach SQL, so a type's column set is fixed in code, not input.
 */
export async function saveByType(
  type: keyof typeof TABLES,
  slug: string,
  fixed: Record<string, string | boolean | number | null>,
  editedData: Record<string, Dict>,
) {
  const current = await getByType(type, slug);
  const merged = mergeI18n(current?.data as Record<string, Dict> | undefined, editedData);
  const data = sql.json(merged as Parameters<typeof sql.json>[0]);
  const f = fixed;

  if (type === "services") {
    await sql`update services set icon=${str(f.icon)}, price=${str(f.price)},
      image_url=${str(f.image_url)}, is_featured=${bool(f.is_featured)},
      data=${data}, updated_at=now() where slug=${slug}`;
  } else if (type === "projects") {
    await sql`update projects set image=${str(f.image)}, video=${str(f.video)},
      category_slug=${str(f.category_slug)}, is_featured=${bool(f.is_featured)},
      data=${data}, updated_at=now() where slug=${slug}`;
  } else {
    await sql`update posts set featured_image=${str(f.featured_image)}, author_name=${str(f.author_name)},
      category_slug=${str(f.category_slug)}, read_minutes=${num(f.read_minutes)}, is_featured=${bool(f.is_featured)},
      data=${data}, updated_at=now() where slug=${slug}`;
  }
}

const str = (v: unknown) => (typeof v === "string" && v !== "" ? v : null);
const bool = (v: unknown) => Boolean(v);
const num = (v: unknown) => (v === "" || v == null ? null : Number(v));

function mergeI18n(existing: Record<string, Dict> = {}, edited: Record<string, Dict>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...existing };
  for (const [field, dict] of Object.entries(edited)) {
    out[field] = { ...(existing[field] as Dict | undefined), ...dict };
  }
  return out;
}

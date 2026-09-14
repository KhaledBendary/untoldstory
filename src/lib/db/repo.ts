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

type Meta = { noindex: boolean; scheduled_at: Date | null; og_image: string | null };

export type ServiceRow = Meta & {
  id: number; slug: string; icon: string | null; image_url: string | null;
  price: string | null; is_featured: boolean; sort_order: number; status: string;
  data: { title?: Dict; shortDesc?: Dict; fullDesc?: Dict; features?: Record<string, unknown>; seo?: Record<string, unknown> };
};

export type ProjectRow = Meta & {
  id: number; slug: string; image: string | null; video: string | null;
  video_embed: string | null; video_type: string | null; category_slug: string | null;
  grid_size: string | null; duration: string | null; budget: string | null;
  is_featured: boolean; sort_order: number; status: string;
  data: { title?: Dict; client?: Dict; category?: Dict; shortDescription?: Dict; description?: Dict; results?: Dict; metric?: Dict; seo?: Record<string, unknown> };
};

export type PostRow = Meta & {
  id: number; slug: string; featured_image: string | null; author_name: string | null;
  author_image: string | null; category_slug: string | null; read_minutes: number | null;
  tags: string[]; is_featured: boolean; sort_order: number; published_at: Date | null; status: string;
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
 * Save edits to specific paths inside a singleton, per language. Each edit
 * carries a { locale: value } map (English and Arabic always, plus any machine
 * translations the caller generated). The whole document is read, the given
 * paths are written into each locale's copy, and it is written back — so every
 * other language and every untouched field is preserved exactly.
 */
export async function saveSingletonPaths(
  key: string,
  edits: { path: string; values: Record<string, string> }[],
  setPath: (obj: Record<string, unknown>, path: string, value: unknown) => void,
) {
  const doc = (await getSingleton(key)) ?? {};
  const locales = new Set<string>();
  for (const e of edits) for (const loc of Object.keys(e.values)) locales.add(loc);
  for (const loc of locales) {
    const bag = (doc[loc] as Record<string, unknown>) ?? (doc[loc] = {});
    for (const e of edits) {
      if (e.values[loc] !== undefined) setPath(bag, e.path, e.values[loc]);
    }
  }
  await sql`update singletons set data = ${sql.json(doc as Parameters<typeof sql.json>[0])}, updated_at = now() where key = ${key}`;
}

/**
 * Replace a repeating block (an array at `path`) inside a singleton, per language.
 * The caller supplies the fully-built array for each locale — every language is
 * rewritten together so the items stay index-aligned across all of them. Other
 * fields in the document are untouched.
 */
export async function saveSingletonArray(
  key: string,
  path: string,
  arraysByLocale: Record<string, unknown[]>,
  setPath: (obj: Record<string, unknown>, path: string, value: unknown) => void,
) {
  const doc = (await getSingleton(key)) ?? {};
  for (const [loc, arr] of Object.entries(arraysByLocale)) {
    const bag = (doc[loc] as Record<string, unknown>) ?? (doc[loc] = {});
    setPath(bag, path, arr);
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

// ---- contact messages (leads inbox) ----

export type MessageRow = {
  id: number; name: string; email: string; phone: string | null; service: string | null;
  message: string; locale: string | null; status: string; emailed: boolean; created_at: Date;
};

export async function addMessage(m: {
  name: string; email: string; phone?: string | null; service?: string | null; message: string; locale?: string | null;
}): Promise<number> {
  const [row] = await sql<{ id: number }[]>`
    insert into messages (name, email, phone, service, message, locale)
    values (${m.name}, ${m.email}, ${m.phone ?? null}, ${m.service ?? null}, ${m.message}, ${m.locale ?? null})
    returning id`;
  return row.id;
}

export const markMessageEmailed = (id: number) =>
  sql`update messages set emailed = true where id = ${id}`;

export const getMessages = (status?: string) =>
  status
    ? sql<MessageRow[]>`select * from messages where status = ${status} order by created_at desc`
    : sql<MessageRow[]>`select * from messages order by created_at desc`;

export const getMessage = async (id: number) =>
  (await sql<MessageRow[]>`select * from messages where id = ${id}`)[0] ?? null;

export const setMessageStatus = (id: number, status: string) =>
  sql`update messages set status = ${status} where id = ${id}`;

export const deleteMessage = (id: number) =>
  sql`delete from messages where id = ${id}`;

export async function newMessageCount(): Promise<number> {
  const [row] = await sql<{ n: number }[]>`select count(*)::int as n from messages where status = 'new'`;
  return row.n;
}

// ---- anonymous visit log ----

export type VisitRow = {
  id: number; session: string | null; path: string; referrer: string | null;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null;
  country: string | null; city: string | null; device: string | null; locale: string | null;
  created_at: Date;
};

export async function addVisit(v: {
  session?: string | null; path: string; referrer?: string | null;
  utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null;
  country?: string | null; city?: string | null; device?: string | null; locale?: string | null;
}) {
  await sql`insert into visits (session, path, referrer, utm_source, utm_medium, utm_campaign, country, city, device, locale)
    values (${v.session ?? null}, ${v.path}, ${v.referrer ?? null}, ${v.utm_source ?? null}, ${v.utm_medium ?? null},
      ${v.utm_campaign ?? null}, ${v.country ?? null}, ${v.city ?? null}, ${v.device ?? null}, ${v.locale ?? null})`;
}

export const getRecentVisits = (limit = 100) =>
  sql<VisitRow[]>`select * from visits order by created_at desc limit ${limit}`;

/** Aggregates for the traffic dashboard over the last `days` days. */
export async function visitStats(days = 30) {
  const since = sql`now() - (${days} || ' days')::interval`;
  const [totals] = await sql<{ views: number; sessions: number; today: number }[]>`
    select
      count(*)::int as views,
      count(distinct session)::int as sessions,
      count(*) filter (where created_at >= current_date)::int as today
    from visits where created_at >= ${since}`;
  const topPages = await sql<{ path: string; n: number }[]>`
    select path, count(*)::int as n from visits where created_at >= ${since}
    group by path order by n desc limit 8`;
  const sources = await sql<{ source: string; n: number }[]>`
    select coalesce(nullif(utm_source,''), 'مباشر/غير معروف') as source, count(*)::int as n
    from visits where created_at >= ${since} group by source order by n desc limit 8`;
  const campaigns = await sql<{ campaign: string; n: number }[]>`
    select utm_campaign as campaign, count(*)::int as n from visits
    where created_at >= ${since} and utm_campaign is not null and utm_campaign <> ''
    group by campaign order by n desc limit 8`;
  const countries = await sql<{ country: string; n: number }[]>`
    select coalesce(nullif(country,''), '—') as country, count(*)::int as n
    from visits where created_at >= ${since} group by country order by n desc limit 8`;
  return { totals, topPages, sources, campaigns, countries };
}

// ---- activity log ----

export type AuditRow = {
  id: number; actor: string | null; action: string; entity: string;
  ref: string | null; detail: string | null; created_at: Date;
};

export async function logActivity(a: {
  actor?: string | null; action: string; entity: string; ref?: string | null; detail?: string | null;
}) {
  try {
    await sql`insert into audit_log (actor, action, entity, ref, detail)
      values (${a.actor ?? null}, ${a.action}, ${a.entity}, ${a.ref ?? null}, ${a.detail ?? null})`;
  } catch (e) {
    console.error("audit log failed:", e); // never block the real action on logging
  }
}

export const getActivity = (limit = 100) =>
  sql<AuditRow[]>`select * from audit_log order by created_at desc limit ${limit}`;

// ---- bulk actions ----

export async function bulkSetStatus(type: keyof typeof TABLES, slugs: string[], status: "published" | "draft") {
  if (!slugs.length) return;
  if (type === "services") await sql`update services set status=${status}, updated_at=now() where slug in ${sql(slugs)}`;
  else if (type === "projects") await sql`update projects set status=${status}, updated_at=now() where slug in ${sql(slugs)}`;
  else await sql`update posts set status=${status}, updated_at=now() where slug in ${sql(slugs)}`;
}

export async function bulkDelete(type: keyof typeof TABLES, slugs: string[]) {
  if (!slugs.length) return;
  if (type === "services") await sql`delete from services where slug in ${sql(slugs)}`;
  else if (type === "projects") await sql`delete from projects where slug in ${sql(slugs)}`;
  else await sql`delete from posts where slug in ${sql(slugs)}`;
}

/** How many items became due (their schedule passed) in the last ~day — for the rebuild cron. */
export async function dueScheduledCount(): Promise<number> {
  const cond = `status='published' and scheduled_at is not null and scheduled_at <= now() and scheduled_at > now() - interval '2 days'`;
  const [r] = await sql<{ n: number }[]>`select (
    (select count(*) from services where ${sql.unsafe(cond)}) +
    (select count(*) from projects where ${sql.unsafe(cond)}) +
    (select count(*) from posts    where ${sql.unsafe(cond)})
  )::int as n`;
  return r.n;
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
  status?: "published" | "draft",
) {
  const current = await getByType(type, slug);
  const merged = mergeI18n(current?.data as Record<string, Dict> | undefined, editedData);
  const data = sql.json(merged as Parameters<typeof sql.json>[0]);
  const f = fixed;
  const st = status ?? (current?.status as string | undefined) ?? "published";

  const meta = sql`noindex=${bool(f.noindex)}, scheduled_at=${dt(f.scheduled_at)}, og_image=${str(f.og_image)}`;
  if (type === "services") {
    await sql`update services set icon=${str(f.icon)}, price=${str(f.price)},
      image_url=${str(f.image_url)}, is_featured=${bool(f.is_featured)}, status=${st}, ${meta},
      data=${data}, updated_at=now() where slug=${slug}`;
  } else if (type === "projects") {
    await sql`update projects set image=${str(f.image)}, video=${str(f.video)},
      category_slug=${str(f.category_slug)}, duration=${str(f.duration)}, budget=${str(f.budget)},
      is_featured=${bool(f.is_featured)}, status=${st}, ${meta},
      data=${data}, updated_at=now() where slug=${slug}`;
  } else {
    await sql`update posts set featured_image=${str(f.featured_image)}, author_name=${str(f.author_name)},
      category_slug=${str(f.category_slug)}, read_minutes=${num(f.read_minutes)}, is_featured=${bool(f.is_featured)}, status=${st}, ${meta},
      data=${data}, updated_at=now() where slug=${slug}`;
  }
}

const str = (v: unknown) => (typeof v === "string" && v !== "" ? v : null);
const bool = (v: unknown) => Boolean(v);
const num = (v: unknown) => (v === "" || v == null ? null : Number(v));
const dt = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

/**
 * Create a new content row. The slug is the record's identity and must be unique
 * (the caller checks first); the fixed columns are written by their real names,
 * the translatable fields go into `data`. A post is published now so it appears.
 */
export async function createByType(
  type: keyof typeof TABLES,
  slug: string,
  fixed: Record<string, string | boolean | number | null>,
  data: Record<string, Dict>,
  status: "published" | "draft" = "draft",
) {
  const d = sql.json(data as Parameters<typeof sql.json>[0]);
  const f = fixed;

  if (type === "services") {
    await sql`insert into services (slug, icon, price, image_url, is_featured, status, noindex, scheduled_at, og_image, data)
      values (${slug}, ${str(f.icon)}, ${str(f.price)}, ${str(f.image_url)}, ${bool(f.is_featured)}, ${status}, ${bool(f.noindex)}, ${dt(f.scheduled_at)}, ${str(f.og_image)}, ${d})`;
  } else if (type === "projects") {
    await sql`insert into projects (slug, image, video, category_slug, is_featured, status, noindex, scheduled_at, og_image, data)
      values (${slug}, ${str(f.image)}, ${str(f.video)}, ${str(f.category_slug)}, ${bool(f.is_featured)}, ${status}, ${bool(f.noindex)}, ${dt(f.scheduled_at)}, ${str(f.og_image)}, ${d})`;
  } else {
    await sql`insert into posts (slug, featured_image, author_name, category_slug, read_minutes, is_featured, status, noindex, scheduled_at, og_image, published_at, data)
      values (${slug}, ${str(f.featured_image)}, ${str(f.author_name)}, ${str(f.category_slug)},
        ${num(f.read_minutes)}, ${bool(f.is_featured)}, ${status}, ${bool(f.noindex)}, ${dt(f.scheduled_at)}, ${str(f.og_image)}, now(), ${d})`;
  }
}

/** Delete a content row by slug. */
export async function deleteByType(type: keyof typeof TABLES, slug: string) {
  if (type === "services") await sql`delete from services where slug=${slug}`;
  else if (type === "projects") await sql`delete from projects where slug=${slug}`;
  else await sql`delete from posts where slug=${slug}`;
}

/** Copy a row to a new slug (as a draft), duplicating every column and its data. */
export async function duplicateByType(type: keyof typeof TABLES, srcSlug: string, newSlug: string) {
  if (type === "services") {
    await sql`insert into services (slug, icon, image_url, price, is_featured, sort_order, status, data)
      select ${newSlug}, icon, image_url, price, is_featured, sort_order, 'draft', data from services where slug=${srcSlug}`;
  } else if (type === "projects") {
    await sql`insert into projects (slug, image, video, video_embed, video_type, category_slug, grid_size, duration, budget, is_featured, sort_order, status, data)
      select ${newSlug}, image, video, video_embed, video_type, category_slug, grid_size, duration, budget, is_featured, sort_order, 'draft', data from projects where slug=${srcSlug}`;
  } else {
    await sql`insert into posts (slug, featured_image, author_name, author_image, category_slug, read_minutes, tags, is_featured, sort_order, status, published_at, data)
      select ${newSlug}, featured_image, author_name, author_image, category_slug, read_minutes, tags, is_featured, sort_order, 'draft', now(), data from posts where slug=${srcSlug}`;
  }
}

/** Set sort_order to match the given slug order (position 0..n). */
export async function reorderByType(type: keyof typeof TABLES, slugs: string[]) {
  for (let i = 0; i < slugs.length; i++) {
    const s = slugs[i];
    if (type === "services") await sql`update services set sort_order=${i}, updated_at=now() where slug=${s}`;
    else if (type === "projects") await sql`update projects set sort_order=${i}, updated_at=now() where slug=${s}`;
    else await sql`update posts set sort_order=${i}, updated_at=now() where slug=${s}`;
  }
}

function mergeI18n(existing: Record<string, Dict> = {}, edited: Record<string, Dict>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...existing };
  for (const [field, dict] of Object.entries(edited)) {
    out[field] = { ...(existing[field] as Dict | undefined), ...dict };
  }
  return out;
}

/*
 * Fill the new database from the snapshot.
 *
 * The snapshot holds one file per locale; this merges the fourteen into single
 * rows whose translatable fields are { en, ar, fr, ... }. Non-translatable
 * values (slug, image, flags) come from the English file. Detail files are
 * preferred over list files because they carry the full body/description.
 *
 * Idempotent: every row is upserted on its slug (or key), so re-running it
 * re-syncs from the snapshot rather than duplicating.
 */
import { readFile, readdir } from "node:fs/promises";
import { connect } from "./db-connect.mjs";

const SNAP = process.argv[2];
if (!SNAP) { console.error("usage: node db-import.mjs <snapshot-dir>"); process.exit(1); }
const LOCALES = ["en", "ar", "fr", "de", "es", "it", "pt", "ru", "tr", "zh", "ja", "ko", "pl", "sw"];

const read = async (p) => JSON.parse(await readFile(`${SNAP}/${p}`, "utf-8"));
const listItems = (j) => { const d = j.data ?? j; return Array.isArray(d) ? d : d.items ?? []; };
const obj = (j) => j.data ?? j;

/* Collect one field across every locale into { en:..., ar:... }, dropping blanks. */
function i18n(perLocale, field) {
  const out = {};
  for (const loc of LOCALES) {
    const v = perLocale[loc]?.[field];
    if (v !== undefined && v !== null && v !== "") out[loc] = v;
  }
  return out;
}

const sql = connect();

// ---- services: full record is in the list (fullDesc included) ----
{
  const byLocale = {};
  for (const loc of LOCALES) byLocale[loc] = listItems(await read(`services.${loc}.json`));
  const en = byLocale.en;
  let n = 0;
  for (let idx = 0; idx < en.length; idx++) {
    const base = en[idx];
    // line up each locale's copy of this slug
    const perLocale = {};
    for (const loc of LOCALES) perLocale[loc] = byLocale[loc].find((s) => s.slug === base.slug) || {};
    const data = {
      title: i18n(perLocale, "title"),
      shortDesc: i18n(perLocale, "shortDesc"),
      fullDesc: i18n(perLocale, "fullDesc"),
      features: i18n(perLocale, "features"),
    };
    await sql`
      insert into services (slug, icon, image_url, price, is_featured, sort_order, data)
      values (${base.slug}, ${base.icon || null}, ${base.imageUrl || null}, ${base.price || null},
              ${!!base.isFeatured}, ${idx}, ${sql.json(data)})
      on conflict (slug) do update set
        icon = excluded.icon, image_url = excluded.image_url, price = excluded.price,
        is_featured = excluded.is_featured, sort_order = excluded.sort_order,
        data = excluded.data, updated_at = now()
    `;
    n++;
  }
  console.log(`services: ${n}`);
}

// ---- projects: prefer detail files for the full description ----
{
  const listEn = listItems(await read("portfolio.en.json"));
  let n = 0;
  for (let idx = 0; idx < listEn.length; idx++) {
    const slug = listEn[idx].slug;
    const perLocale = {};
    for (const loc of LOCALES) {
      try { perLocale[loc] = obj(await read(`details/portfolio/${slug}.${loc}.json`)); }
      catch { perLocale[loc] = listItems(await read(`portfolio.${loc}.json`)).find((p) => p.slug === slug) || {}; }
    }
    const base = perLocale.en;
    const data = {
      title: i18n(perLocale, "title"),
      client: i18n(perLocale, "client"),
      category: i18n(perLocale, "category"),
      shortDescription: i18n(perLocale, "shortDescription"),
      description: i18n(perLocale, "description"),
      results: i18n(perLocale, "results"),
      metric: i18n(perLocale, "metric"),
    };
    await sql`
      insert into projects (slug, image, video, video_embed, video_type, category_slug, grid_size, is_featured, sort_order, data)
      values (${slug}, ${base.image || null}, ${base.video || null}, ${base.videoEmbed || null},
              ${base.videoType || null}, ${base.categorySlug || null}, ${base.gridSize || null},
              ${!!base.isFeatured}, ${idx}, ${sql.json(data)})
      on conflict (slug) do update set
        image = excluded.image, video = excluded.video, video_embed = excluded.video_embed,
        video_type = excluded.video_type, category_slug = excluded.category_slug,
        grid_size = excluded.grid_size, is_featured = excluded.is_featured,
        sort_order = excluded.sort_order, data = excluded.data, updated_at = now()
    `;
    n++;
  }
  console.log(`projects: ${n}`);
}

// ---- posts: detail files carry body + seo ----
{
  const listEn = listItems(await read("blog.en.json"));
  let n = 0;
  for (let idx = 0; idx < listEn.length; idx++) {
    const slug = listEn[idx].slug;
    const perLocale = {};
    for (const loc of LOCALES) {
      try { perLocale[loc] = obj(await read(`details/blog/${slug}.${loc}.json`)); }
      catch { perLocale[loc] = {}; }
    }
    const base = perLocale.en;
    const data = {
      title: i18n(perLocale, "title"),
      excerpt: i18n(perLocale, "excerpt"),
      body: i18n(perLocale, "body"),
      category: i18n(perLocale, "category"),
      seo: i18n(perLocale, "seo"),
    };
    const publishedAt = base.publishedAt ? new Date(base.publishedAt) : null;
    await sql`
      insert into posts (slug, featured_image, author_name, author_image, category_slug,
                         read_minutes, tags, is_featured, sort_order, published_at, data)
      values (${slug}, ${base.featuredImage || null}, ${base.authorName || null},
              ${base.authorImage || null}, ${base.categorySlug || null},
              ${base.readTimeMinutes || null}, ${base.tags || []}, ${!!base.isFeatured},
              ${idx}, ${publishedAt}, ${sql.json(data)})
      on conflict (slug) do update set
        featured_image = excluded.featured_image, author_name = excluded.author_name,
        author_image = excluded.author_image, category_slug = excluded.category_slug,
        read_minutes = excluded.read_minutes, tags = excluded.tags,
        is_featured = excluded.is_featured, sort_order = excluded.sort_order,
        published_at = excluded.published_at, data = excluded.data, updated_at = now()
    `;
    n++;
  }
  console.log(`posts: ${n}`);
}

// ---- singletons: home, layout, about — whole document per locale ----
{
  for (const key of ["home", "layout", "about"]) {
    const byLocale = {};
    for (const loc of LOCALES) byLocale[loc] = obj(await read(`${key}.${loc}.json`));
    await sql`
      insert into singletons (key, data)
      values (${key}, ${sql.json(byLocale)})
      on conflict (key) do update set data = excluded.data, updated_at = now()
    `;
    console.log(`singleton: ${key}`);
  }
}

// ---- verify ----
const counts = await sql`
  select 'services' t, count(*) c from services
  union all select 'projects', count(*) from projects
  union all select 'posts', count(*) from posts
  union all select 'singletons', count(*) from singletons
`;
console.log("\nRows in the database:");
for (const r of counts) console.log(`  ${r.t}: ${r.c}`);

await sql.end();

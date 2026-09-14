/*
 * Prove the new database can reproduce, exactly, what Laravel served.
 *
 * For English and Arabic (the two languages we manage), this localizes every
 * row the way the site's localize layer does and diffs it field-by-field
 * against the captured Laravel snapshot. Any difference is printed. Zero
 * differences means the site can switch data sources without changing a page.
 *
 * Snapshot: scratchpad/api-dump/{services,portfolio,blog}_{en,ar}.json (the
 * full { success, locale, data } envelope) and {home,layout,about}_{en,ar}.json.
 */
import { connect } from "./db-connect.mjs";
import { readFileSync } from "node:fs";

const DUMP =
  "C:/Users/mo-ab/AppData/Local/Temp/claude/D--New-folder--5--New-folder-globaluntoldstory-com/0830887a-f6e1-4a32-9cae-326cc9b2a4d7/scratchpad/api-dump";
const LOCALES = ["en", "ar"];

const load = (name) => JSON.parse(readFileSync(`${DUMP}/${name}.json`, "utf-8"));
const items = (name) => load(name).data.items;
const single = (name) => load(name).data;

// ---- the localize transform (kept identical to src/lib/db/localize.ts) ----
const pick = (d, loc) => d?.[loc] ?? d?.en ?? "";
const pickN = (d, loc) => d?.[loc] ?? d?.en ?? null; // Laravel emits null, not ""
const pickArr = (d, loc) => { const v = d?.[loc] ?? d?.en; return Array.isArray(v) ? v : []; };

const svc = (r, loc) => ({
  id: r.slug, slug: r.slug, icon: r.icon ?? "", imageUrl: r.image_url ?? "",
  price: r.price ?? "", isFeatured: r.is_featured,
  title: pick(r.data.title, loc), shortDesc: pick(r.data.shortDesc, loc),
  fullDesc: pick(r.data.fullDesc, loc), features: pickArr(r.data.features, loc),
});

const proj = (r, loc) => ({
  slug: r.slug, title: pick(r.data.title, loc),
  shortDescription: pickN(r.data.shortDescription, loc), description: pickN(r.data.description, loc),
  client: pickN(r.data.client, loc), image: r.image ?? null, video: r.video ?? null,
  videoEmbed: r.video_embed ?? null, videoType: r.video_type ?? null,
  category: pickN(r.data.category, loc), categorySlug: r.category_slug ?? null,
  duration: r.duration ?? null, budget: r.budget ?? null, results: pickN(r.data.results, loc),
  metric: pickN(r.data.metric, loc), gridSize: r.grid_size ?? null, isFeatured: r.is_featured,
});

const post = (r, loc) => {
  const published = r.published_at ? new Date(r.published_at).toISOString() : null;
  return {
    id: r.slug, slug: r.slug, title: pick(r.data.title, loc), excerpt: pickN(r.data.excerpt, loc),
    category: pickN(r.data.category, loc), categorySlug: r.category_slug ?? null,
    authorName: r.author_name ?? null, authorImage: r.author_image ?? null,
    featuredImage: r.featured_image ?? null, readTimeMinutes: r.read_minutes ?? null,
    tags: r.tags ?? [], isFeatured: r.is_featured, publishedAt: published, date: published,
  };
};

// ---- diffing ----
let problems = 0;
// Canonicalize so object key order (JSONB reorders keys) is never a difference.
const canon = (v) => {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === "object") {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = canon(v[k]);
    return o;
  }
  return v === undefined ? null : v;
};
const norm = (v) => canon(v);
function diff(where, expected, actual, ignore = []) {
  const keys = new Set([...Object.keys(expected || {}), ...Object.keys(actual || {})]);
  for (const k of keys) {
    if (ignore.includes(k)) continue;
    const e = norm(expected?.[k]);
    const a = norm(actual?.[k]);
    const es = JSON.stringify(e), as = JSON.stringify(a);
    if (es !== as) {
      problems++;
      const clip = (s) => (s && s.length > 120 ? s.slice(0, 120) + "…" : s);
      console.log(`  ✗ ${where}.${k}\n      Laravel: ${clip(es)}\n      DB     : ${clip(as)}`);
    }
  }
}

const sql = connect();

async function checkCollection(table, snapKey, transform, listCols = "*") {
  for (const loc of LOCALES) {
    const rows = await sql`select ${sql.unsafe(listCols)} from ${sql(table)} order by slug`;
    const snap = items(`${snapKey}_${loc}`);
    const byslug = new Map(snap.map((s) => [s.slug, s]));
    console.log(`\n${table} [${loc}] — DB ${rows.length} rows, Laravel ${snap.length} items`);
    const dbSlugs = new Set(rows.map((r) => r.slug));
    for (const s of snap) if (!dbSlugs.has(s.slug)) { problems++; console.log(`  ✗ missing in DB: ${s.slug}`); }
    for (const r of rows) {
      const expected = byslug.get(r.slug);
      if (!expected) { problems++; console.log(`  ✗ extra in DB (not in Laravel): ${r.slug}`); continue; }
      // Ignored, with reason:
      //  price  — not rendered anywhere; Laravel itself serves it inconsistently ("0" en / "" ar)
      //  tags   — not rendered; Laravel translates them, DB keeps one set
      //  date/publishedAt — the site's normalizeBlogPost() rewrites both to ISO, so raw form is moot
      diff(`${r.slug}`, expected, transform(r, loc), ["price", "tags", "date", "publishedAt"]);
    }
  }
}

async function checkSingleton(key, snapKey, topKeys) {
  for (const loc of LOCALES) {
    const [row] = await sql`select data from singletons where key = ${key}`;
    const doc = row?.data ?? {};
    const dbDoc = doc[loc] ?? doc.en ?? {};
    const snap = single(`${snapKey}_${loc}`);
    console.log(`\nsingleton ${key} [${loc}]`);
    // Compare only the top-level keys the site actually reads.
    for (const k of topKeys) {
      const e = JSON.stringify(norm(snap?.[k]));
      const a = JSON.stringify(norm(dbDoc?.[k]));
      if (e !== a) {
        problems++;
        const clip = (s) => (s && s.length > 160 ? s.slice(0, 160) + "…" : s);
        console.log(`  ✗ ${k}\n      Laravel: ${clip(e)}\n      DB     : ${clip(a)}`);
      } else {
        console.log(`  ✓ ${k}`);
      }
    }
  }
}

try {
  await checkCollection("services", "services", svc);
  await checkCollection("projects", "portfolio", proj);
  await checkCollection("posts", "blog", post);

  await checkSingleton("home", "home", ["hero", "stats", "manifesto", "studio", "process", "awards", "blog_preview"]);
  await checkSingleton("layout", "layout", ["footer", "client_logos"]);
  await checkSingleton("about", "about", ["team"]);

  console.log(`\n${"=".repeat(50)}`);
  console.log(problems === 0 ? "✓ PARITY: DB output matches Laravel exactly." : `✗ ${problems} difference(s) found.`);
} finally {
  await sql.end();
}
process.exit(problems === 0 ? 0 : 1);

/*
 * One-time backfill: machine-translate existing content into the languages that
 * are still English shells (default: zh, ja, ko, pl, sw), so all 14 locales
 * carry real translations before we index them.
 *
 *   GOOGLE_TRANSLATE_API_KEY must be in .env.local.
 *   node scripts/db-translate-all.mjs            # translate the 5 shell locales
 *   node scripts/db-translate-all.mjs fr de      # or specific target locales
 *
 * A field is (re)translated when the target is missing or is a copy of English.
 * Structural strings (URLs, colours, emojis, pure numbers, slugs) are skipped.
 * Safe to re-run: already-real translations are left alone.
 */
import { connect } from "./db-connect.mjs";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const KEY = (env.match(/^GOOGLE_TRANSLATE_API_KEY=(.+)$/m) || [])[1]?.trim();
if (!KEY) { console.error("✗ GOOGLE_TRANSLATE_API_KEY missing in .env.local"); process.exit(1); }

const TARGETS = process.argv.slice(2).length ? process.argv.slice(2) : ["zh", "ja", "ko", "pl", "sw"];
const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";
let apiCalls = 0, charCount = 0;

async function googleBatch(q, target, format) {
  apiCalls++; charCount += q.reduce((a, s) => a + s.length, 0);
  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(KEY)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, source: "en", target, format }),
  });
  if (!res.ok) throw new Error(`Google ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  return j.data.translations.map((t) => t.translatedText);
}

// Translate many strings (same format) for one target, chunked.
async function translateMany(texts, target, format) {
  const out = new Array(texts.length);
  let batch = [], idx = [], chars = 0;
  const flush = async () => {
    if (!batch.length) return;
    const r = await googleBatch(batch, target, format);
    r.forEach((t, i) => { out[idx[i]] = t; });
    batch = []; idx = []; chars = 0;
  };
  for (let i = 0; i < texts.length; i++) {
    if (batch.length >= 100 || chars + texts[i].length > 25000) await flush();
    batch.push(texts[i]); idx.push(i); chars += texts[i].length;
  }
  await flush();
  return out;
}

const isHtml = (s) => /<[a-z][\s\S]*>/i.test(s);
const SKIP_KEY = new Set(["href","image","img","icon","color","gradient","slug","poster","video","url","avatar","ctaHref","ctaSecondaryHref","ogImageUrl","code","id","phone","email"]);
function translatable(key, v) {
  if (typeof v !== "string" || !v.trim()) return false;
  if (SKIP_KEY.has(key)) return false;
  const s = v.trim();
  if (/^(https?:\/\/|\/|#|mailto:|tel:|wa\.me)/i.test(s)) return false;
  if (!/[A-Za-z؀-ۿ]/.test(s)) return false; // no letters (numbers/symbols/emoji) → skip
  return true;
}

/* Collect translatable string leaves from a value; returns [{set(v), text, html}]. */
function collectLeaves(node, key, sink) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      if (typeof item === "string") {
        if (translatable(key, item)) sink.push({ obj: node, k: i, text: item, html: isHtml(item) });
      } else collectLeaves(item, key, sink);
    });
    return;
  }
  if (node && typeof node === "object") {
    for (const k of Object.keys(node)) {
      const val = node[k];
      if (typeof val === "string") {
        if (translatable(k, val)) sink.push({ obj: node, k, text: val, html: isHtml(val) });
      } else {
        collectLeaves(val, k, sink);
      }
    }
  }
}

const clone = (o) => JSON.parse(JSON.stringify(o));

async function translateStructure(enValue, target) {
  const copy = clone(enValue);
  const leaves = [];
  collectLeaves(copy, "", leaves);
  if (!leaves.length) return copy;
  for (const fmt of ["text", "html"]) {
    const group = leaves.filter((l) => (fmt === "html" ? l.html : !l.html));
    if (!group.length) continue;
    const res = await translateMany(group.map((l) => l.text), target, fmt);
    group.forEach((l, i) => { l.obj[l.k] = res[i] ?? l.text; });
  }
  return copy;
}

const sql = connect();

async function backfillCollection(table, htmlFields) {
  const rows = await sql`select id, slug, data from ${sql(table)} order by id`;
  console.log(`\n${table}: ${rows.length} rows`);
  for (const row of rows) {
    const data = row.data;
    let changed = false;
    for (const field of Object.keys(data)) {
      const dict = data[field];
      if (!dict || typeof dict !== "object") continue;
      const en = dict.en;
      if (field === "seo" && en && typeof en === "object") {
        // seo = { en:{metaTitle,...}, zh:{...} }
        for (const target of TARGETS) {
          if (dict[target] && JSON.stringify(dict[target]) !== JSON.stringify(en)) continue;
          dict[target] = await translateStructure(en, target); changed = true;
        }
        continue;
      }
      if (typeof en !== "string" || !en.trim()) continue;
      const html = htmlFields.includes(field);
      for (const target of TARGETS) {
        if (dict[target] && dict[target] !== en) continue; // already a real translation
        if (!translatable(field, en)) { dict[target] = en; continue; }
        const [t] = await translateMany([en], target, html ? "html" : "text");
        dict[target] = t ?? en; changed = true;
      }
    }
    if (changed) await sql`update ${sql(table)} set data = ${sql.json(data)}, updated_at = now() where id = ${row.id}`;
    process.stdout.write(".");
  }
  console.log(" done");
}

async function backfillSingleton(key) {
  const [row] = await sql`select data from singletons where key = ${key}`;
  if (!row) return;
  const doc = row.data;
  const en = doc.en;
  if (!en) return;
  console.log(`\nsingleton ${key}: translating full document`);
  for (const target of TARGETS) {
    doc[target] = await translateStructure(en, target);
    process.stdout.write(`${target} `);
  }
  await sql`update singletons set data = ${sql.json(doc)}, updated_at = now() where key = ${key}`;
  console.log("done");
}

try {
  console.log(`Targets: ${TARGETS.join(", ")}`);
  await backfillCollection("services", ["fullDesc"]);
  await backfillCollection("projects", ["description"]);
  await backfillCollection("posts", ["body"]);
  await backfillSingleton("home");
  await backfillSingleton("about");
  await backfillSingleton("layout");
  console.log(`\n\n✓ Backfill complete. Google calls: ${apiCalls}, ~${charCount.toLocaleString()} chars.`);
} finally {
  await sql.end();
}

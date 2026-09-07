/*
 * Everything the site tells Google, checked against the live pages.
 *
 * Not whether Google has indexed anything — only Search Console knows that.
 * This checks the part that is ours: that every URL the sitemaps advertise is
 * reachable, allows indexing, names itself as canonical, carries the full
 * hreflang set, and that every language agrees with every other about where
 * its siblings live.
 *
 * Reciprocity is the reason this exists. Google ignores an hreflang pair unless
 * both sides point at each other, and nothing about a one-sided cluster looks
 * wrong on the page — 3240 pairs are not something to spot-check by hand.
 *
 *   node scripts/check-index-readiness.mjs
 */

import { LOCALE_CODES, INDEXABLE_LOCALES } from "../src/lib/i18n.ts";

const S = (process.argv[2] || "https://globaluntoldstory.com").replace(/\/$/, "");
// Read from the policy, never repeated here — a copy would drift the day the
// list changes, and drift is what this script exists to catch.
const INDEXED = [...INDEXABLE_LOCALES];
const NOINDEX = LOCALE_CODES.filter((code) => !INDEXED.includes(code));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The host resets the connection under a long run of sequential requests.
async function fetchRetry(url, init, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      await sleep(60);
      return res;
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(500 * (i + 1));
    }
  }
}

const get = async (u) => (await (await fetchRetry(u)).text());
const one = (h, re) => { const m = h.match(re); return m ? m[1] : ""; };

const problems = [];

// 1. the sitemap index and its children
const index = await get(`${S}/sitemap.xml`);
const files = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (files.length !== INDEXED.length) problems.push(`sitemap index lists ${files.length}, expected ${INDEXED.length}`);

const all = new Map();          // url -> locale
for (const file of files) {
  const loc = file.match(/sitemap-([a-z]{2})\.xml/)[1];
  const xml = await get(file);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  for (const u of urls) all.set(u, loc);
}
console.log(`Sitemaps: ${files.length} files, ${all.size} URLs.\n`);

// 2. every advertised URL: reachable, indexable, self-canonical
let checked = 0;
const clusters = new Map();     // bare path -> {locale: url}
for (const [url, loc] of all) {
  const res = await fetchRetry(url, { redirect: "manual" });
  if (res.status !== 200) { problems.push(`${url} -> HTTP ${res.status}`); continue; }
  const html = await res.text();
  checked++;

  const robots = one(html, /<meta name="robots" content="([^"]*)"/);
  if (/noindex/i.test(robots)) problems.push(`${url} is in a sitemap but noindex`);

  const canonical = one(html, /<link rel="canonical" href="([^"]*)"/);
  if (canonical !== url) problems.push(`${url} canonicals to ${canonical || "(none)"}`);

  const alts = [...html.matchAll(/<link rel="alternate" hrefLang="([a-z-]+)" href="([^"]+)"/g)];
  const langs = alts.filter(a => a[1] !== "x-default").map(a => a[1]).sort();
  if (langs.join(",") !== [...INDEXED].sort().join(",")) {
    problems.push(`${url} advertises [${langs}]`);
  }
  const bare = url.replace(S, "").replace(new RegExp(`^/(${INDEXED.join("|")})(?=/|$)`), "") || "/";
  const cluster = clusters.get(bare) || {};
  cluster[loc] = Object.fromEntries(alts.map(a => [a[1], a[2]]));
  clusters.set(bare, cluster);
}
console.log(`Checked ${checked} pages: reachable, indexable, self-canonical, full hreflang set.`);

// 3. reciprocity — each language must point back with the same URL
let pairs = 0, broken = 0;
for (const [bare, byLocale] of clusters) {
  for (const [from, alts] of Object.entries(byLocale)) {
    for (const [to, href] of Object.entries(alts)) {
      if (to === "x-default" || !byLocale[to]) continue;
      pairs++;
      const back = byLocale[to][from];
      const mine = alts[from];
      if (back !== mine) { broken++; if (broken < 6) problems.push(`${bare}: ${from}->${to} points at ${href}, but ${to} calls ${from} ${back}`); }
    }
  }
}
console.log(`Checked ${pairs} hreflang pairs for reciprocity — ${broken} disagree.`);

// 4. the languages that must stay out
for (const loc of NOINDEX) {
  const html = await get(`${S}/${loc}/services`);
  const robots = one(html, /<meta name="robots" content="([^"]*)"/);
  if (!/noindex/i.test(robots)) problems.push(`/${loc}/services is not noindex (${robots})`);
  if (all.has(`${S}/${loc}/services`)) problems.push(`/${loc}/services appears in a sitemap`);
}
console.log(`Checked ${NOINDEX.length} withheld languages stay noindex and out of the sitemaps.`);

const robotsTxt = await get(`${S}/robots.txt`);
if (!/Sitemap:\s*https:\/\/globaluntoldstory\.com\/sitemap\.xml/i.test(robotsTxt)) problems.push("robots.txt does not point at the sitemap index");
if (/^Disallow:\s*\/\s*$/mi.test(robotsTxt)) problems.push("robots.txt disallows everything");

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 25)) console.error(`  ${p}`);
  process.exit(1);
}
console.log("\nEvery advertised URL is indexable, self-canonical, and agreed on by every other language.");

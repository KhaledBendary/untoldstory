/**
 * Post-build SEO check.
 *
 * Reads the prerendered HTML in .next/server/app and asserts the invariants
 * that were broken before: every page needs a title within SERP limits, a
 * description within limits, a self-canonical (a page pointing its canonical
 * at the homepage is asking to be deindexed), an <h1> in the served markup,
 * and a complete hreflang cluster.
 *
 * Usage: npm run seo:audit   (after `npm run build`)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = ".next/server/app";
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;
const EXPECTED_HREFLANG = 15; // 14 locales + x-default

if (!fs.existsSync(ROOT)) {
  console.error(`No build found at ${ROOT}. Run \`npm run build\` first.`);
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html") && !entry.name.startsWith("_")) out.push(full);
  }
  return out;
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"')
   .replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const problems = [];
const titles = new Map();
const files = walk(ROOT);

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const route = file.split(path.sep).join("/").replace(ROOT, "").replace(/\.html$/, "");
  const at = (msg) => problems.push(`${route}: ${msg}`);

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const hreflang = (html.match(/hrefLang=/gi) || []).length;

  if (!title) at("no <title>");
  else {
    const value = decode(title);
    if (value.length > TITLE_MAX) at(`title ${value.length} chars (max ${TITLE_MAX})`);
    titles.set(value, [...(titles.get(value) || []), route]);
  }

  if (!description) at("no meta description");
  else if (decode(description).length > DESCRIPTION_MAX)
    at(`description ${decode(description).length} chars (max ${DESCRIPTION_MAX})`);

  if (!canonical) at("no canonical");
  else {
    const expected = "https://globaluntoldstory.com" + (route === "/en" ? "" : route.replace(/^\/en/, ""));
    if (canonical !== expected) at(`canonical is ${canonical}, expected ${expected}`);
  }

  if (!/<h1[\s>]/.test(html)) at("no <h1> in server-rendered HTML");
  if (hreflang < EXPECTED_HREFLANG) at(`${hreflang} hreflang links (expected ${EXPECTED_HREFLANG})`);
}

console.log(`Checked ${files.length} prerendered pages.`);

// Titles shared across locales are expected where the CMS has no translation,
// so report them without failing the run.
const shared = [...titles.entries()].filter(([, routes]) => routes.length > 1);
if (shared.length) {
  console.log(`\n${shared.length} title(s) reused across locales (untranslated CMS records):`);
  for (const [title, routes] of shared.slice(0, 10)) {
    console.log(`  x${routes.length}  ${title.slice(0, 64)}`);
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems.slice(0, 40)) console.error(`  ${problem}`);
  process.exit(1);
}

console.log("\nAll SEO invariants hold.");

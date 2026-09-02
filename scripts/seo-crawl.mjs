/**
 * Full-site SEO crawl against a running server.
 *
 * `seo:audit` reads the prerendered HTML, which only covers the locales built
 * ahead of time. The other twelve render on first request, so the only way to
 * check them is to ask for them. This walks every route in every locale and
 * applies the same invariants to what the server actually returns.
 *
 * Usage:
 *   npm run build && npm start -- -p 3400
 *   npm run seo:crawl -- http://localhost:3400
 */
import { LOCALE_CODES, INDEXABLE_LOCALES, DEFAULT_LOCALE, isIndexableLocale, localizedPath } from "../src/lib/i18n.ts";

const ORIGIN = (process.argv[2] || "http://localhost:3400").replace(/\/$/, "");
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;
// Only indexable locales join the hreflang cluster; the rest are noindex
// until their CMS copy exists, so they are not advertised as alternates.
const EXPECTED_HREFLANG = INDEXABLE_LOCALES.length + 1; // + x-default
const CONCURRENCY = 4;        // the upstream API sits behind this server

const ROUTES = [
  "/", "/about", "/contact", "/insights", "/services", "/work",
  "/privacy", "/terms", "/cookies",
  "/services/on-ground-egypt",
  "/services/commercial-video-production",
  "/services/documentary-production-egypt",
  "/services/corporate-video-production-egypt",
  "/services/event-production-live-streaming-egypt",
  "/services/tv-show-production-live-broadcast",
  "/services/podcast-production",
  "/services/post-production",
  "/services/motion-graphics-cgi-vfx-ai",
  "/services/dubbing-voice-over-localization",
  "/services/commercial-photography",
  "/services/performance-marketing-creative-strategy",
  "/services/original-ip-development",
  "/work/apache-corporate-industrial-production-in-egypt",
  "/work/apache-oil-gas-production-in-egypt",
  "/work/engazat-agricultural-irrigation-production-in-egypt",
  "/work/adnoc-gas-corporate-event-workshop-production",
  "/work/alliance-corporate-event-production",
  "/work/enap-industrial-desert-production-in-egypt",
  "/work/hamaki-concert-coverage-live-event-production",
  "/work/huawei-commercial-production-in-egypt",
  "/work/ilo-upper-egypt-documentary-film-production",
  "/work/apache-egypt-operations-documentary",
  "/work/apache-egypt-operations-and-community-impact-film",
  "/work/engazaat-dakhla-smart-agriculture-documentary",
  "/insights/how-to-choose-a-media-production-agency-in-egypt",
  "/insights/the-video-production-journey-from-idea-to-impact",
  "/insights/why-every-brand-needs-a-story-that-moves-people",
  "/insights/professional-film-production-equipment",
];

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"')
   .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2F;/g, "/");

const pick = (html, re) => (html.match(re) || [])[1];

async function check(route, locale) {
  const path = localizedPath(route, locale);
  const problems = [];
  let response;

  try {
    response = await fetch(`${ORIGIN}${path}`, { redirect: "manual" });
  } catch (error) {
    return { path, problems: [`request failed: ${error.message}`] };
  }

  if (response.status !== 200) {
    return { path, problems: [`HTTP ${response.status}`] };
  }

  const html = await response.text();
  const title = pick(html, /<title>([^<]*)<\/title>/);
  const description = pick(html, /<meta name="description" content="([^"]*)"/);
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const lang = pick(html, /<html lang="([^"]*)"/);
  const dir = pick(html, /<html[^>]*dir="([^"]*)"/);
  const hreflang = (html.match(/hrefLang=/gi) || []).length;
  const h1 = (html.match(/<h1[\s>]/g) || []).length;

  if (!title) problems.push("no <title>");
  else if (decode(title).length > TITLE_MAX)
    problems.push(`title ${decode(title).length} chars`);

  if (!description) problems.push("no meta description");
  else if (decode(description).length > DESCRIPTION_MAX)
    problems.push(`description ${decode(description).length} chars`);

  const expectedCanonical = `https://globaluntoldstory.com${path === "/" ? "" : path}`;
  if (!canonical) problems.push("no canonical");
  else if (canonical !== expectedCanonical)
    problems.push(`canonical ${canonical} (expected ${expectedCanonical})`);

  if (lang !== locale) problems.push(`lang="${lang}" (expected "${locale}")`);
  const expectedDir = locale === "ar" ? "rtl" : "ltr";
  if (dir !== expectedDir) problems.push(`dir="${dir}" (expected "${expectedDir}")`);

  if (h1 !== 1) problems.push(`${h1} <h1> elements (expected exactly 1)`);
  if (hreflang !== EXPECTED_HREFLANG) problems.push(`${hreflang} hreflang links (expected ${EXPECTED_HREFLANG})`);

  // A locale we do not index must say so, and one we do index must not.
  const robots = pick(html, /<meta name="robots" content="([^"]*)"/) || "";
  const noindexed = /noindex/i.test(robots);
  if (isIndexableLocale(locale) && noindexed) problems.push(`indexable locale marked "${robots}"`);
  if (!isIndexableLocale(locale) && !noindexed) problems.push("non-indexable locale is missing noindex");
  if (!/application\/ld\+json/.test(html)) problems.push("no structured data");

  return { path, problems, title: title ? decode(title) : "" };
}

async function run() {
  const jobs = [];
  for (const locale of LOCALE_CODES) {
    for (const route of ROUTES) jobs.push({ route, locale });
  }

  console.log(`Crawling ${jobs.length} URLs at ${ORIGIN} …\n`);

  const results = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < jobs.length) {
        const { route, locale } = jobs[cursor++];
        const result = await check(route, locale);
        results.push(result);
        if (results.length % 50 === 0) {
          process.stdout.write(`  ${results.length}/${jobs.length}\n`);
        }
      }
    }),
  );

  const failed = results.filter((r) => r.problems.length);
  console.log(`\nChecked ${results.length} URLs across ${LOCALE_CODES.length} locales.`);

  // English is the unprefixed canonical, so /en/* must redirect, not render.
  const enRedirects = await Promise.all(
    ["/en", "/en/services", "/en/about"].map(async (p) => {
      const r = await fetch(`${ORIGIN}${p}`, { redirect: "manual" });
      return { path: p, status: r.status };
    }),
  );
  for (const { path, status } of enRedirects) {
    if (status !== 308 && status !== 301) failed.push({ path, problems: [`HTTP ${status} (expected a redirect)`] });
  }

  if (failed.length) {
    console.error(`\n${failed.length} URL(s) with problems:`);
    for (const { path, problems } of failed.slice(0, 60)) {
      console.error(`  ${path}`);
      for (const problem of problems) console.error(`      ${problem}`);
    }
    process.exit(1);
  }

  const cspProblems = await checkContentSecurityPolicy();
  if (cspProblems.length) {
    console.error(`
Content-Security-Policy would block analytics:`);
    for (const problem of cspProblems) console.error(`  ${problem}`);
    process.exit(1);
  }
  console.log(`Also verified /en/* redirects to the unprefixed URLs, and that CSP allows the analytics endpoints.`);
  console.log("\nEvery URL passes: title, description, canonical, lang, dir, h1, hreflang, structured data.");
}

/*
 * The tags are useless if the policy refuses their beacons.
 *
 * connect-src once listed https://*.analytics.google.com without the bare
 * https://analytics.google.com, and a `*.` wildcard does not match the host
 * itself — so every GA4 page_view was refused by the browser while the tag
 * still loaded, the cookies were still written, and the property read zero.
 * Nothing about the page looked wrong; the evidence was a console error.
 *
 * These are the hosts gtag actually posts to. A missing one is silent in
 * production, so it fails the crawl instead.
 */
async function checkContentSecurityPolicy() {
  const required = {
    "connect-src": [
      "https://www.google-analytics.com",
      "https://analytics.google.com",
      "https://stats.g.doubleclick.net",
      "https://www.google.com",
      "https://connect.facebook.net",
      "https://www.facebook.com",
    ],
    "script-src": ["https://www.googletagmanager.com", "https://connect.facebook.net"],
    "img-src": ["https://www.google-analytics.com", "https://www.facebook.com"],
  };

  const res = await fetch(`${ORIGIN}/`);
  const csp = res.headers.get("content-security-policy");
  if (!csp) return ["no Content-Security-Policy header"];

  const directives = new Map(
    csp.split(";").map((d) => d.trim()).filter(Boolean).map((d) => {
      const [name, ...values] = d.split(/\s+/);
      return [name, values];
    }),
  );

  const missing = [];
  for (const [directive, hosts] of Object.entries(required)) {
    const allowed = directives.get(directive);
    if (!allowed) { missing.push(`${directive} is not set`); continue; }
    for (const host of hosts) if (!allowed.includes(host)) missing.push(`${directive} is missing ${host}`);
  }
  return missing;
}

run();

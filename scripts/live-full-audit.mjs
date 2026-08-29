/**
 * Live SEO + security probe. Sequential + delay to avoid Vercel Challenge.
 * Read-only GETs/HEADs only. No payloads, no auth bypass.
 */
const SITE = "https://globaluntoldstory.com";
const WWW = "https://www.globaluntoldstory.com";
const API = "https://api.globaluntoldstory.com";
const DELAY_MS = 550;
const UA = "Mozilla/5.0 (compatible; GlobalUntoldStoryAudit/2026-08-26)";

const FALLBACK_SERVICES = [
  "on-ground-egypt",
  "commercial-video-production",
  "documentary-production-egypt",
  "corporate-video-production-egypt",
  "event-production-live-streaming-egypt",
  "tv-show-production-live-broadcast",
  "podcast-production",
  "post-production",
  "motion-graphics-cgi-vfx-ai",
  "dubbing-voice-over-localization",
  "commercial-photography",
  "performance-marketing-creative-strategy",
  "original-ip-development",
];
const FALLBACK_POSTS = [
  "the-video-production-journey-from-idea-to-impact",
  "why-every-brand-needs-a-story-that-moves-people",
  "how-to-choose-a-media-production-agency-in-egypt",
  "tv-commercial-production-in-egypt",
  "corporate-video-production-in-cairo",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function raw(url, { method = "GET", follow = false, timeout = 20000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      method,
      redirect: follow ? "follow" : "manual",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,application/json,*/*" },
    });
    const headers = {};
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });
    let body = "";
    if (method !== "HEAD") {
      const buf = await res.arrayBuffer();
      body = Buffer.from(buf).toString("utf8");
    }
    return {
      url,
      status: res.status,
      statusText: res.statusText,
      location: headers.location || null,
      headers,
      body,
      bytes: Buffer.byteLength(body),
    };
  } catch (err) {
    return { url, status: 0, error: String(err), headers: {}, body: "", location: null, bytes: 0 };
  } finally {
    clearTimeout(t);
  }
}

function pick(html, re, g = 1) {
  const m = html.match(re);
  return m ? m[g] : null;
}
function all(html, re, g = 1) {
  return [...html.matchAll(re)].map((m) => m[g]);
}
function decode(s) {
  return (s || "")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}
function stripTags(s) {
  return decode(s || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function h1Text(html) {
  const m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripTags(m[1]) : null;
}
function robotsMeta(html) {
  return pick(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
}
function jsonld(html) {
  return all(html, /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi).map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return { parseError: true, raw: s.slice(0, 200) };
    }
  });
}
function schemaTypes(blocks) {
  const types = [];
  const walk = (n) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (typeof n === "object") {
      if (n["@type"]) types.push(...(Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
      if (n["@graph"]) walk(n["@graph"]);
      for (const v of Object.values(n)) if (v && typeof v === "object") walk(v);
    }
  };
  walk(blocks);
  return [...new Set(types)];
}

function headerAudit(headers, kind) {
  const h = headers || {};
  const missing = [];
  const notes = [];
  const want = {
    "strict-transport-security": true,
    "x-content-type-options": "nosniff",
    "x-frame-options": true,
    "content-security-policy": true,
    "referrer-policy": true,
    "permissions-policy": true,
  };
  for (const [k, v] of Object.entries(want)) {
    if (!h[k]) missing.push(k);
    else if (v !== true && !String(h[k]).toLowerCase().includes(String(v))) notes.push(`${k}=${h[k]}`);
  }
  if (h.server) notes.push(`server=${h.server}`);
  if (h["x-powered-by"]) notes.push(`x-powered-by=${h["x-powered-by"]}`);
  if (h["x-vercel-mitigated"]) notes.push(`WAF=${h["x-vercel-mitigated"]}`);
  return { kind, missing, notes, cache: h["cache-control"] || null, csp: h["content-security-policy"] || null };
}

function pageFacts(res) {
  const html = res.body || "";
  const title = decode(pick(html, /<title>([^<]*)<\/title>/i) || "");
  const desc = decode(pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || "");
  const canonical = pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const hreflang = all(html, /hreflang=["']([^"']+)["']/gi);
  const ogLocale = pick(html, /property=["']og:locale["'][^>]+content=["']([^"']+)["']/i)
    || pick(html, /content=["']([^"']+)["'][^>]+property=["']og:locale["']/i);
  const types = schemaTypes(jsonld(html));
  const visible = stripTags(html);
  const words = visible ? visible.split(/\s+/).filter(Boolean).length : 0;
  return {
    url: res.url,
    status: res.status,
    location: res.location,
    title,
    titleLen: title.length,
    desc,
    descLen: desc.length,
    canonical,
    robots: robotsMeta(html),
    hreflang,
    ogLocale,
    h1: h1Text(html),
    h1Count: (html.match(/<h1\b/gi) || []).length,
    schema: types,
    words,
    loading: />Loading/i.test(html),
    htmlLang: pick(html, /<html[^>]+lang=["']([^"']+)["']/i),
    dir: pick(html, /<html[^>]+dir=["']([^"']+)["']/i),
    hasFaq: /FAQPage|itemtype=["']https:\/\/schema.org\/Question/i.test(html) || types.includes("FAQPage"),
    hasVideoObject: types.includes("VideoObject"),
    hasArticle: types.includes("Article") || types.includes("BlogPosting"),
    mitigated: res.headers["x-vercel-mitigated"] || null,
  };
}

const out = { when: new Date().toISOString(), redirects: [], pages: [], files: {}, api: {}, security: {}, exposures: [], notes: [] };

async function step(label, fn) {
  process.stderr.write(`… ${label}\n`);
  await sleep(DELAY_MS);
  return fn();
}

// Redirects
const redirectTargets = [
  [`${WWW}/`, "www https"],
  [`http://www.globaluntoldstory.com/`, "www http"],
  [`http://globaluntoldstory.com/`, "apex http"],
  [`${SITE}/en`, "/en"],
  [`${SITE}/en/services`, "/en/services"],
  [`${SITE}/about-us`, "/about-us"],
  [`${SITE}/about-us/`, "/about-us/"],
  [`${SITE}/contact-us`, "/contact-us"],
  [`${SITE}/corporate-video-production-in-cairo-what-every-brand-needs-to-know`, "wp blog cairo"],
  [`${SITE}/tv-commercial-production-in-egypt-complete-guide-2026`, "wp blog tv"],
  [`${SITE}/service/on-ground-production`, "old service"],
  [`${SITE}/service/on-ground-production-services-in-egypt`, "old service long"],
  [`${SITE}/media-production-agency-in-egypt`, "old article"],
  [`${SITE}/portfolios`, "/portfolios"],
  [`${SITE}/wp-admin`, "/wp-admin"],
  [`${SITE}/wp-login.php`, "/wp-login.php"],
];
for (const [url, label] of redirectTargets) {
  const r = await step(label, () => raw(url, { method: "HEAD" }));
  out.redirects.push({ label, url, status: r.status, location: r.location, error: r.error || null, waf: r.headers["x-vercel-mitigated"] || null });
}

const pageUrls = [
  `${SITE}/`,
  `${SITE}/ar`,
  `${SITE}/de`,
  `${SITE}/fr`,
  `${SITE}/zh`,
  `${SITE}/services`,
  `${SITE}/ar/services`,
  `${SITE}/services/on-ground-egypt`,
  `${SITE}/ar/services/on-ground-egypt`,
  `${SITE}/work`,
  `${SITE}/about`,
  `${SITE}/ar/about`,
  `${SITE}/insights`,
  `${SITE}/insights/how-to-choose-a-media-production-agency-in-egypt`,
  `${SITE}/contact`,
  `${SITE}/privacy`,
  `${SITE}/terms`,
];
for (const url of pageUrls) {
  const r = await step(url.replace(SITE, ""), () => raw(url));
  out.pages.push({ ...pageFacts(r), headerSec: headerAudit(r.headers, "page"), server: r.headers.server, powered: r.headers["x-powered-by"] });
}

const fileUrls = [
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/site.webmanifest",
  "/favicon.ico",
  "/.well-known/security.txt",
  "/videos/hero.webm",
  "/videos/hero.mp4",
];
for (const p of fileUrls) {
  const r = await step(p, () => raw(`${SITE}${p}`, { method: "HEAD" }));
  out.files[p] = {
    status: r.status,
    location: r.location,
    type: r.headers["content-type"] || null,
    length: r.headers["content-length"] || null,
    cache: r.headers["cache-control"] || null,
    waf: r.headers["x-vercel-mitigated"] || null,
  };
}
const robots = await step("robots GET", () => raw(`${SITE}/robots.txt`));
out.files.robotsBody = robots.body.slice(0, 2000);
const sitemap = await step("sitemap GET", () => raw(`${SITE}/sitemap.xml`));
out.files.sitemapStatus = sitemap.status;
out.files.sitemapBytes = sitemap.bytes;
const locs = all(sitemap.body, /<loc>([^<]+)<\/loc>/g);
const hreflangSitemap = all(sitemap.body, /hreflang="([^"]+)"/g);
out.files.sitemapLocs = locs.length;
out.files.sitemapSample = locs.slice(0, 8);
out.files.sitemapHreflang = [...new Set(hreflangSitemap)];
out.files.sitemapHasDe = sitemap.body.includes("/de");
const llms = await step("llms GET", () => raw(`${SITE}/llms.txt`));
out.files.llmsPreview = llms.body.slice(0, 400);

const apiPaths = [
  "/api/v1/home",
  "/api/v1/services",
  "/api/v1/posts",
  "/api/v1/projects",
  "/api/v1/works",
  "/admin/login",
];
for (const p of apiPaths) {
  const r = await step(`API ${p}`, () => raw(`${API}${p}`));
  let json = null;
  try {
    json = JSON.parse(r.body);
  } catch {}
  const slugs = [];
  const walkSlug = (n) => {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(walkSlug);
    if (typeof n === "object") {
      if (typeof n.slug === "string") slugs.push(n.slug);
      if (Array.isArray(n.data)) walkSlug(n.data);
      if (n.data && typeof n.data === "object") walkSlug(n.data);
    }
  };
  walkSlug(json);
  out.api[p] = {
    status: r.status,
    type: r.headers["content-type"] || null,
    slugs: [...new Set(slugs)],
    headerSec: headerAudit(r.headers, "api"),
    server: r.headers.server,
    powered: r.headers["x-powered-by"],
    cors: r.headers["access-control-allow-origin"] || null,
    setCookie: r.headers["set-cookie"] ? "yes" : null,
    preview: r.body.slice(0, 180).replace(/\s+/g, " "),
  };
}

const homeApi = await step("API home slugs", () => raw(`${API}/api/v1/home`));
let homeJson = null;
try { homeJson = JSON.parse(homeApi.body); } catch {}
out.api.homeKeys = homeJson && typeof homeJson === "object" ? Object.keys(homeJson.data || homeJson).slice(0, 20) : [];

const svc = out.api["/api/v1/services"]?.slugs || [];
const posts = out.api["/api/v1/posts"]?.slugs || [];
out.api.fallbackServiceMissingOnCms = FALLBACK_SERVICES.filter((s) => svc.length && !svc.includes(s));
out.api.cmsServiceMissingInFallback = svc.filter((s) => !FALLBACK_SERVICES.includes(s));
out.api.fallbackPostMissingOnCms = FALLBACK_POSTS.filter((s) => posts.length && !posts.includes(s));
out.api.cmsPostMissingInFallback = posts.filter((s) => !FALLBACK_POSTS.includes(s));

const workPage = out.pages.find((p) => p.url.endsWith("/work"));
let workSlug = null;
if (workPage) {
  const workHtml = (await step("work html again", () => raw(`${SITE}/work`))).body;
  const m = workHtml.match(/href="\/work\/([^"#?]+)"/);
  workSlug = m && m[1];
  out.api.sampleWorkSlug = workSlug;
  if (workSlug) {
    const wr = await step("work detail", () => raw(`${SITE}/work/${workSlug}`));
    out.pages.push({ ...pageFacts(wr), headerSec: headerAudit(wr.headers, "page") });
  }
}

const exposurePaths = [
  "/.env",
  "/.env.local",
  "/.git/HEAD",
  "/.git/config",
  "/composer.json",
  "/package.json",
  "/wp-config.php",
  "/phpinfo.php",
  "/server-status",
  "/debug",
  "/api/v1/users",
  "/api/v1/admin",
];
for (const p of exposurePaths) {
  const host = p.startsWith("/api") || p === "/composer.json" ? API : SITE;
  const r = await step(`expose ${p}`, () => raw(`${host}${p}`, { method: "GET" }));
  const interesting = r.status !== 404 && r.status !== 308 && r.status !== 301 && r.status !== 307 && r.status !== 0;
  out.exposures.push({
    url: `${host}${p}`,
    status: r.status,
    location: r.location,
    interesting,
    type: r.headers["content-type"] || null,
    snippet: interesting ? r.body.slice(0, 120).replace(/\s+/g, " ") : null,
  });
}

const apexHead = await step("apex headers", () => raw(`${SITE}/`, { method: "HEAD" }));
out.security.apex = headerAudit(apexHead.headers, "apex");
out.security.apexHsts = apexHead.headers["strict-transport-security"] || null;
out.security.apexCsp = apexHead.headers["content-security-policy"] || null;
out.security.apexXfo = apexHead.headers["x-frame-options"] || null;
out.security.apexXcto = apexHead.headers["x-content-type-options"] || null;
out.security.apexRef = apexHead.headers["referrer-policy"] || null;
out.security.apexPp = apexHead.headers["permissions-policy"] || null;
out.security.apexCoop = apexHead.headers["cross-origin-opener-policy"] || null;
out.security.apexCorp = apexHead.headers["cross-origin-resource-policy"] || null;
out.security.apexServer = apexHead.headers.server || null;

const contact = await step("contact form token", () => raw(`${SITE}/contact`));
out.security.contactHasFormToken = /formToken|name=["']formToken["']|name=["']_token["']/.test(contact.body);
out.security.contactHasHoneypot = /honeypot|website["']\s+tabindex|autocomplete=["']off["']/.test(contact.body);

const hero = out.files["/videos/hero.webm"];
out.security.heroWebmBytes = hero?.length ? Number(hero.length) : null;
out.security.heroCache = hero?.cache || null;

console.log(JSON.stringify(out, null, 2));

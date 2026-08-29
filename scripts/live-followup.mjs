import fs from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = "Mozilla/5.0 (compatible; GlobalUntoldStoryAudit/2026-08-26)";

async function get(url, method = "GET") {
  await sleep(600);
  const res = await fetch(url, {
    method,
    redirect: "manual",
    headers: { "User-Agent": UA, Accept: "*/*" },
  });
  const headers = {};
  res.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
  const body = method === "HEAD" ? "" : await res.text();
  return { url, status: res.status, location: headers.location || null, type: headers["content-type"], waf: headers["x-vercel-mitigated"] || null, hsts: headers["strict-transport-security"] || null, csp: !!headers["content-security-policy"], xcto: headers["x-content-type-options"] || null, xfo: headers["x-frame-options"] || null, powered: headers["x-powered-by"] || null, server: headers.server || null, cache: headers["cache-control"] || null, length: headers["content-length"] || null, body };
}

function fact(html) {
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [,""])[1];
  const robots = (html.match(/name=["']robots["'][^>]+content=["']([^"']+)/i) || [,""])[1];
  const h1 = ((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [,""])[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const invalid = /Invalid Date/i.test(html);
  const formToken = /name=["']formToken["']/.test(html);
  const dateModified = (html.match(/"dateModified"\s*:\s*"([^"]+)"/) || [,null])[1];
  const datePublished = (html.match(/"datePublished"\s*:\s*"([^"]+)"/) || [,null])[1];
  const image = (html.match(/"image"\s*:\s*"([^"]+)"/) || [,null])[1];
  const englishOnAr = /Localize & Amplify|We Create|Production Services/i.test(html);
  return { title, robots, h1, invalid, formToken, dateModified, datePublished, image, englishOnAr, words: html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<[^>]+>/g," ").split(/\s+/).filter(Boolean).length };
}

const out = { redirects: {}, pages: {}, api: {}, files: {}, headers: {} };

for (const [k, u] of Object.entries({
  corpService: "https://globaluntoldstory.com/service/corporate-industrial-content",
  corpServiceSlash: "https://globaluntoldstory.com/service/corporate-industrial-content/",
  productionJourneySlash: "https://globaluntoldstory.com/production-journey/",
  filmEquip: "https://globaluntoldstory.com/professional-film-production-equipment",
  filmEgyptInsight: "https://globaluntoldstory.com/insights/film-production-in-egypt",
  aboutUsSlash: "https://globaluntoldstory.com/about-us/",
})) {
  out.redirects[k] = await get(u, "HEAD");
}

out.files.manifest = await get("https://globaluntoldstory.com/site.webmanifest");
out.files.faviconPng = await get("https://globaluntoldstory.com/images/favicon.png", "HEAD");
out.files.logo = await get("https://globaluntoldstory.com/images/logo-white.png", "HEAD");
out.files.securityTxt = await get("https://globaluntoldstory.com/.well-known/security.txt");

const home = await get("https://globaluntoldstory.com/");
out.headers.home = { status: home.status, waf: home.waf, hsts: home.hsts, csp: home.csp, xcto: home.xcto, xfo: home.xfo, server: home.server };
out.pages.home = { ...fact(home.body), status: home.status };

const ar = await get("https://globaluntoldstory.com/ar");
out.pages.ar = { ...fact(ar.body), status: ar.status, dir: (ar.body.match(/dir=["']([^"']+)/) || [])[1], lang: (ar.body.match(/lang=["']([^"']+)/) || [])[1] };

const contact = await get("https://globaluntoldstory.com/contact");
out.pages.contact = { ...fact(contact.body), status: contact.status, waf: contact.waf };

const article = await get("https://globaluntoldstory.com/insights/how-to-choose-a-media-production-agency-in-egypt");
out.pages.article = { ...fact(article.body), status: article.status };

const arArticle = await get("https://globaluntoldstory.com/ar/insights/how-to-choose-a-media-production-agency-in-egypt");
out.pages.arArticle = { ...fact(arArticle.body), status: arArticle.status };

const svc = await get("https://api.globaluntoldstory.com/api/v1/services");
let svcJson = null; try { svcJson = JSON.parse(svc.body); } catch {}
const items = svcJson?.data?.items || svcJson?.data || [];
out.api.servicesStatus = svc.status;
out.api.serviceSlugs = (Array.isArray(items) ? items : []).map((x) => x.slug).filter(Boolean);
out.api.powered = svc.powered;
out.api.hsts = svc.hsts;
out.api.xcto = svc.xcto;
out.api.xfo = svc.xfo;
out.api.csp = svc.csp;

const blog = await get("https://api.globaluntoldstory.com/api/v1/blog");
let blogJson = null; try { blogJson = JSON.parse(blog.body); } catch {}
const posts = blogJson?.data?.items || blogJson?.data?.data || blogJson?.data || [];
out.api.blogStatus = blog.status;
out.api.blogSlugs = (Array.isArray(posts) ? posts : []).map((x) => x.slug).filter(Boolean);
out.api.blogPreview = blog.body.slice(0, 160);

fs.writeFileSync(
  "D:/New folder (5)/New folder/globaluntoldstory.com/audits/live-followup-2026-08-26.json",
  JSON.stringify(out, null, 2),
  "utf8"
);
console.log("wrote followup");

/*
 * Build a local JSON package that restores the ORIGINAL long-form English
 * article for three services:
 *
 *   6. tv-show-production-live-broadcast
 *   7. podcast-production
 *   8. post-production
 *
 * Background: the default English page for these three services was later
 * replaced by a much shorter rewrite, while the other live languages (and the
 * reviewed zh/ja/ko/pl/sw translations) still follow the original long-form
 * article. The original English lives in the same archive zip the translations
 * came from, under "Languages/English - Final/Word/". This script reads those
 * Word files directly from the zip and converts them with the same convention
 * as the archive's translated records: one <p> per non-empty line, plain text
 * only, no invented or reworded content.
 *
 * It only reads the zip and writes one local JSON file. It never contacts
 * Hostinger, Neon, Vercel, GitHub, or any database, and it does not upload
 * anything.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const zipPath = process.env.LANGUAGES_ZIP || "C:\\Users\\A Store\\Downloads\\Compressed\\Languages-20260918T200742Z-1-001.zip";
const archivePath = path.join(root, "translation-imports", "languages-20260918-target-services.json");
const servicesDir = path.join(root, "translation-imports", "english-original", "services");

const hash = (value) => createHash("sha256").update(value, "utf8").digest("hex");

// What the live English page serves today (the shortened rewrite). An importer
// must stop if the live English no longer matches this, so it never overwrites
// something that changed after this package was prepared.
const services = [
  {
    slug: "tv-show-production-live-broadcast",
    file: "Languages/English - Final/Word/TV Show Production and Live Broadcast - Final.docx",
    previous: {
      title: "TV SHOWS AND LIVE BROADCAST PRODUCTION WHEN THE RED LIGHT TURNS ON, EVERY SECOND MATTERS.",
      short_desc: "Studio shows, talk shows, field segments, live broadcasting and multi camera production for television networks, streaming platforms, institutions and brands worldwide.",
      full_desc_sha256: "bbe8c7df7d0a67b7c5e237e8cf6479b4189775f39d43865181b5ab3076ef1ba4",
      paragraphs: 36,
    },
  },
  {
    slug: "podcast-production",
    file: "Languages/English - Final/Word/Podcast and Video Podcast Production - Final.docx",
    previous: {
      title: "PODCAST AND VIDEO PODCAST PRODUCTION A GREAT CONVERSATION DESERVES MORE THAN A CAMERA AND A MICROPHONE.",
      short_desc: "Podcast production services for brands, institutions and creators, including format development, audio and video recording, editing, social clips and publishing support.",
      full_desc_sha256: "22366b6373a554b517ece672aa63cc5b4d9a315f044a9c4054712d4d700201ee",
      paragraphs: 75,
    },
  },
  {
    slug: "post-production",
    file: "Languages/English - Final/Word/Post Production Services - Final.docx",
    previous: {
      title: "POST PRODUCTION SERVICES THE SHOOT CAPTURES THE MATERIAL. POST FINDS THE FILM.",
      short_desc: "International post production services including video editing, color grading, sound design, motion graphics, visual effects, mastering, versioning and localization.",
      full_desc_sha256: "058bd643481708b6b76043b4ef5f5a3eb28e2d47d60a0ffe4bd77ddef213cce5",
      paragraphs: 80,
    },
  },
];

/* ---- minimal read-only zip reader (central directory + raw inflate) ---- */
function zipEntries(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("Not a zip file (no end-of-central-directory record).");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let n = 0; n < count; n += 1) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("Corrupt zip central directory.");
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    entries.set(name, { method, compSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function readEntry(buf, entries, name) {
  const e = entries.get(name);
  if (!e) throw new Error(`Zip entry not found: ${name}`);
  const nameLen = buf.readUInt16LE(e.localOffset + 26);
  const extraLen = buf.readUInt16LE(e.localOffset + 28);
  const start = e.localOffset + 30 + nameLen + extraLen;
  const data = buf.subarray(start, start + e.compSize);
  if (e.method === 0) return Buffer.from(data);
  if (e.method === 8) return inflateRawSync(data);
  throw new Error(`Unsupported zip compression method ${e.method} for ${name}`);
}

/* ---- Word text extraction: one line per paragraph / line break ---- */
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

function docxLines(docxBuf) {
  const xml = readEntry(docxBuf, zipEntries(docxBuf), "word/document.xml").toString("utf8");
  const lines = [];
  for (const para of xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)) {
    let current = "";
    for (const tok of para[0].matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br[^>]*\/>/g)) {
      if (tok[0].startsWith("<w:br")) { lines.push(current); current = ""; }
      else if (tok[0] === "<w:tab/>") current += " ";
      else current += decode(tok[1]);
    }
    lines.push(current);
  }
  return lines.map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
}

const isHeadline = (line) => /[A-Z]/.test(line) && line === line.toUpperCase();
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function convert(lines, slug, previous) {
  // Header is label/value pairs: URL, SEO Title, Meta Description (URL is optional).
  const labels = new Set(["URL", "SEO Title", "Meta Description"]);
  const meta = {};
  let i = 0;
  while (i < lines.length && labels.has(lines[i])) {
    meta[lines[i]] = lines[i + 1];
    i += 2;
  }
  if (!meta["SEO Title"] || !meta["Meta Description"]) throw new Error(`${slug}: unexpected document header.`);

  // Hero block: ALL-CAPS name + tagline lines, then one descriptive line.
  const heroParts = [];
  while (i < lines.length && isHeadline(lines[i])) { heroParts.push(lines[i]); i += 1; }
  if (!heroParts.length) throw new Error(`${slug}: no hero title found.`);
  const heroTitle = heroParts.join(" ");
  const heroDescription = lines[i];

  // Match the other live languages: the live title and overview text are kept.
  // The hero description only stays in the body when it is NOT the overview
  // text already shown above it (TV: it is the overview; podcast/post: it is
  // the first paragraph of the article, exactly as on the live Arabic pages).
  let body = lines.slice(i);
  if (heroDescription === previous.short_desc) body = body.slice(1);

  return {
    docxTitle: heroTitle,
    docxHeroDescription: heroDescription,
    seo: { metaTitle: meta["SEO Title"], metaDescription: meta["Meta Description"] },
    body,
    fullDesc: body.map((line) => `<p>${escapeHtml(line)}</p>`).join("\n"),
  };
}

function checks(html, slug) {
  const blocks = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1].trim());
  if (blocks.some((b) => !b)) throw new Error(`${slug}: blank paragraph.`);
  if ((html.match(/<p>/g) || []).length !== (html.match(/<\/p>/g) || []).length) throw new Error(`${slug}: unbalanced <p> tags.`);
  if (/<script\b|\uFFFD|\?\?\?/iu.test(html)) throw new Error(`${slug}: unsafe or corrupted content.`);
  const stripped = html.replace(/<\/?p>/g, "").replace(/&(amp|lt|gt);/g, "");
  if (/[<>]/.test(stripped)) throw new Error(`${slug}: unexpected markup.`);
  return blocks.length;
}

const zipBuf = await readFile(zipPath);
const zipIndex = zipEntries(zipBuf);
const archive = await readFile(archivePath, "utf8").then(JSON.parse);

const packages = [];
for (const svc of services) {
  const docxBuf = readEntry(zipBuf, zipIndex, svc.file);
  const converted = convert(docxLines(docxBuf), svc.slug, svc.previous);
  const paragraphs = checks(converted.fullDesc, svc.slug);

  const localeCounts = Object.fromEntries(
    archive.records.filter((r) => r.slug === svc.slug).map((r) => [r.locale, r.validation.body_blocks]),
  );

  packages.push({
    schema_version: 1,
    service_slug: svc.slug,
    source: {
      locale: "en",
      note: "Original long-form English article, taken unchanged from the archive's 'English - Final' Word document. It replaces the later shortened English rewrite so English matches the eight already-live translations and the reviewed zh/ja/ko/pl/sw translations. An importer must stop if the current live English title, short description or full-description checksum differs from 'previous_live_english'.",
      previous_live_english: svc.previous,
      documents: {
        en: {
          file: svc.file,
          docx_sha256: hash(docxBuf.toString("latin1")),
          source_paragraphs: paragraphs,
          full_desc_sha256: hash(converted.fullDesc),
          reviewed_translation_paragraphs: localeCounts,
        },
      },
      seo_reference_not_applied: converted.seo,
    },
    translations: {
      en: {
        title: svc.previous.title,
        short_desc: svc.previous.short_desc,
        full_desc: converted.fullDesc,
        price: "",
      },
    },
    _comparison: {
      docx_title_matches_live_title: converted.docxTitle === svc.previous.title,
      docx_hero_description_is_live_overview: converted.docxHeroDescription === svc.previous.short_desc,
      hero_description_kept_as_first_paragraph: converted.docxHeroDescription !== svc.previous.short_desc,
    },
  });
}

// One import-friendly file per item, named exactly after its slug:
//   translation-imports/english-original/services/<service-slug>.json
// (future content types follow the same pattern: .../projects/<project-slug>.json,
//  .../posts/<post-slug>.json). Each .json is the standard package with
// "service_slug" at the top level; the .txt beside it is the same article in
// plain text for reading.
await mkdir(servicesDir, { recursive: true });
const plain = (html) => html.replace(/<\/?p>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
console.log(`Writing ${packages.length} English original files to ${path.relative(root, servicesDir)}`);
for (const { _comparison, ...pkg } of packages) {
  const en = pkg.translations.en;
  const d = pkg.source.documents.en;
  await writeFile(path.join(servicesDir, `${pkg.service_slug}.json`), `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(servicesDir, `${pkg.service_slug}.txt`),
    `URL: https://globaluntoldstory.com/services/${pkg.service_slug}\n\nTITLE: ${en.title}\n\nSHORT DESCRIPTION: ${en.short_desc}\n\nFULL DESCRIPTION (one paragraph per line):\n\n${plain(en.full_desc)}\n`,
    "utf8",
  );
  console.log(`${pkg.service_slug}.json: ${d.source_paragraphs} paragraphs, sha256=${d.full_desc_sha256.slice(0, 12)}; docx title = live title: ${_comparison.docx_title_matches_live_title}; reviewed translations: ${JSON.stringify(d.reviewed_translation_paragraphs)}`);
}

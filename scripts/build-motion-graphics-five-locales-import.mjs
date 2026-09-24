/*
 * Build the final five-locale import package for Motion Graphics, CGI, VFX and
 * AI Visual Production. It copies the reviewed source documents exactly,
 * rather than attempting a machine rewrite of spelling or industry terminology.
 *
 * IMPORTANT CONTENT NOTE: the current default English page for this service
 * (globaluntoldstory.com/services/motion-graphics-cgi-vfx-ai) was rewritten at
 * some point into a much shorter draft (~274 paragraphs, and its page heading
 * was shortened to "Motion Graphics, CGI, VFX and AI"). The eight
 * originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never
 * updated and still run the earlier long-form article -- confirmed by checking
 * /ar/ directly (406 <p> blocks). The archive's zh/ja/ko/pl/sw translations
 * were reviewed against that same long-form article (409-428 paragraphs each,
 * and the archive's English Word document has 411 body lines), so they match
 * the eight already-live languages, not the current shortened English default.
 * This script records the current live English title, short description and
 * full-description checksum for drift-detection purposes, but that checksum
 * will legitimately NOT match this package's translations. That mismatch is
 * expected and documented -- see source.note below. Same situation already
 * confirmed for services 6, 7 and 8.
 *
 * This script only writes a local JSON file. It does not contact Hostinger,
 * Neon, Vercel, GitHub, or any database.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "translation-imports", "languages-20260918-target-services.json");
const outputPath = path.join(root, "translation-imports", "motion-graphics-five-locales-final.json");
const slug = "motion-graphics-cgi-vfx-ai";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const liveEnglish = {
  title: "MOTION GRAPHICS, CGI, VFX AND AI VISUAL PRODUCTION IF THE CAMERA CANNOT CAPTURE IT, WE BUILD IT.",
  short_desc: "Motion design, 2D animation, 3D CGI, visual effects and carefully directed AI workflows for campaigns, films, brands and complex ideas.",
  full_desc_sha256: "b33067112ccbf528858801b2388a4da573d7387a0434a3c7a2ec0fa642735e51",
};

const hash = (value) => createHash("sha256").update(value, "utf8").digest("hex");

function reviewedParagraphCount(html, expected, locale) {
  const paragraphs = [...String(html).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!Number.isInteger(expected) || expected < 1) {
    throw new Error(`${locale}: the reviewed source has no valid paragraph count.`);
  }
  if (paragraphs.length !== expected) {
    throw new Error(`${locale}: expected ${expected} non-empty source paragraphs, found ${paragraphs.length}.`);
  }
  if (/<script\b|�|\?\?\?/iu.test(html)) {
    throw new Error(`${locale}: rejected unsafe or corrupted content.`);
  }
  return paragraphs.length;
}

const archive = await readFile(sourcePath, "utf8").then(JSON.parse);
const records = (archive.records || []).filter((record) => record.type === "service" && record.slug === slug);
if (records.length !== locales.length) {
  throw new Error(`Expected ${locales.length} final translations for ${slug}, found ${records.length}.`);
}

const translations = {};
const documents = {};
for (const locale of locales) {
  const record = records.find((item) => item.locale === locale);
  if (!record?.data?.title || !record.data.shortDesc || !record.data.fullDesc || !record.source?.docx_sha256) {
    throw new Error(`${locale}: a required final translation field is missing.`);
  }

  const fullDesc = record.data.fullDesc;
  const sourceParagraphs = reviewedParagraphCount(fullDesc, record.validation?.body_blocks, locale);
  translations[locale] = {
    title: record.data.title,
    short_desc: record.data.shortDesc,
    full_desc: fullDesc,
    price: "",
  };
  documents[locale] = {
    file: record.source.file,
    document_url: record.source.document_url,
    docx_sha256: record.source.docx_sha256,
    source_paragraphs: sourceParagraphs,
    full_desc_sha256: hash(fullDesc),
  };
}

const output = {
  schema_version: 1,
  service_slug: slug,
  source: {
    locale: "en",
    ...liveEnglish,
    note: "KNOWN CONTENT DRIFT: the current default English page runs a much shorter rewrite of this service's full description (274 <p> blocks) and a shortened page heading. The eight originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still run the earlier long-form article, confirmed live on /ar/ (406 <p> blocks). This package's translations match that long-form article, not the current short English default. Do not treat a full_desc_sha256 mismatch against the live English route as a blocker for this specific service -- it is expected, the same situation already confirmed and documented for tv-show-production-live-broadcast, podcast-production and post-production. The short description does still match the current live English page; the title recorded here is the services-list title (name + tagline).",
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final Motion Graphics, CGI, VFX and AI Visual Production translations.`);
for (const locale of locales) {
  const body = translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

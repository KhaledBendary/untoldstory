/*
 * Build the final five-locale import package for TV Show Production and Live
 * Broadcast. It copies the reviewed source documents exactly, rather than
 * attempting a machine rewrite of spelling or industry terminology.
 *
 * IMPORTANT CONTENT NOTE: the current default English page for this service
 * (globaluntoldstory.com/services/tv-show-production-live-broadcast) was
 * rewritten at some point into a much shorter draft (~36 paragraphs). The
 * eight original live translations (ar, de, es, fr, it, pt, ru, tr) were
 * never updated and still run the earlier, long-form article -- confirmed by
 * checking /ar/ (409 <p> blocks) and /de/ (421 <p> blocks) directly. The
 * archive's zh/ja/ko/pl/sw translations were reviewed against that same
 * long-form article (~470-490 paragraphs each), so they match the eight
 * already-live languages, not the current shortened English default route.
 * This script records the current (short) live English title, short
 * description and full-description checksum for drift-detection purposes,
 * but that checksum will legitimately NOT match this package's translations.
 * That mismatch is expected and documented -- see source.note below.
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
const outputPath = path.join(root, "translation-imports", "tv-show-production-five-locales-final.json");
const slug = "tv-show-production-live-broadcast";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const liveEnglish = {
  title: "TV SHOWS AND LIVE BROADCAST PRODUCTION",
  short_desc: "Studio shows, talk shows, field segments, live broadcasting and multi camera production for television networks, streaming platforms, institutions and brands worldwide.",
  full_desc_sha256: "bbe8c7df7d0a67b7c5e237e8cf6479b4189775f39d43865181b5ab3076ef1ba4",
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
    note: "KNOWN CONTENT DRIFT: the current default English page runs a much shorter rewrite of this service's full description. The eight originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still run the earlier long-form article, confirmed live on /ar/ and /de/. This package's translations match that long-form article, not the current short English default. Do not treat a full_desc_sha256 mismatch against the live English route as a blocker for this specific service -- it is expected. Title and short description do still match the current live English page.",
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final TV Show Production and Live Broadcast translations.`);
for (const locale of locales) {
  const body = translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

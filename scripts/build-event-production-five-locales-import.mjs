/*
 * Build the final five-locale import package for Event Production and Live
 * Streaming in Egypt. It copies the reviewed source documents exactly, rather
 * than attempting a machine rewrite of spelling or industry terminology.
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
const outputPath = path.join(root, "translation-imports", "event-production-five-locales-final.json");
const slug = "event-production-live-streaming-egypt";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const liveEnglish = {
  title: "EVENT COVERAGE AND LIVE PRODUCTION",
  short_desc: "Multi-camera event coverage, live streaming, broadcast production, photography and same-day content for conferences, summits, exhibitions, launches and public events in Egypt.",
  full_desc_sha256: "a11bd6e442ac257393e7679d01b18046b40eb882d69e5b340af6b10e98bb3ca2",
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

// Manual spelling correction confirmed after proofreading the reviewed archive.
// The Swahili source document contains a typo ("kutokutoa", an extra "ku")
// where standard Swahili negative infinitive grammar requires "kutotoa".
// This is the only wording change made to any reviewed document; every other
// paragraph is retained exactly as archived.
const manualCorrections = {
  sw: [["kutokutoa", "kutotoa"]],
};

const translations = {};
const documents = {};
for (const locale of locales) {
  const record = records.find((item) => item.locale === locale);
  if (!record?.data?.title || !record.data.shortDesc || !record.data.fullDesc || !record.source?.docx_sha256) {
    throw new Error(`${locale}: a required final translation field is missing.`);
  }

  let fullDesc = record.data.fullDesc;
  for (const [from, to] of manualCorrections[locale] || []) {
    fullDesc = fullDesc.split(from).join(to);
  }
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
    note: "Complete reviewed final translations are retained unchanged. Any future importer must stop if the current English title, summary, or full-description checksum differs from this recorded live source.",
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final Event Production and Live Streaming translations.`);
for (const locale of locales) {
  const body = translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

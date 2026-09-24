/*
 * Build the final five-locale import package for Commercial Photography
 * Services. It copies the reviewed source documents exactly, rather than
 * attempting a machine rewrite of spelling or industry terminology.
 *
 * CONTENT NOTE 1 - DRIFT: the current default English page for this service
 * (globaluntoldstory.com/services/commercial-photography) was rewritten at some
 * point into a much shorter draft (~73 paragraphs). The eight originally-live
 * translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still
 * run the earlier long-form article -- confirmed by checking /ar/ directly
 * (398 <p> blocks). The archive's zh/ja/ko/pl/sw translations were reviewed
 * against that same long-form article (432-449 paragraphs each; the archive's
 * English Word document has ~437 body lines), so they match the eight
 * already-live languages, not the current shortened English default. The
 * recorded full-description checksum will legitimately NOT match this package.
 *
 * CONTENT NOTE 2 - STRUCTURE FIX (no wording changes): in the archive's records
 * for this service the hero block was split one line too early -- the title
 * swallowed the hero description sentence, and the first article sentence
 * ("Photography often becomes the longest living part of a production.")
 * became the short description instead of the first body paragraph. The
 * English Final document lays it out as: name, tagline, description, then the
 * article. This script restores that layout (the same fix already applied to
 * the podcast, documentary and dubbing packages):
 *   title       = name + tagline
 *   short_desc  = hero description (this is also the live English overview)
 *   full_desc   = first article sentence + the rest of the article
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
const outputPath = path.join(root, "translation-imports", "commercial-photography-five-locales-final.json");
const slug = "commercial-photography";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const liveEnglish = {
  title: "COMMERCIAL PHOTOGRAPHY SERVICES ONE FRAME CAN HOLD AN ENTIRE BRAND.",
  short_desc: "Commercial, product, corporate, lifestyle and event photography created for campaigns, public relations, digital platforms and long term brand use.",
  full_desc_sha256: "25687d485f6aa93cbd09a8de54f277ea8c23e26299c55f4d7150ae0d13b82f8a",
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

// Manual wording corrections confirmed after proofreading the reviewed archive.
// (None so far for this service; each entry is [from, to] and must match once.)
const manualCorrections = {};

const translations = {};
const documents = {};
for (const locale of locales) {
  const record = records.find((item) => item.locale === locale);
  if (!record?.data?.title || !record.data.shortDesc || !record.data.fullDesc || !record.source?.docx_sha256) {
    throw new Error(`${locale}: a required final translation field is missing.`);
  }
  for (const [from, to] of manualCorrections[locale] || []) {
    if (record.data.fullDesc.split(from).length !== 2) {
      throw new Error(`${locale}: manual correction expected exactly one match for: ${from}`);
    }
    record.data.fullDesc = record.data.fullDesc.replace(from, to);
  }
  const archiveBodyBlocks = reviewedParagraphCount(record.data.fullDesc, record.validation?.body_blocks, locale);

  // Structure fix (see CONTENT NOTE 2). The description is the final sentence of
  // the archive title, so split at the LAST sentence break followed by a space.
  const breaks = [...record.data.title.matchAll(/[.。]\s/g)];
  if (!breaks.length) throw new Error(`${locale}: could not find the end of the tagline in the archive title.`);
  const heroEnd = breaks[breaks.length - 1].index;
  const title = record.data.title.slice(0, heroEnd + 1).trim();
  const shortDesc = record.data.title.slice(heroEnd + 1).trim();
  const openingLine = record.data.shortDesc.trim();
  if (!title || !shortDesc || !openingLine || /[<>]/.test(openingLine) || /[.。]\s/.test(shortDesc)) {
    throw new Error(`${locale}: structure fix produced an empty, unsafe or multi-sentence field.`);
  }
  const fullDesc = `<p>${openingLine}</p>\n${record.data.fullDesc}`;
  const sourceParagraphs = reviewedParagraphCount(fullDesc, archiveBodyBlocks + 1, locale);

  translations[locale] = {
    title,
    short_desc: shortDesc,
    full_desc: fullDesc,
    price: "",
  };
  documents[locale] = {
    file: record.source.file,
    document_url: record.source.document_url,
    docx_sha256: record.source.docx_sha256,
    source_paragraphs: sourceParagraphs,
    archive_body_blocks: archiveBodyBlocks,
    structure_fix: "Title/short description/opening sentence re-split to match the English Final document layout. Wording unchanged.",
    full_desc_sha256: hash(fullDesc),
  };
}

const output = {
  schema_version: 1,
  service_slug: slug,
  source: {
    locale: "en",
    ...liveEnglish,
    note: "KNOWN CONTENT DRIFT: the current default English page runs a much shorter rewrite of this service's full description (73 <p> blocks). The eight originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still run the earlier long-form article, confirmed live on /ar/ (398 <p> blocks). This package's translations match that long-form article, not the current short English default. Do not treat a full_desc_sha256 mismatch against the live English route as a blocker for this specific service -- it is expected, the same situation already confirmed and documented for services 6-10. The translated short descriptions correspond to the live English overview text; the title recorded here is the services-list title (name + tagline).",
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final Commercial Photography translations.`);
for (const locale of locales) {
  const body = translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

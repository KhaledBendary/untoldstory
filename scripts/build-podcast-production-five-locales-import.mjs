/*
 * Build the final five-locale import package for Podcast and Video Podcast
 * Production. It copies the reviewed source documents exactly, rather than
 * attempting a machine rewrite of spelling or industry terminology.
 *
 * IMPORTANT CONTENT NOTE: the current default English page for this service
 * (globaluntoldstory.com/services/podcast-production) was rewritten at some
 * point into a much shorter draft (~75 paragraphs). The eight originally-live
 * translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still
 * run the earlier, long-form article -- confirmed by checking /ar/ directly
 * (444 <p> blocks). The archive's zh/ja/ko/pl/sw translations were reviewed
 * against that same long-form article (~457-476 paragraphs each), so they
 * match the eight already-live languages, not the current shortened English
 * default route. This script records the current (short) live English title,
 * short description and full-description checksum for drift-detection
 * purposes, but that checksum will legitimately NOT match this package's
 * translations. That mismatch is expected and documented -- see
 * source.note below. Same situation confirmed for Service #6
 * (tv-show-production-live-broadcast).
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
const outputPath = path.join(root, "translation-imports", "podcast-production-five-locales-final.json");
const slug = "podcast-production";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const liveEnglish = {
  title: "PODCAST AND VIDEO PODCAST PRODUCTION",
  short_desc: "Podcast production services for brands, institutions and creators, including format development, audio and video recording, editing, social clips and publishing support.",
  full_desc_sha256: "22366b6373a554b517ece672aa63cc5b4d9a315f044a9c4054712d4d700201ee",
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

  const archiveBodyBlocks = reviewedParagraphCount(record.data.fullDesc, record.validation?.body_blocks, locale);

  // STRUCTURE FIX (no wording changes). In the archive's podcast records the
  // hero block was split one line too early: the title swallowed the hero
  // description sentence, and the first article sentence ("A podcast succeeds
  // when people choose to return for the next conversation.") became the short
  // description instead of the first body paragraph. The English Final document
  // lays it out as: name, tagline, description, then the article. Restore that
  // layout, the same one used by the TV Show and Post Production packages:
  //   title       = name + tagline
  //   short_desc  = hero description
  //   full_desc   = first article sentence + the rest of the article
  const heroEnd = record.data.title.search(/[.。]\s/);
  if (heroEnd < 0) throw new Error(`${locale}: could not find the end of the tagline in the archive title.`);
  const title = record.data.title.slice(0, heroEnd + 1).trim();
  const shortDesc = record.data.title.slice(heroEnd + 1).trim();
  const openingLine = record.data.shortDesc.trim();
  if (!title || !shortDesc || !openingLine || /[<>]/.test(openingLine)) {
    throw new Error(`${locale}: podcast structure fix produced an empty or unsafe field.`);
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
    note: "KNOWN CONTENT DRIFT: the current default English page runs a much shorter rewrite of this service's full description. The eight originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still run the earlier long-form article, confirmed live on /ar/ (444 <p> blocks). This package's translations match that long-form article, not the current short English default. Do not treat a full_desc_sha256 mismatch against the live English route as a blocker for this specific service -- it is expected, the same situation already confirmed and documented for tv-show-production-live-broadcast. Title and short description do still match the current live English page.",
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final Podcast and Video Podcast Production translations.`);
for (const locale of locales) {
  const body = translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

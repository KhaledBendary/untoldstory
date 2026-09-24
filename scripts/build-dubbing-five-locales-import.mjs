/*
 * Build the final five-locale import package for Dubbing, Voice Over and
 * Localization Services. It copies the reviewed source documents exactly,
 * rather than attempting a machine rewrite of spelling or industry terminology.
 *
 * CONTENT NOTE 1 - DRIFT: the current default English page for this service
 * (globaluntoldstory.com/services/dubbing-voice-over-localization) was
 * rewritten at some point into a much shorter draft (~70 paragraphs). The eight
 * originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never
 * updated and still run the earlier long-form article -- confirmed by checking
 * /ar/ directly (372 <p> blocks). The archive's zh/ja/ko/pl/sw translations
 * were reviewed against that same long-form article (391-409 paragraphs each;
 * the archive's English Word document has ~396 body lines), so they match the
 * eight already-live languages, not the current shortened English default. The
 * recorded full-description checksum will legitimately NOT match this package.
 *
 * CONTENT NOTE 2 - STRUCTURE FIX (no wording changes): in the archive's records
 * for this service the hero block was split one line too early -- the title
 * swallowed the hero description sentence, and the first article sentence
 * ("Localization is not a word for word exercise.") became the short
 * description instead of the first body paragraph. The English Final document
 * lays it out as: name, tagline, description, then the article. This script
 * restores that layout (the same fix already applied to podcast-production):
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
const outputPath = path.join(root, "translation-imports", "dubbing-voice-over-five-locales-final.json");
const slug = "dubbing-voice-over-localization";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const liveEnglish = {
  title: "DUBBING, VOICE OVER AND LOCALIZATION SERVICES A NEW LANGUAGE SHOULD NEVER CHANGE THE SOUL OF THE STORY.",
  short_desc: "Multilingual dubbing, voice over, subtitling, dialogue replacement and content localization for films, advertising, documentaries, corporate media and digital platforms.",
  full_desc_sha256: "97935805a13dc1944751cdf4835660435c5bd936c377d4a02e7eedbdcdd4eba1",
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

// Manual grammar correction confirmed after proofreading the reviewed archive.
// Polish: after "na czymś więcej" the comparison "niż" must repeat the case and
// preposition ("niż na wieku i płci"); the archive has the nominative
// "niż wiek i płeć". This is the only wording change made to any reviewed
// document; every other paragraph is retained exactly as archived.
const manualCorrections = {
  pl: [["Casting opiera się na czymś więcej niż wiek i płeć.", "Casting opiera się na czymś więcej niż na wieku i płci."]],
};

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

  // Structure fix (see CONTENT NOTE 2). The tagline ends at the first sentence
  // break; everything after it in the archive title is the hero description.
  const heroEnd = record.data.title.search(/[.。]\s/);
  if (heroEnd < 0) throw new Error(`${locale}: could not find the end of the tagline in the archive title.`);
  const title = record.data.title.slice(0, heroEnd + 1).trim();
  const shortDesc = record.data.title.slice(heroEnd + 1).trim();
  const openingLine = record.data.shortDesc.trim();
  if (!title || !shortDesc || !openingLine || /[<>]/.test(openingLine)) {
    throw new Error(`${locale}: structure fix produced an empty or unsafe field.`);
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
    note: "KNOWN CONTENT DRIFT: the current default English page runs a much shorter rewrite of this service's full description (70 <p> blocks). The eight originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still run the earlier long-form article, confirmed live on /ar/ (372 <p> blocks). This package's translations match that long-form article, not the current short English default. Do not treat a full_desc_sha256 mismatch against the live English route as a blocker for this specific service -- it is expected, the same situation already confirmed and documented for services 6-9. The translated short descriptions correspond to the live English overview text; the title recorded here is the services-list title (name + tagline).",
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final Dubbing, Voice Over and Localization translations.`);
for (const locale of locales) {
  const body = translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

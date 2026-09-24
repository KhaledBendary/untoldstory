/*
 * Build the final five-locale import package for Documentary Production in Egypt.
 *
 * The source files are reviewed documents marked Final. Their Polish and
 * Swahili use established film-production terminology where it is more natural
 * than a literal word-for-word replacement. This builder deliberately keeps
 * that reviewed wording unchanged and retains every source paragraph.
 *
 * It writes only a local JSON package. It never contacts Hostinger, Neon,
 * Vercel, GitHub, or any database.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "translation-imports", "languages-20260918-target-services.json");
const outputPath = path.join(root, "translation-imports", "documentary-production-five-locales-import.json");
const slug = "documentary-production-egypt";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const hash = (value) => createHash("sha256").update(value, "utf8").digest("hex");

function checkedParagraphCount(html, expected, locale) {
  const paragraphs = [...String(html).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => match[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!Number.isInteger(expected) || expected < 1) {
    throw new Error(`${locale}: source package is missing its reviewed paragraph count.`);
  }
  if (paragraphs.length !== expected) {
    throw new Error(`${locale}: expected ${expected} non-empty source paragraphs, found ${paragraphs.length}.`);
  }
  return paragraphs.length;
}

const archive = await readFile(sourcePath, "utf8").then(JSON.parse);
const records = (archive.records || []).filter((record) => record.type === "service" && record.slug === slug);
if (records.length !== locales.length) {
  throw new Error(`Expected ${locales.length} documentary records, found ${records.length}.`);
}

const translations = {};
const documents = {};
for (const locale of locales) {
  const record = records.find((item) => item.locale === locale);
  if (!record?.data?.title || !record.data.shortDesc || !record.data.fullDesc || !record.source?.docx_sha256) {
    throw new Error(`${locale}: missing reviewed documentary translation data.`);
  }

  const archiveBodyBlocks = checkedParagraphCount(record.data.fullDesc, record.validation?.body_blocks, locale);

  // STRUCTURE FIX (no wording changes). In the archive's documentary records the
  // hero block was split one line too early: the title swallowed the hero
  // description sentence, and the first article sentence ("Documentary
  // production begins long before the first interview or establishing shot.")
  // became the short description instead of the first body paragraph. The
  // English Final document lays it out as: name, tagline, description, then the
  // article. Restore that layout, the same one used by the TV Show, Post
  // Production, Podcast and Dubbing packages:
  //   title       = name + tagline (the tagline here is three short sentences)
  //   short_desc  = hero description (one sentence)
  //   full_desc   = first article sentence + the rest of the article
  // The description is the final sentence of the archive title, so the split
  // is made at the LAST sentence break followed by a space.
  const breaks = [...record.data.title.matchAll(/[.。]\s/g)];
  if (!breaks.length) throw new Error(`${locale}: could not find the end of the tagline in the archive title.`);
  const heroEnd = breaks[breaks.length - 1].index;
  const title = record.data.title.slice(0, heroEnd + 1).trim();
  const shortDesc = record.data.title.slice(heroEnd + 1).trim();
  const openingLine = record.data.shortDesc.trim();
  if (!title || !shortDesc || !openingLine || /[<>]/.test(openingLine) || /[.。]\s/.test(shortDesc)) {
    throw new Error(`${locale}: documentary structure fix produced an empty, unsafe or multi-sentence field.`);
  }
  const fullDesc = `<p>${openingLine}</p>\n${record.data.fullDesc}`;
  const sourceParagraphs = checkedParagraphCount(fullDesc, archiveBodyBlocks + 1, locale);

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
    note: "The complete reviewed Final translation from each source document is retained unchanged. The current Neon English source must be verified before any future import.",
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final Documentary Production translations.`);
for (const locale of locales) {
  const body = output.translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

/*
 * Build the final five-locale import package for Original IP Development and TV
 * Format Creation. It copies the reviewed source documents exactly, rather than
 * attempting a machine rewrite of spelling or industry terminology.
 *
 * CONTENT NOTE 1 - DRIFT: the current default English page for this service
 * (globaluntoldstory.com/services/original-ip-development) was rewritten at some
 * point into a much shorter draft (~80 paragraphs, with a shortened page
 * heading "Original IP Development"). The eight originally-live translations
 * (ar, de, es, fr, it, pt, ru, tr) were never updated and still run the earlier
 * long-form article -- confirmed by checking /ar/ directly (406 <p> blocks).
 * The archive's zh/ja/ko/pl/sw translations were reviewed against that same
 * long-form article (453-467 paragraphs each; the archive's English Word
 * document has 454 body lines), so they match the eight already-live
 * languages, not the current shortened English default. The recorded
 * full-description checksum will legitimately NOT match this package.
 *
 * CONTENT NOTE 2 - STRUCTURE: the archive records are structured correctly for
 * this service (title = name + tagline, short description = hero description,
 * body starts at the first article sentence), exactly as in the English Final
 * document, so no title fix is needed. The translated short description is the
 * English hero description; the live English overview line is a slightly
 * different meta-style sentence (same as post-production).
 *
 * CONTENT NOTE 3 - ALIGNMENT: comparing every list and sentence count with the
 * English Final document showed that zh, ja, ko and pl match it, but the
 * reviewed Swahili FAQ and closing section came from a different English draft
 * (see CONTENT ALIGNMENT below), so that section was aligned to the English
 * Final.
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
const outputPath = path.join(root, "translation-imports", "original-ip-five-locales-final.json");
const slug = "original-ip-development";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const liveEnglish = {
  title: "ORIGINAL IP DEVELOPMENT AND TV FORMAT CREATION WE DO NOT WAIT FOR THE BRIEF",
  short_desc: "Original IP development and television format creation for broadcasters, streaming platforms, brands and production partners, including treatments, pitch decks, show bibles, sizzle reels and pilots.",
  full_desc_sha256: "e3b6926850cde4991554285a497423ca38bafe27fbe0bb2b10a5e8121b648bc7",
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
// Each entry is [from, to] and must match exactly once.
// Swahili: "kwa sababu" (because) takes an indicative verb, but the archive has the
// subjunctive "ionekane". The sentence means "only so that the presentation looks
// more impressive", which is "ili tu presentation ionekane ...".
// This is the only wording change made to any reviewed document (apart from the
// aligned Swahili FAQ and closing section described below).
const manualCorrections = {
  sw: [["Hakuna partner anayepaswa kuambatanishwa kwa sababu tu presentation ionekane impressive zaidi.", "Hakuna partner anayepaswa kuambatanishwa ili tu presentation ionekane impressive zaidi."]],
};

// CONTENT ALIGNMENT (Swahili only). The reviewed Swahili FAQ and closing section
// differ from the English Final document:
//   - the branded-entertainment and adapt-formats answers are worded differently
//     (and the adapt-formats question is phrased differently);
//   - an extra question ("Can you protect my idea?") is not in the English;
//   - the "do you guarantee a concept will be commissioned" question is missing;
//   - the cost and timeline answers are worded differently (the English cost
//     answer has two lines), and the timeline question is phrased differently;
//   - both closing paragraphs are worded differently.
// Every reviewed paragraph that already matches the English Final (questions 1-7,
// the branded-entertainment question, the cost question, the closing heading and
// the call to action) is kept exactly; only the differing items are removed or
// replaced, and the replacements are translations of the English Final lines,
// using the Swahili document's own terminology. Each step is asserted so the
// script refuses to run if a paragraph is not exactly where expected.
const paragraphsOf = (html) => [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
const expectAt = (locale, paras, index, text) => {
  if (paras[index] !== text) {
    throw new Error(`${locale}: paragraph ${index + 1} is not the expected text: ${text}`);
  }
};

const alignments = {
  sw(paras) {
    if (paras.length !== 453) throw new Error("sw: unexpected paragraph count for alignment.");
    expectAt("sw", paras, 424, "MASWALI YANAYOULIZWA MARA KWA MARA");
    expectAt("sw", paras, 439, "JE, MNAWEZA KUKUZA BRANDED ENTERTAINMENT?");
    expectAt("sw", paras, 441, "JE, MNAWEZA KU-ADAPT INTERNATIONAL FORMAT KWA REGIONAL MARKET?");
    expectAt("sw", paras, 443, "JE, MNAWEZA KULINDA IDEA YANGU?"); // extra question (2 paragraphs) - removed
    expectAt("sw", paras, 445, "ORIGINAL IP DEVELOPMENT INAGHARIMU KIASI GANI?");
    expectAt("sw", paras, 447, "IDEA INAWEZA KUCHUKUA MUDA GANI KUWA PITCH-READY?");
    expectAt("sw", paras, 449, "JENGA KITU AMBACHO AUDIENCE ITARUDIA");
    expectAt("sw", paras, 452, "ANZA MAZUNGUMZO YA IP DEVELOPMENT");
    return [
      ...paras.slice(0, 440), // Q1-Q7 with answers, and the branded-entertainment question
      "Ndiyo. Tunatengeneza original formats na content properties ambako brand ina credible role ndani ya audience experience.",
      "JE, MNAWEZA KU-ADAPT FORMATS KWA MARKETS TOFAUTI?",
      "Ndiyo. Tunaweza kusaidia language, cultural, talent, production na editorial adaptation kwa regional na international markets.",
      "JE, MNAHAKIKISHA KWAMBA CONCEPT ITAPATA COMMISSIONING?",
      "Hapana. Commissioning hutegemea buyer, audience strategy, timing, budget na wider market conditions. Jukumu letu ni kuimarisha creative, production na commercial readiness ya property.",
      paras[445], // kept: cost question
      "Development budget hutegemea starting point, research requirements, format complexity, materials zinazohitajika na ikiwa scope inajumuisha treatment, pitch deck, format bible, teaser, sizzle au pilot.",
      "Kushiriki current development stage na intended outcome hutuwezesha kupendekeza realistic scope na budget direction.",
      "FORMAT DEVELOPMENT HUCHUKUA MUDA GANI?",
      "Timelines hutegemea complexity ya property, research requirements, access, decision-making process na development materials zinazohitajika. Focused concept na treatment vinaweza kuchukua muda mfupi zaidi kwa kiasi kikubwa kuliko complete package inayojumuisha format bible, sizzle reel na pilot plan.",
      paras[449], // kept: closing heading
      "Iwe tayari una mwanzo wa idea au unahitaji development partner kuunda kitu original, tunaweza kujenga concept, format na presentation kuzunguka strongest potential yake.",
      "Shiriki starting point, intended audience na development ambition. Timu yetu itapitia opportunity na kujibu ndani ya siku moja ya kazi kwa maswali sahihi na hatua zinazofuata.",
      paras[452], // kept: call to action
    ];
  },
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
  let fullDesc = record.data.fullDesc;
  const notes = [];
  if (alignments[locale]) {
    const aligned = alignments[locale](paragraphsOf(fullDesc));
    fullDesc = aligned.map((p) => `<p>${p}</p>`).join("\n");
    notes.push("FAQ and closing section aligned to the English Final document (see the CONTENT ALIGNMENT note in the build script). Matching reviewed paragraphs kept exactly; only differing items were removed or replaced.");
  }
  const sourceParagraphs = reviewedParagraphCount(fullDesc, notes.length ? paragraphsOf(fullDesc).length : archiveBodyBlocks, locale);
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
    ...(notes.length ? { archive_body_blocks: archiveBodyBlocks, content_alignment: notes } : {}),
    full_desc_sha256: hash(fullDesc),
  };
}

const output = {
  schema_version: 1,
  service_slug: slug,
  source: {
    locale: "en",
    ...liveEnglish,
    note: "KNOWN CONTENT DRIFT: the current default English page runs a much shorter rewrite of this service's full description (80 <p> blocks) and a shortened page heading. The eight originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still run the earlier long-form article, confirmed live on /ar/ (406 <p> blocks). This package's translations match that long-form article, not the current short English default. Do not treat a full_desc_sha256 mismatch against the live English route as a blocker for this specific service -- it is expected, the same situation already confirmed and documented for services 6-12. The translated short descriptions are translations of the English Final document's hero description; the live English overview line is a slightly different meta-style sentence (same as post-production). The title recorded here is the services-list title as currently live (name plus the first tagline line only); the English Final document's full tagline has two lines.",
    review_flags: [],
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final Original IP Development and TV Format Creation translations.`);
for (const locale of locales) {
  const body = translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

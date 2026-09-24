/*
 * Build a safe, service-only Laravel import package for Commercial Advertising
 * Production in zh, ja, ko, pl, and sw.
 *
 * The final CTA in the source documents is an H1 in the live English service
 * body, rather than a paragraph. Swahili also combines two pairs of adjacent
 * source units. This script keeps that CTA, restores those two Swahili paragraph
 * boundaries, and does not retranslate any approved copy.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceUrl = "https://api.globaluntoldstory.com/api/v1/services/commercial-video-production?locale=en";
const sourcePackagePath = path.join(root, "translation-imports", "languages-20260918-target-services.json");
const outputPath = path.join(root, "translation-imports", "commercial-advertising-five-locales-import.json");
const locales = ["zh", "ja", "ko", "pl", "sw"];

const finalCta = {
  zh: "开始商业制作沟通",
  ja: "コマーシャル制作の対話を始める",
  ko: "상업 제작 대화를 시작하세요",
  pl: "ROZPOCZNIJ ROZMOWĘ O PRODUKCJI KOMERCYJNEJ",
  sw: "ANZA MAZUNGUMZO YA UZALISHAJI WA KIBIASHARA",
};

const swahiliBudgetAndBrief = "Bajeti hutegemea dhana ya ubunifu, idadi ya siku za upigaji, maeneo, talent, timu, vifaa, art direction, post-production na deliverables zinazohitajika. Kushiriki brief na upeo wa kampeni hutuwezesha kupendekeza mtazamo halisi wa uzalishaji na mwelekeo wa bajeti.";
const swahiliTimeline = "Ratiba hutegemea ukuzaji wa ubunifu, kiwango cha uzalishaji, casting, maeneo, approvals, visual effects na idadi ya assets za mwisho. Uzalishaji mdogo wa kidijitali unaweza kusonga haraka, huku kampeni kubwa ya televisheni au masoko mengi ikihitaji ukuzaji na maandalizi zaidi.";

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "’");
}

function plainText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function translationBlocks(html) {
  return [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => plainText(match[1]))
    .filter(Boolean);
}

function sourceSegmentCount(html) {
  let count = 0;
  for (const block of html.matchAll(/<(p|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    for (const segment of block[2].split(/<br\s*\/?\s*>/gi)) {
      if (plainText(segment)) count += 1;
    }
  }
  return count;
}

function replaceSegmentText(segment, translation) {
  const tokens = segment.split(/(<[^>]+>)/g);
  const textIndexes = tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => !/^<[^>]+>$/.test(token) && plainText(token));

  if (textIndexes.length === 0) throw new Error("Encountered a source segment without a writable text node.");

  tokens[textIndexes[0].index] = escapeHtml(translation);
  for (const { index } of textIndexes.slice(1)) tokens[index] = "";
  return tokens.join("");
}

function localizeHtml(sourceHtml, blocks) {
  let blockIndex = 0;
  const localized = sourceHtml.replace(/<(p|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi, (block, tag, innerHtml) => {
    const parts = innerHtml.split(/(<br\s*\/?\s*>)/gi);
    for (let index = 0; index < parts.length; index += 1) {
      if (/^<br\s*\/?\s*>$/i.test(parts[index]) || !plainText(parts[index])) continue;
      if (blockIndex >= blocks.length) throw new Error("The translation has fewer content units than the live English source.");
      parts[index] = replaceSegmentText(parts[index], blocks[blockIndex]);
      blockIndex += 1;
    }
    return block.replace(innerHtml, parts.join(""));
  });

  if (blockIndex !== blocks.length) {
    throw new Error(`The live English source has ${blockIndex} content units but the translation has ${blocks.length}.`);
  }
  return localized;
}

function reconcileBlocks(locale, blocks, expectedCount) {
  if (blocks.at(-1) !== finalCta[locale]) {
    throw new Error(`${locale} does not end with the expected CTA; refusing to alter its text.`);
  }

  if (locale === "sw") {
    const budgetIndex = blocks.indexOf(swahiliBudgetAndBrief);
    if (budgetIndex < 0) throw new Error("Swahili budget and brief content unit was not found.");
    blocks.splice(
      budgetIndex,
      1,
      "Bajeti hutegemea dhana ya ubunifu, idadi ya siku za upigaji, maeneo, talent, timu, vifaa, art direction, post-production na deliverables zinazohitajika.",
      "Kushiriki brief na upeo wa kampeni hutuwezesha kupendekeza mtazamo halisi wa uzalishaji na mwelekeo wa bajeti.",
    );

    const timelineIndex = blocks.indexOf(swahiliTimeline);
    if (timelineIndex < 0) throw new Error("Swahili timeline content unit was not found.");
    blocks.splice(
      timelineIndex,
      1,
      "Ratiba hutegemea ukuzaji wa ubunifu, kiwango cha uzalishaji, casting, maeneo, approvals, visual effects na idadi ya assets za mwisho.",
      "Uzalishaji mdogo wa kidijitali unaweza kusonga haraka, huku kampeni kubwa ya televisheni au masoko mengi ikihitaji ukuzaji na maandalizi zaidi.",
    );
  }

  if (blocks.length !== expectedCount) {
    throw new Error(`${locale} has ${blocks.length} content units after reconciliation; expected ${expectedCount}.`);
  }
  return blocks;
}

async function main() {
  const [sourceResponse, sourcePackageText] = await Promise.all([
    fetch(sourceUrl),
    readFile(sourcePackagePath, "utf8"),
  ]);
  if (!sourceResponse.ok) throw new Error(`Live English source returned HTTP ${sourceResponse.status}.`);

  const source = (await sourceResponse.json())?.data;
  if (!source?.title || !source?.shortDesc || !source?.fullDesc) throw new Error("Live English source is incomplete.");

  const sourcePackage = JSON.parse(sourcePackageText);
  const sourceCount = sourceSegmentCount(source.fullDesc);
  const payload = {
    schema_version: 1,
    service_slug: "commercial-video-production",
    source: {
      locale: "en",
      full_desc_sha256: createHash("sha256").update(source.fullDesc, "utf8").digest("hex"),
      non_empty_content_unit_count: sourceCount,
    },
    translations: {},
  };

  for (const locale of locales) {
    const record = sourcePackage.records.find(
      (candidate) => candidate.type === "service" && candidate.slug === payload.service_slug && candidate.locale === locale,
    );
    if (!record?.data?.title || !record.data.shortDesc || !record.data.fullDesc) {
      throw new Error(`The reviewed source package is missing ${locale}/${payload.service_slug}.`);
    }

    const blocks = reconcileBlocks(locale, translationBlocks(record.data.fullDesc), sourceCount);
    const fullDesc = localizeHtml(source.fullDesc, blocks);
    if (sourceSegmentCount(fullDesc) !== sourceCount || !fullDesc.includes(finalCta[locale])) {
      throw new Error(`${locale} failed structural validation after localization.`);
    }

    payload.translations[locale] = {
      title: record.data.title,
      short_desc: record.data.shortDesc,
      full_desc: fullDesc,
      price: source.price || "",
    };
  }

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Created ${path.basename(outputPath)} for ${locales.length} reviewed translations.`);
  console.log(`Live source hash: ${payload.source.full_desc_sha256}`);
  console.log(`Content units per locale: ${sourceCount}`);
}

main().catch((error) => {
  console.error(`Build failed: ${error.message}`);
  process.exitCode = 1;
});

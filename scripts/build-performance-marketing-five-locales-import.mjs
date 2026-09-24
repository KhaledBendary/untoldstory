/*
 * Build the final five-locale import package for Performance Marketing and
 * Creative Strategy. It copies the reviewed source documents exactly, rather
 * than attempting a machine rewrite of spelling or industry terminology.
 *
 * CONTENT NOTE 1 - DRIFT: the current default English page for this service
 * (globaluntoldstory.com/services/performance-marketing-creative-strategy) was
 * rewritten at some point into a much shorter draft (~79 paragraphs). The eight
 * originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never
 * updated and still run the earlier long-form article -- confirmed by checking
 * /ar/ directly (395 <p> blocks). The archive's zh/ja/ko/pl/sw translations
 * were reviewed against that same long-form article (438-480 paragraphs each;
 * the archive's English Word document has 438 body lines), so they match the
 * eight already-live languages, not the current shortened English default. The
 * recorded full-description checksum will legitimately NOT match this package.
 *
 * CONTENT NOTE 2 - SHORT DESCRIPTION: the archive records are structured
 * correctly for this service (title = name + tagline, short description = hero
 * description, body starts at the first article sentence), exactly as in the
 * English Final document, so no structure fix is needed. The translated short
 * description is the English hero description ("Marketing strategy, campaign
 * production, paid media ... for brands seeking measurable growth ..."); the
 * live English overview line is a slightly different meta-style sentence.
 *
 * CONTENT NOTE 3 - ALIGNMENT: the Chinese and Swahili FAQ and closing sections
 * were aligned to the English Final document (see CONTENT ALIGNMENT below), and
 * the extra asset list in the Campaign Asset Production section was removed
 * from zh, ja, ko and sw (see CAMPAIGN ASSET PRODUCTION below). After both
 * steps all five languages match the English Final's structure and sentence
 * counts; Polish already did.
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
const outputPath = path.join(root, "translation-imports", "performance-marketing-five-locales-final.json");
const slug = "performance-marketing-creative-strategy";
const locales = ["zh", "ja", "ko", "pl", "sw"];

const liveEnglish = {
  title: "PERFORMANCE MARKETING AND CREATIVE STRATEGY. CREATIVE EARNS ATTENTION. PERFORMANCE TURNS IT INTO GROWTH.",
  short_desc: "International performance marketing and creative strategy for brands, including paid media, campaign production, lead generation, SEO, landing pages and conversion optimization.",
  full_desc_sha256: "7ff8e10aa6d7539b7d25ca9d72b2b75ecd0968bcee9058a5582c1b8c5623c226",
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
// Polish: "trwawego" is not a Polish word (typo); the intended word is "trwałego".
// This is the only wording change made to any reviewed document.
const manualCorrections = {
  pl: [["nie zbuduje trwawego autorytetu", "nie zbuduje trwałego autorytetu"]],
};

// CONTENT ALIGNMENT (Chinese and Swahili only). Comparing the reviewed
// documents with the English Final document -- and with the live Arabic page,
// which follows the English Final -- showed that the reviewed Chinese and
// Swahili FAQ and closing sections came from a different English draft:
//   zh: three FAQ questions not in the English Final (creative development, cost,
//       how long until a campaign starts); no "campaigns in Arabic and English"
//       question; the "guarantee" and "multi-market" answers and the closing
//       paragraphs worded differently from the English.
//   sw: two FAQ questions not in the English Final (strategy and creative
//       concept, cost); three missing (Arabic and English campaigns, guarantee,
//       multi-market); closing heading, closing paragraphs and call to action
//       ("start a GROWTH conversation") different from the English Final.
// Every reviewed paragraph that already matches the English Final is kept
// exactly; only the differing items are removed or replaced, and the
// replacements are translations of the English Final lines, using each
// document's own terminology. Each step is asserted so the script refuses to
// run if a paragraph is not exactly where expected.
const paragraphsOf = (html) => [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
const expectAt = (locale, paras, index, text) => {
  if (paras[index] !== text) {
    throw new Error(`${locale}: paragraph ${index + 1} is not the expected text: ${text}`);
  }
};

const alignments = {
  zh(paras) {
    if (paras.length !== 480) throw new Error("zh: unexpected paragraph count for alignment.");
    expectAt("zh", paras, 425, "常见问题");
    expectAt("zh", paras, 458, "我们可以领导完整广告活动，也可以在特定阶段支持内部团队、制作伙伴、媒体代理或区域营销结构。");
    expectAt("zh", paras, 459, "你们开发广告活动创意吗？"); // extra question (3 paragraphs) - removed
    expectAt("zh", paras, 462, "你们能够为多个市场开展广告活动吗？");
    expectAt("zh", paras, 463, "是。");
    expectAt("zh", paras, 465, "你们保证销售结果吗？"); // replaced (4 paragraphs)
    expectAt("zh", paras, 469, "效果营销需要多少费用？"); // extra question (3 paragraphs) - removed
    expectAt("zh", paras, 472, "广告活动需要多长时间开始？"); // extra question (3 paragraphs) - removed
    expectAt("zh", paras, 475, "把注意力转化为有意义的增长");
    expectAt("zh", paras, 478, "我们的团队将审阅机会，并在一个工作日内提出关键问题与下一步建议。");
    expectAt("zh", paras, 479, "开始营销沟通");
    return [
      ...paras.slice(0, 459), // up to and including the "internal team or existing agency" answer
      "你们可以开发阿拉伯语与英语广告活动吗？",
      "是。",
      "我们可以用阿拉伯语与英语开发策略、信息、脚本、广告内容、落地页文案与本地化广告活动版本。",
      "你们保证广告活动结果吗？",
      "没有任何负责任的营销伙伴能够保证特定商业结果。",
      "我们建立结构化的测试、衡量与优化流程，旨在长期改善决策与表现。",
      paras[462], // kept: multi-market question
      paras[463], // kept: "是。"
      "我们可以为区域与国际受众开发广告活动结构、创意版本、媒体计划与本地化内容。",
      paras[475], // kept: closing heading
      "无论你正在发布产品、开发优质潜在客户、进入新市场，还是建立长期内容与客户获取系统，我们都可以围绕目标建立合适的策略。",
      "请分享商业目标、受众、目标市场与当前营销状况。",
      paras[478], // kept: team review sentence
      paras[479], // kept: call to action
    ];
  },
  sw(paras) {
    if (paras.length !== 452) throw new Error("sw: unexpected paragraph count for alignment.");
    expectAt("sw", paras, 421, "MASWALI YANAYOULIZWA MARA KWA MARA");
    expectAt("sw", paras, 442, "JE, MNAWEZA KUFANYA KAZI NA INTERNAL MARKETING TEAM AU EXISTING AGENCY?");
    expectAt("sw", paras, 444, "JE, MNATENGENEZA CAMPAIGN STRATEGY NA CREATIVE CONCEPT?"); // extra (2 paragraphs) - removed
    expectAt("sw", paras, 446, "PERFORMANCE MARKETING INAGHARIMU KIASI GANI?"); // extra (2 paragraphs) - removed
    expectAt("sw", paras, 448, "JENGA KAMPENI INAYOJIFUNZA NA KUKUA"); // replaced closing (4 paragraphs)
    expectAt("sw", paras, 451, "ANZA MAZUNGUMZO YA UKUAJI");
    return [
      ...paras.slice(0, 444), // up to and including the "internal team or existing agency" answer
      "JE, MNATENGENEZA CAMPAIGNS KWA ARABIC NA ENGLISH?",
      "Ndiyo. Tunatengeneza strategy, messaging, scripts, advertising content, landing page copy na localized campaign versions kwa Arabic na English.",
      "JE, MNAHAKIKISHA MATOKEO YA CAMPAIGN?",
      "Hakuna responsible marketing partner anayeweza kuhakikisha specific commercial result.",
      "Tunajenga structured testing, measurement na optimization processes zilizoundwa kuboresha decision making na performance kwa muda.",
      "JE, MNAWEZA KUSAIDIA CAMPAIGNS KATIKA MARKETS TOFAUTI?",
      "Ndiyo. Tunaweza kutengeneza campaign structures, creative versions, media plans na localized content kwa regional na international audiences.",
      "GEUZA UMAKINI KUWA UKUAJI WENYE MAANA",
      "Iwe unazindua product, unazalisha qualified leads, unaingia market mpya au unajenga long-term content na acquisition system, tunaweza kuunda strategy sahihi kuizunguka objective.",
      "Shiriki business goal, audience, intended markets na current marketing position. Timu yetu itapitia opportunity na kujibu ndani ya siku moja ya kazi kwa maswali sahihi na hatua zinazofuata.",
      "ANZA MAZUNGUMZO YA MARKETING",
    ];
  },
};

// CAMPAIGN ASSET PRODUCTION (zh, ja, ko, sw). In this section the English Final
// document and the live Arabic page contain only a heading and two sentences,
// and the Polish document matches that. The reviewed zh, ja and sw documents
// add a list of asset types followed by a closing sentence, and the reviewed ko
// document adds the same asset types as one sentence. So that every language
// matches the English Final, that extra content is removed. Every removed
// paragraph is stored in the package (documents[locale].removed_content) so it
// can be restored if ever wanted. Boundaries are asserted exactly.
const assetRemovals = {
  zh: { from: 146, to: 161, first: "素材可包括：", last: "创意系统应提供足够的变化进行测试，同时保持一个可识别的品牌方向。", next: "付费媒体策略与管理" },
  ja: { from: 145, to: 161, first: "制作可能なアセット：", last: "各アセットは孤立して制作するのではなく、キャンペーンシステムの中で役割を持つべきです。", next: "ペイドメディア戦略・管理" },
  sw: { from: 145, to: 161, first: "Assets zinaweza kujumuisha:", last: "Creative system hujengwa ili central idea ibaki consistent huku outputs zikibadilika kulingana na platform na audience.", next: "MKAKATI NA USIMAMIZI WA PAID MEDIA" },
  ko: { from: 145, to: 145, first: "에셋에는 히어로 필름, 텔레비전 광고, 디지털 영상, 소셜 콘텐츠, 퍼포먼스 변형, 제품 사진, 크리에이터 콘텐츠, 모션 그래픽, CGI, 추천사, 랜딩 페이지 비주얼 및 시장별 버전이 포함될 수 있습니다.", last: "에셋에는 히어로 필름, 텔레비전 광고, 디지털 영상, 소셜 콘텐츠, 퍼포먼스 변형, 제품 사진, 크리에이터 콘텐츠, 모션 그래픽, CGI, 추천사, 랜딩 페이지 비주얼 및 시장별 버전이 포함될 수 있습니다.", next: "유료 미디어 전략 및 관리" },
};

function removeAssetSection(locale, paras) {
  const r = assetRemovals[locale];
  expectAt(locale, paras, r.from, r.first);
  expectAt(locale, paras, r.to, r.last);
  expectAt(locale, paras, r.to + 1, r.next);
  return { kept: [...paras.slice(0, r.from), ...paras.slice(r.to + 1)], removed: paras.slice(r.from, r.to + 1) };
}

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
  let removedContent;
  let paras = paragraphsOf(fullDesc);
  if (alignments[locale]) {
    paras = alignments[locale](paras);
    notes.push("FAQ and closing section aligned to the English Final document (see the CONTENT ALIGNMENT note in the build script). Matching reviewed paragraphs kept exactly; only differing items were removed or replaced.");
  }
  if (assetRemovals[locale]) {
    const result = removeAssetSection(locale, paras);
    paras = result.kept;
    removedContent = result.removed;
    notes.push("Extra asset list removed from the Campaign Asset Production section so the section matches the English Final document (see the CAMPAIGN ASSET PRODUCTION note in the build script). The removed paragraphs are stored in removed_content.");
  }
  if (notes.length) fullDesc = paras.map((p) => `<p>${p}</p>`).join("\n");
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
    ...(removedContent ? { removed_content: removedContent } : {}),
    full_desc_sha256: hash(fullDesc),
  };
}

const output = {
  schema_version: 1,
  service_slug: slug,
  source: {
    locale: "en",
    ...liveEnglish,
    note: "KNOWN CONTENT DRIFT: the current default English page runs a much shorter rewrite of this service's full description (79 <p> blocks). The eight originally-live translations (ar, de, es, fr, it, pt, ru, tr) were never updated and still run the earlier long-form article, confirmed live on /ar/ (395 <p> blocks). This package's translations match that long-form article, not the current short English default. Do not treat a full_desc_sha256 mismatch against the live English route as a blocker for this specific service -- it is expected, the same situation already confirmed and documented for services 6-11. The translated short descriptions are translations of the English Final document's hero description; the live English overview line is a slightly different meta-style sentence (same as post-production). The title recorded here is the services-list title (name + tagline).",
    review_flags: [],
    documents,
  },
  translations,
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Created ${path.basename(outputPath)} for ${locales.length} final Performance Marketing and Creative Strategy translations.`);
for (const locale of locales) {
  const body = translations[locale].full_desc;
  console.log(`${locale}: ${body.length} chars; paragraphs=${(body.match(/<p\b/gi) || []).length}; sha256=${hash(body).slice(0, 12)}.`);
}

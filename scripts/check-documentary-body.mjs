/*
 * The documentary correction is text, and text goes wrong quietly.
 *
 * Two ways it can: a language drifting out of shape from the shared block
 * structure, so headings and list items land under the wrong tags; and a
 * character from another script slipping into a translation — a Korean word
 * for "branded" once ended up inside the Russian copy, invisible in review and
 * perfectly valid TypeScript.
 *
 *   node scripts/check-documentary-body.mjs
 */

import { INDEXABLE_LOCALES, DEFAULT_LOCALE } from "../src/lib/i18n.ts";
import { DOCUMENTARY_BODIES, DOCUMENTARY_STRUCTURE_LENGTH, documentaryBodyFor } from "../src/data/documentary-body.ts";

const problems = [];

/* Every indexed language needs a corrected body until the CMS is fixed. */
for (const locale of INDEXABLE_LOCALES) {
  if (locale === DEFAULT_LOCALE) continue;
  if (!DOCUMENTARY_BODIES[locale]) problems.push(`${locale} is indexed but has no documentary body`);
}

/* Same shape in every language, or the tags land on the wrong text. */
for (const [locale, blocks] of Object.entries(DOCUMENTARY_BODIES)) {
  if (blocks.length !== DOCUMENTARY_STRUCTURE_LENGTH) {
    problems.push(`${locale} has ${blocks.length} blocks, structure has ${DOCUMENTARY_STRUCTURE_LENGTH}`);
  }
  blocks.forEach((text, i) => {
    if (!text.trim()) problems.push(`${locale} block ${i} is empty`);
  });
}

/* Scripts that belong to none of these languages. */
const FOREIGN_SCRIPT = /[가-힯぀-ヿ一-鿿]/u;
for (const [locale, blocks] of Object.entries(DOCUMENTARY_BODIES)) {
  blocks.forEach((text, i) => {
    const stray = text.match(FOREIGN_SCRIPT);
    if (stray) problems.push(`${locale} block ${i} contains ${stray[0]} — a character from another script`);
  });
}

/* Latin-script languages must not be left as the English text. */
const english = DOCUMENTARY_BODIES.en;
for (const [locale, blocks] of Object.entries(DOCUMENTARY_BODIES)) {
  if (!english) break;
  const same = blocks.filter((text, i) => text === english[i]).length;
  if (same > blocks.length / 4) problems.push(`${locale} repeats ${same} blocks of the English text verbatim`);
}

/* The guard has to stand down once the CMS carries a real documentary page. */
const guardChecks = [
  ["ar", "<p>الفيلم الوثائقي يبدأ بسؤال</p>", false],
  ["ar", "<p>ما وراء فيلم البطولة: حملات مصممة</p>", true],
  ["fr", "<p>Un documentaire commence par une question</p>", false],
  ["fr", "<p>Au-delà du film héros : des campagnes</p>", true],
  ["de", "<p>Ein Dokumentarfilm beginnt mit einer Frage</p>", false],
  ["ru", "<p>Документальный фильм начинается с вопроса</p>", false],
  ["tr", "<p>Bir belgesel bir soruyla başlar</p>", false],
  ["zh", "<p>anything at all</p>", false],
];
for (const [locale, current, shouldCorrect] of guardChecks) {
  const corrected = Boolean(documentaryBodyFor(locale, current));
  if (corrected !== shouldCorrect) {
    problems.push(
      shouldCorrect
        ? `${locale}: commercial copy was left in place`
        : `${locale}: a correct body would have been overwritten`,
    );
  }
}

const langs = Object.keys(DOCUMENTARY_BODIES).join(", ");
console.log(`Checked ${Object.keys(DOCUMENTARY_BODIES).length} translations (${langs}) of ${DOCUMENTARY_STRUCTURE_LENGTH} blocks.`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log("Every translation matches the structure, stays in its own script, and the guard stands down on a corrected CMS body.");

/*
 * Safely copy the reviewed five-locale translations for exactly two services
 * into the Postgres content source used by the production website.
 *
 * This script is deliberately narrower than the older bulk importer: it only
 * changes the title, shortDesc, and fullDesc fields for on-ground-egypt and
 * commercial-video-production, in zh, ja, ko, pl, and sw. It never updates
 * English or Arabic, URLs, publishing state, SEO, or any other service.
 *
 * Usage:
 *   node scripts/apply-live-service-db-translations.mjs --validate
 *   node scripts/apply-live-service-db-translations.mjs --apply --report translation-imports/live-service-db-import-report.json
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const checkLive = args.has("--check-live");
const reportIndex = process.argv.indexOf("--report");
const reportPath = reportIndex >= 0 ? path.resolve(process.argv[reportIndex + 1] || "") : null;
const locales = ["zh", "ja", "ko", "pl", "sw"];
const jobs = [
  {
    slug: "on-ground-egypt",
    file: ".on-ground-egypt-five-locales-import.json",
    expectedSourceHash: "3ed92e792685339124f6c29150737874a91594cfa451b1115c9a4791525e14d4",
  },
  {
    slug: "commercial-video-production",
    file: "translation-imports/commercial-advertising-five-locales-import.json",
    expectedSourceHash: "71a1d2818e7e44bbc569a1f6bf54c9957edb18c39a03407e99626484462f7e62",
  },
];

if (args.has("--help") || args.has("-h")) {
  console.log("Usage: node scripts/apply-live-service-db-translations.mjs [--validate] [--check-live] [--apply --report <file>]");
  process.exit(0);
}
if (apply && !reportPath) throw new Error("--apply requires --report <file> so the before/after evidence is retained.");

const hash = (value) => createHash("sha256").update(String(value || ""), "utf8").digest("hex");
const plain = (value) => String(value || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&#39;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/\s+/g, " ")
  .trim()
  .toLocaleLowerCase("en");
const isEnglishFallback = (current, english) => !plain(current) || plain(current) === plain(english);

async function loadJob(job) {
  const payload = JSON.parse(await readFile(path.join(root, job.file), "utf8"));
  if (payload?.schema_version !== 1 || payload.service_slug !== job.slug) {
    throw new Error(`${job.file}: unexpected package identity.`);
  }
  if (payload.source?.full_desc_sha256 !== job.expectedSourceHash) {
    throw new Error(`${job.file}: approved English source checksum does not match.`);
  }
  const found = Object.keys(payload.translations || {}).sort();
  if (JSON.stringify(found) !== JSON.stringify([...locales].sort())) {
    throw new Error(`${job.file}: expected exactly zh, ja, ko, pl, sw.`);
  }
  for (const locale of locales) {
    const item = payload.translations[locale];
    if (!item?.title || !item?.short_desc || !item?.full_desc) {
      throw new Error(`${job.file}: ${locale} is missing a required translation field.`);
    }
  }
  return { ...job, payload };
}

const loaded = await Promise.all(jobs.map(loadJob));
console.log(`Validated ${loaded.length} reviewed service packages: ${loaded.map(({ slug }) => slug).join(", ")}.`);
console.log("Scope: 2 services × 5 locales; title, short description, and full description only.");

if (!apply && !checkLive) {
  console.log("Validation only — no database connection or website change was made.");
  process.exit(0);
}

const localEnv = await readFile(path.join(root, ".env.local"), "utf8").catch(() => "");
if (!/^DATABASE_URL(?:_UNPOOLED)?=.+$/m.test(localEnv)) {
  throw new Error("No DATABASE_URL or DATABASE_URL_UNPOOLED is configured in .env.local; no database change was made.");
}

const { connect } = await import("./db-connect.mjs");
const sql = connect();
const report = {
  generated_at: new Date().toISOString(),
  scope: "on-ground-egypt and commercial-video-production; zh, ja, ko, pl, sw only",
  records: [],
};

try {
  if (checkLive) {
    let checked = 0;
    for (const job of loaded) {
      const [row] = await sql`select slug, data from services where slug = ${job.slug}`;
      if (!row) throw new Error(`Service does not exist in Postgres: ${job.slug}`);
      const existing = row.data && typeof row.data === "object" ? row.data : {};
      if (hash(existing.fullDesc?.en) !== job.expectedSourceHash) {
        throw new Error(`${job.slug}: Postgres English body differs from the reviewed source; no write was made.`);
      }
      for (const locale of locales) {
        const checks = [
          ["title", existing.title?.[locale], existing.title?.en],
          ["shortDesc", existing.shortDesc?.[locale], existing.shortDesc?.en],
          ["fullDesc", existing.fullDesc?.[locale], existing.fullDesc?.en],
        ];
        const protectedField = checks.find(([, current, english]) => !isEnglishFallback(current, english));
        if (protectedField) {
          throw new Error(`${job.slug}/${locale}: ${protectedField[0]} already has non-English/custom content; no write was made.`);
        }
        checked += 1;
      }
    }
    console.log(`Live database check passed: ${checked} locale records are safe to update. No website change was made.`);
  } else {
  await sql.begin(async (tx) => {
    for (const job of loaded) {
      const [row] = await tx`select slug, data from services where slug = ${job.slug} for update`;
      if (!row) throw new Error(`Service does not exist in Postgres: ${job.slug}`);
      const existing = row.data && typeof row.data === "object" ? structuredClone(row.data) : {};
      if (hash(existing.fullDesc?.en) !== job.expectedSourceHash) {
        throw new Error(`${job.slug}: Postgres English body differs from the reviewed source; import stopped before writing.`);
      }
      for (const locale of locales) {
        const incoming = job.payload.translations[locale];
        const checks = [
          ["title", existing.title?.[locale], existing.title?.en],
          ["shortDesc", existing.shortDesc?.[locale], existing.shortDesc?.en],
          ["fullDesc", existing.fullDesc?.[locale], existing.fullDesc?.en],
        ];
        const protectedField = checks.find(([, current, english]) => !isEnglishFallback(current, english));
        if (protectedField) {
          throw new Error(`${job.slug}/${locale}: ${protectedField[0]} already has non-English/custom content; import stopped before writing.`);
        }
        existing.title = { ...(existing.title || {}), [locale]: incoming.title };
        existing.shortDesc = { ...(existing.shortDesc || {}), [locale]: incoming.short_desc };
        existing.fullDesc = { ...(existing.fullDesc || {}), [locale]: incoming.full_desc };
        report.records.push({
          slug: job.slug,
          locale,
          before: Object.fromEntries(checks.map(([field, current]) => [field, hash(current)])),
          after: {
            title: hash(incoming.title),
            shortDesc: hash(incoming.short_desc),
            fullDesc: hash(incoming.full_desc),
          },
        });
      }
      await tx`update services set data = ${tx.json(existing)}, updated_at = now() where slug = ${job.slug}`;
    }
  });
  report.applied = report.records.length;
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Applied ${report.applied} translations in one transaction. Evidence written to ${reportPath}`);
  }
} finally {
  await sql.end({ timeout: 5 });
}

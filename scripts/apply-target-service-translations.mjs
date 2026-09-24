/*
 * Apply the vetted September 2026 translation package to existing service rows.
 *
 * Usage:
 *   node scripts/apply-target-service-translations.mjs --validate
 *   node scripts/apply-target-service-translations.mjs --apply --report translation-imports/import-report.json
 *
 * --validate is the default and never connects to the database.  --apply runs
 * one transaction and stops before writing if a source field is not empty or
 * an English fallback. It never changes slugs, status, noindex, canonicals,
 * sitemap settings, or any language outside the package.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = path.join(root, "translation-imports", "languages-20260918-target-services.json");
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const reportFlag = process.argv.indexOf("--report");
const reportPath = reportFlag >= 0 ? path.resolve(process.argv[reportFlag + 1] || "") : null;

if (args.has("--help") || args.has("-h")) {
  console.log("Usage: node scripts/apply-target-service-translations.mjs [--validate] [--apply --report <file>]");
  process.exit(0);
}
if (apply && !reportPath) throw new Error("--apply requires --report <file> so the before/after evidence is retained.");

const expectedCounts = { zh: 13, ja: 13, ko: 13, pl: 12, sw: 12 };
const expectedLocales = new Set(Object.keys(expectedCounts));
const hash = (value) => createHash("sha256").update(value || "", "utf8").digest("hex");
const plain = (value) => String(value || "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&#39;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/\s+/g, " ")
  .trim()
  .toLocaleLowerCase("en");

function isEnglishFallback(current, english) {
  const existing = plain(current);
  const source = plain(english);
  return !existing || existing === source;
}

function assertPackage(payload) {
  if (!payload || payload.schema_version !== 1 || !Array.isArray(payload.records)) {
    throw new Error("The import package has an unsupported structure.");
  }
  const counts = Object.fromEntries(Object.keys(expectedCounts).map((locale) => [locale, 0]));
  const seen = new Set();
  for (const record of payload.records) {
    if (record?.type !== "service" || !expectedLocales.has(record.locale)) {
      throw new Error("Package contains a record outside the approved service scope.");
    }
    if (!/^[a-z0-9-]+$/.test(record.slug || "")) throw new Error(`Invalid service slug: ${record.slug}`);
    const pair = `${record.locale}/${record.slug}`;
    if (seen.has(pair)) throw new Error(`Duplicate package record: ${pair}`);
    seen.add(pair);
    counts[record.locale] += 1;
    const d = record.data;
    if (!d || !d.title || !d.shortDesc || !d.fullDesc || !d.seo?.metaTitle || !d.seo?.metaDescription) {
      throw new Error(`Required content is missing for ${pair}`);
    }
    if (/\/zh-cn\//i.test(JSON.stringify(d))) throw new Error(`Chinese legacy path leaked into content for ${pair}`);
    if (record.source?.route_status !== "current-route" && record.source?.route_status !== "old-route") {
      throw new Error(`Unknown route mapping state for ${pair}`);
    }
    if (!/^[a-f0-9]{64}$/.test(record.source?.docx_sha256 || "")) {
      throw new Error(`Source-file checksum is missing for ${pair}`);
    }
  }
  if (JSON.stringify(counts) !== JSON.stringify(expectedCounts)) {
    throw new Error(`Unexpected package counts: ${JSON.stringify(counts)}`);
  }
  return counts;
}

const payload = JSON.parse(await readFile(packagePath, "utf8"));
const counts = assertPackage(payload);
console.log(`Validated ${payload.records.length} service translations: ${Object.entries(counts).map(([locale, count]) => `${locale}=${count}`).join(", ")}.`);

if (!apply) {
  console.log("Validation only — no database connection or website change was made.");
  process.exit(0);
}

const localEnv = await readFile(path.join(root, ".env.local"), "utf8").catch(() => "");
if (!/^DATABASE_URL(?:_UNPOOLED)?=.+$/m.test(localEnv)) {
  throw new Error("No DATABASE_URL or DATABASE_URL_UNPOOLED is configured in .env.local; the reviewed import package has not been applied.");
}

const { connect } = await import("./db-connect.mjs");
const sql = connect();
const report = {
  generated_at: new Date().toISOString(),
  package: path.basename(packagePath),
  records: [],
};

try {
  await sql.begin(async (tx) => {
    for (const record of payload.records) {
      const [row] = await tx`select slug, data from services where slug = ${record.slug} for update`;
      if (!row) throw new Error(`Service does not exist: ${record.slug}`);
      const existing = row.data && typeof row.data === "object" ? structuredClone(row.data) : {};
      const locale = record.locale;
      const incoming = record.data;
      const existingSeo = existing.seo && typeof existing.seo === "object" ? existing.seo : {};
      const currentSeo = existingSeo[locale] && typeof existingSeo[locale] === "object" ? existingSeo[locale] : {};
      const englishSeo = existingSeo.en && typeof existingSeo.en === "object" ? existingSeo.en : {};
      const checks = [
        ["title", existing.title?.[locale], existing.title?.en],
        ["shortDesc", existing.shortDesc?.[locale], existing.shortDesc?.en],
        ["fullDesc", existing.fullDesc?.[locale], existing.fullDesc?.en],
        ["seo.metaTitle", currentSeo.metaTitle, englishSeo.metaTitle],
        ["seo.metaDescription", currentSeo.metaDescription, englishSeo.metaDescription],
      ];
      const protectedField = checks.find(([, current, english]) => !isEnglishFallback(current, english));
      if (protectedField) {
        throw new Error(`${locale}/${record.slug}: ${protectedField[0]} already contains non-English-or-custom content; refusing to overwrite it.`);
      }

      existing.title = { ...(existing.title || {}), [locale]: incoming.title };
      existing.shortDesc = { ...(existing.shortDesc || {}), [locale]: incoming.shortDesc };
      existing.fullDesc = { ...(existing.fullDesc || {}), [locale]: incoming.fullDesc };
      existing.seo = {
        ...existingSeo,
        [locale]: { ...currentSeo, metaTitle: incoming.seo.metaTitle, metaDescription: incoming.seo.metaDescription },
      };
      await tx`update services set data = ${tx.json(existing)}, updated_at = now() where slug = ${record.slug}`;
      report.records.push({
        locale,
        slug: record.slug,
        source_file: record.source.file,
        source_route_status: record.source.route_status,
        before: Object.fromEntries(checks.map(([field, current]) => [field, hash(String(current || ""))])),
        after: {
          title: hash(incoming.title), shortDesc: hash(incoming.shortDesc), fullDesc: hash(incoming.fullDesc),
          "seo.metaTitle": hash(incoming.seo.metaTitle), "seo.metaDescription": hash(incoming.seo.metaDescription),
        },
      });
    }
  });
  report.applied = report.records.length;
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Applied ${report.applied} records in one transaction. Evidence written to ${reportPath}`);
} finally {
  await sql.end({ timeout: 5 });
}

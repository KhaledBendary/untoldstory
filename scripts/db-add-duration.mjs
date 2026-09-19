/*
 * Add the projects.duration / projects.budget columns (idempotent) and backfill
 * them from the Laravel snapshot. Only the Apache project has a duration; the
 * rest stay null, matching Laravel. Run once against an already-migrated DB.
 */
import { connect } from "./db-connect.mjs";
import { readFileSync } from "node:fs";

const DUMP =
  "C:/Users/mo-ab/AppData/Local/Temp/claude/D--New-folder--5--New-folder-globaluntoldstory-com/0830887a-f6e1-4a32-9cae-326cc9b2a4d7/scratchpad/api-dump";
const en = JSON.parse(readFileSync(`${DUMP}/portfolio_en.json`, "utf-8")).data.items;

const sql = connect();
try {
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS duration TEXT`;
  await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget TEXT`;
  let n = 0;
  for (const p of en) {
    if (p.duration == null && p.budget == null) continue;
    await sql`update projects set duration = ${p.duration ?? null}, budget = ${p.budget ?? null} where slug = ${p.slug}`;
    console.log(`  ${p.slug}: duration=${JSON.stringify(p.duration)} budget=${JSON.stringify(p.budget)}`);
    n++;
  }
  console.log(`Columns ready; backfilled ${n} project(s).`);
} finally {
  await sql.end();
}

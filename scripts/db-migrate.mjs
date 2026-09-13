/*
 * Apply src/lib/db/schema.sql to the database.
 *
 * The schema is written with IF NOT EXISTS throughout, so running this again is
 * safe — it creates what is missing and leaves what exists.
 */
import { readFileSync } from "node:fs";
import { connect } from "./db-connect.mjs";

const schema = readFileSync(new URL("../src/lib/db/schema.sql", import.meta.url), "utf-8");
const sql = connect();

await sql.unsafe(schema);

const tables = await sql`
  select table_name from information_schema.tables
  where table_schema = 'public' order by table_name
`;
console.log("Tables in the database:");
for (const t of tables) console.log("  " + t.table_name);

await sql.end();

import { connect } from "./db-connect.mjs";
const sql = connect();
const [r] = await sql`select slug from projects order by sort_order limit 1`;
console.log(r.slug);
await sql.end();

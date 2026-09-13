import { connect } from "./db-connect.mjs";
const sql = connect();
const [s] = await sql`select data from services where slug = 'documentary-production-egypt'`;
console.log("title.ar in DB:", JSON.stringify(s.data.title.ar));
console.log("title.en in DB:", JSON.stringify(s.data.title.en));
console.log("fr still present?:", !!s.data.title.fr, "| fr:", JSON.stringify(s.data.title.fr)?.slice(0,40));
await sql.end();

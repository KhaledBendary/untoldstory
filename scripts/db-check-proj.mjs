import { connect } from "./db-connect.mjs";
const sql = connect();
const [p] = await sql`select data, is_featured from projects where slug='apache-corporate-industrial-production-in-egypt'`;
console.log("project title.ar:", JSON.stringify(p.data.title.ar));
console.log("project title.fr kept:", JSON.stringify(p.data.title.fr));
console.log("is_featured:", p.is_featured);
await sql.end();

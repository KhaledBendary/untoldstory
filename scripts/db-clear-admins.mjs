import { connect } from "./db-connect.mjs";
const sql = connect();
const del = await sql`delete from admin_users returning email`;
console.log("removed admin accounts:", del.map(d => d.email).join(", ") || "(none)");
const [{ count }] = await sql`select count(*)::int as count from admin_users`;
console.log("admin accounts now:", count);
await sql.end();

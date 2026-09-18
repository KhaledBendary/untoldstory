import { connect } from "./db-connect.mjs";
const sql = connect();
const [{ version }] = await sql`select version()`;
console.log("connected:", version.split(",")[0]);
await sql.end();

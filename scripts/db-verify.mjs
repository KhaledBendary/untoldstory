import { connect } from "./db-connect.mjs";
const sql = connect();

// a service: title in en + ar, and languages present
const [svc] = await sql`select slug, data from services where slug = 'documentary-production-egypt'`;
console.log("service:", svc.slug);
console.log("  title.en:", svc.data.title.en?.slice(0, 45));
console.log("  title.ar:", svc.data.title.ar?.slice(0, 45));
console.log("  languages on title:", Object.keys(svc.data.title).join(","));
console.log("  fullDesc.ar length:", (svc.data.fullDesc.ar || "").length);

// a post: body present?
const [post] = await sql`select slug, data from posts limit 1`;
console.log("\npost:", post.slug);
console.log("  body langs:", Object.keys(post.data.body || {}).join(","));
console.log("  body.en length:", (post.data.body?.en || "").length);

// singleton home: nested access
const [home] = await sql`select data from singletons where key = 'home'`;
console.log("\nhome singleton:");
console.log("  locales stored:", Object.keys(home.data).join(","));
console.log("  hero.en.headline1:", home.data.en?.hero?.headline1?.slice(0,40));
console.log("  hero.ar.headline1:", home.data.ar?.hero?.headline1?.slice(0,40));

// any broken encoding (???) that slipped in?
const broken = await sql`select slug from services where data::text like '%??????%'`;
console.log("\nservices with ?????? encoding:", broken.length, broken.map(b=>b.slug).join(","));

await sql.end();

/*
 * Check the SMTP email setup end-to-end.
 *
 *   node scripts/mail-verify.mjs          # verify the connection & login only
 *   node scripts/mail-verify.mjs --send   # also send one test email to CONTACT_TO_EMAIL
 *
 * Reads the same SMTP_* / CONTACT_TO_EMAIL variables the site uses from
 * .env.local. "verify" logs in to the server without sending anything; "--send"
 * delivers a real test message so you can confirm it lands in the inbox.
 */
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const get = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m")) || [])[1]?.trim() || "";

const host = get("SMTP_HOST");
const user = get("SMTP_USER");
const pass = get("SMTP_PASS");
const port = Number(get("SMTP_PORT") || 465);
const secure = get("SMTP_SECURE") !== "false";
const from = get("SMTP_FROM") || user;
const to = get("CONTACT_TO_EMAIL") || user;

console.log(`SMTP: host=${host || "(missing)"} port=${port} secure=${secure} user=${user ? "set" : "(missing)"} pass=${pass ? "set" : "(MISSING)"}`);
console.log(`From: ${from}  →  To: ${to}`);

if (!host || !user || !pass) {
  console.error("\n✗ SMTP is not fully configured — add SMTP_HOST, SMTP_USER and SMTP_PASS to .env.local.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

try {
  await transporter.verify();
  console.log("\n✓ Connection & login OK — the server accepts these credentials.");
} catch (e) {
  console.error("\n✗ verify failed:", e.code || "", e.message);
  process.exit(1);
}

if (process.argv.includes("--send")) {
  const info = await transporter.sendMail({
    from: `"Global Untold Story — test" <${from}>`,
    to,
    subject: "✅ Test email from the new dashboard",
    text: "This is a test from scripts/mail-verify.mjs. If you got this, the contact-form email path works.",
  });
  console.log("✓ Test email sent:", info.messageId, "| accepted:", info.accepted?.join(", "));
} else {
  console.log("  (run again with --send to deliver a real test email)");
}

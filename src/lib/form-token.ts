import { createHmac, timingSafeEqual } from "crypto";

const MIN_AGE_MS = 400;
const MAX_AGE_MS = 30 * 60 * 1000;

function secret() {
  return (
    process.env.FORM_TOKEN_SECRET ||
    process.env.SMTP_PASS ||
    process.env.API_BASE_URL ||
    "globaluntoldstory-form"
  );
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function issueFormToken() {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function formTokenError(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return "missing";
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature || !/^\d+$/.test(issuedAt)) return "invalid";
  const expected = sign(issuedAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";
  const age = Date.now() - Number(issuedAt);
  if (age < MIN_AGE_MS) return "too-fast";
  if (age > MAX_AGE_MS) return "expired";
  return null;
}

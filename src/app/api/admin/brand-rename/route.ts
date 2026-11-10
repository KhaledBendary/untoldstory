import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sql } from "@/lib/db/client";
import { logActivity } from "@/lib/db/repo";
import { LOCALE_CODES } from "@/lib/i18n";
import { BRAND, OLD_BRAND_NAMES } from "@/lib/brand";

/**
 * One-off: rename the company in stored content, 10 Nov 2026.
 *
 * "Global Untold Story" (and the machine translations of it) becomes "The
 * Untold Story" in every service, project, post, page document, settings
 * document and media alt text, in every language. The editor's save routes
 * can't do this: saving a page re-runs machine translation, which would
 * rewrite every other language around the name.
 *
 * GET  → dry run: every string that would change, with before/after, and
 *        phrases that only look like the name ("untold story") for review.
 * POST → apply. Body { skip?: string[] } keeps the listed ids (or id
 *        prefixes) unchanged, so a few mentions of the old name can stay.
 *
 * Remove this route once the rename has been applied and checked.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Hit = { id: string; table: string; ref: string; path: string; locale: string; n: number; before: string; after: string; review?: string };
type Row = { table: string; ref: string; column: string; value: unknown };

const LOCALES = new Set<string>(LOCALE_CODES as readonly string[]);
// Values that are addresses or identifiers, never prose.
const SKIP_KEYS = new Set(["slugs", "slugsManual", "canonical", "url", "href", "src", "image", "video", "image_url", "og_image"]);

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Built with the constructor: the TypeScript target predates lookbehind in regex literals.
const LOOSE_PHRASE = new RegExp("(?<!(?:global|the)\\s+)\\buntold\\s+story\\b", "i");
// Fragments of the old name's translations, to catch a variant not listed in OLD_BRAND_NAMES.
const SUSPECT = new RegExp(
  "ungesagte|unerz\u00e4hlte|unentdeckte|no contada|non raccontata|n\u00e3o contada|in\u00e9dite|non racont\u00e9e|anlat\u0131lmam\u0131\u015f|" +
  "\u043d\u0435\u0440\u0430\u0441\u0441\u043a\u0430\u0437\u0430\u043d\u043d|niewypowiedzian|nieopowiedzian|isiyojulikana|isiyoeleweka|isiyosimuliwa|" +
  "\u672a\u89e3\u4e4b\u8c1c|\u672a\u8bb2\u8ff0|\u672a\u88ab\u8bb2\u8ff0|\u30a2\u30f3\u30bf|\u30a2\u30f3\u30c8\u30fc\u30eb\u30c9|\uc5b8\ud1a8\ub4dc|\uc54c\ub824\uc9c0\uc9c0 \uc54a\uc740 \uc774\uc57c\uae30|" +
  "\u063a\u064a\u0631 \u0627\u0644\u0645\u0631\u0648\u064a\u0629|\u063a\u064a\u0631 \u0645\u0631\u0648\u064a\u0629|\u0627\u0646\u062a\u0648\u0644\u062f|\u0623\u0646\u062a\u0648\u0644\u062f|\u062c\u0644\u0648\u0628\u0627\u0644|\u063a\u0644\u0648\u0628\u0627\u0644|untold",
  "i",
);
const OLD_PATTERNS = OLD_BRAND_NAMES.map((name) => new RegExp(escape(name).replace(/\s+/g, "\\s+"), "gi"));

type Extra = { find: string; replace: string };

const BACKUP_KEY = "backup_brand_rename_2026_11_10";

/** The old name (or a translation of it) → the current name. */
function renameText(text: string, locale: string): string {
  let out = text
    // English: "the Global Untold Story team" → "The Untold Story team", not "the The …".
    .replace(/\b(the|The|THE)\s+Global\s+Untold\s+Story/g, (_m, art: string) => (art === "THE" ? "THE UNTOLD STORY" : BRAND))
    .replace(/GLOBAL\s+UNTOLD\s+STORY/g, "THE UNTOLD STORY");
  for (const re of OLD_PATTERNS) out = out.replace(re, BRAND);
  // Chinese sets a Latin name off with spaces: "由 The Untold Story 制作".
  if (locale === "zh") {
    out = out.replace(/([\u4e00-\u9fff])The Untold Story/g, "$1 The Untold Story").replace(/The Untold Story([\u4e00-\u9fff])/g, "The Untold Story $1");
  }
  return out;
}

/** Exact, reviewed fixes for machine translations of the name the patterns can't know. */
function applyExtras(text: string, extra: Extra[]): string {
  let out = text;
  for (const e of extra) if (e.find && out.includes(e.find)) out = out.split(e.find).join(e.replace);
  return out;
}

const hasOld = (text: string) => OLD_PATTERNS.some((re) => { re.lastIndex = 0; return re.test(text); }) || /GLOBAL\s+UNTOLD\s+STORY/.test(text);
const countOld = (text: string) => OLD_PATTERNS.reduce((n, re) => n + (text.match(re)?.length ?? 0), 0);

function snippet(text: string, at: number, radius = 90) {
  const start = Math.max(0, at - radius);
  return (start > 0 ? "…" : "") + text.slice(start, at + radius).replace(/\s+/g, " ") + (at + radius < text.length ? "…" : "");
}

function firstIndex(text: string) {
  let best = -1;
  for (const re of OLD_PATTERNS) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m && (best < 0 || m.index < best)) best = m.index;
  }
  if (best < 0) best = text.search(/GLOBAL\s+UNTOLD\s+STORY/);
  return best;
}

function skipped(id: string, skip: string[]) {
  return skip.some((s) => id === s || id.startsWith(`${s}.`) || id.startsWith(`${s}/`));
}

/** Walk a JSON value, renaming strings; record what changed (or would). */
type Ctx = { table: string; ref: string; skip: string[]; extra: Extra[]; hits: Hit[]; phrases: { id: string; text: string }[]; show: Set<string>; shown: Record<string, string> };

function transform(value: unknown, path: string[], ctx: Ctx): unknown {
  if (typeof value === "string") {
    const id = `${ctx.table}/${ctx.ref}/${path.join(".")}`;
    const locale = path.find((p) => LOCALES.has(p)) ?? "";
    if (ctx.show.has(id)) ctx.shown[id] = value;
    const fixed = applyExtras(value, ctx.extra);
    if (fixed !== value || hasOld(value)) {
      const after = renameText(fixed, locale);
      const at = Math.max(0, firstIndex(value));
      const hit: Hit = {
        id, table: ctx.table, ref: ctx.ref, path: path.join("."), locale, n: countOld(value) + (fixed !== value ? 1 : 0),
        before: snippet(value, at), after: snippet(after, at),
      };
      // English "a Global Untold Story production" can't simply become "a The …".
      if (/\b(a|an)\s+Global\s+Untold\s+Story/i.test(value)) hit.review = "article a/an before the name";
      ctx.hits.push(hit);
      return skipped(id, ctx.skip) ? value : after;
    }
    // Phrases that may be the name without "Global"/"The", or a translation of
    // the old name this list doesn't know yet — reported, never changed.
    const loose = value.search(LOOSE_PHRASE);
    if (loose >= 0) ctx.phrases.push({ id, text: snippet(value, loose, 60) });
    const suspect = value.split(BRAND).join("").search(SUSPECT);
    if (suspect >= 0) ctx.phrases.push({ id: `suspect:${id}`, text: snippet(value.split(BRAND).join(""), suspect, 60) });
    return value;
  }
  if (Array.isArray(value)) return value.map((v, i) => transform(v, [...path, String(i)], ctx));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SKIP_KEYS.has(k) ? v : transform(v, [...path, k], ctx);
    }
    return out;
  }
  return value;
}

async function loadRows(): Promise<Row[]> {
  const rows: Row[] = [];
  for (const r of await sql<{ slug: string; data: unknown }[]>`select slug, data from services`) rows.push({ table: "services", ref: r.slug, column: "data", value: r.data });
  for (const r of await sql<{ slug: string; data: unknown }[]>`select slug, data from projects`) rows.push({ table: "projects", ref: r.slug, column: "data", value: r.data });
  for (const r of await sql<{ slug: string; data: unknown; author_name: string | null }[]>`select slug, data, author_name from posts`) {
    rows.push({ table: "posts", ref: r.slug, column: "data", value: r.data });
    rows.push({ table: "posts", ref: r.slug, column: "author_name", value: r.author_name });
  }
  for (const r of await sql<{ key: string; data: unknown }[]>`select key, data from singletons where key <> ${BACKUP_KEY}`) rows.push({ table: "singletons", ref: r.key, column: "data", value: r.data });
  for (const r of await sql<{ id: number; alt: unknown }[]>`select id, alt from media`) rows.push({ table: "media", ref: String(r.id), column: "alt", value: r.alt });
  return rows;
}

async function writeRow(row: Row, value: unknown) {
  const json = (v: unknown) => sql.json(v as Parameters<typeof sql.json>[0]);
  if (row.table === "services") await sql`update services set data = ${json(value)}, updated_at = now() where slug = ${row.ref}`;
  else if (row.table === "projects") await sql`update projects set data = ${json(value)}, updated_at = now() where slug = ${row.ref}`;
  else if (row.table === "posts" && row.column === "data") await sql`update posts set data = ${json(value)}, updated_at = now() where slug = ${row.ref}`;
  else if (row.table === "posts" && row.column === "author_name") await sql`update posts set author_name = ${value as string | null} where slug = ${row.ref}`;
  else if (row.table === "singletons") await sql`update singletons set data = ${json(value)}, updated_at = now() where key = ${row.ref}`;
  else if (row.table === "media") await sql`update media set alt = ${json(value)} where id = ${Number(row.ref)}`;
}

async function run(apply: boolean, skip: string[], extra: Extra[] = [], show: Set<string> = new Set()) {
  const rows = await loadRows();
  const hits: Hit[] = [];
  const phrases: { id: string; text: string }[] = [];
  const shown: Record<string, string> = {};
  let written = 0;
  const pending: { row: Row; next: unknown }[] = [];
  for (const row of rows) {
    const ctx: Ctx = { table: row.table, ref: row.ref, skip, extra, hits, phrases, show, shown };
    const before = hits.length;
    const next = transform(row.value, row.column === "data" ? [] : [row.column], ctx);
    const changed = hits.slice(before).some((h) => !skipped(h.id, skip));
    if (changed) pending.push({ row, next });
  }
  if (apply && pending.length) {
    // Keep every record exactly as it was before the first apply, so the
    // rename can be undone with SQL. A second run never overwrites it.
    const existing = await sql<{ key: string }[]>`select key from singletons where key = ${BACKUP_KEY}`;
    if (!existing.length) {
      const backup = { takenAt: new Date().toISOString(), rows: pending.map((p) => p.row) };
      await sql`insert into singletons (key, data) values (${BACKUP_KEY}, ${sql.json(backup as unknown as Parameters<typeof sql.json>[0])})`;
    }
    for (const p of pending) {
      await writeRow(p.row, p.next);
      written += 1;
    }
  }
  // The localized site name per language, to spot a translated brand the list above doesn't know.
  const layout = rows.find((r) => r.table === "singletons" && r.ref === "layout")?.value as Record<string, { site_config?: { name?: string } }> | undefined;
  const siteNames = Object.fromEntries(Object.entries(layout ?? {}).map(([loc, v]) => [loc, v?.site_config?.name ?? null]));
  const counts: Record<string, number> = {};
  for (const h of hits) counts[h.table] = (counts[h.table] ?? 0) + 1;
  return { apply, written, total: hits.length, counts, siteNames, hits, phrases, shown };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;
  const show = new Set((request.nextUrl.searchParams.get("show") ?? "").split("|").filter(Boolean));
  const result = await run(false, [], [], show);
  const table = request.nextUrl.searchParams.get("table");
  const hits = table ? result.hits.filter((h) => h.table === table) : result.hits;
  return NextResponse.json({ ...result, hits });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;
  const body = await request.json().catch(() => ({}));
  const skip: string[] = Array.isArray(body?.skip) ? body.skip.map(String) : [];
  const extra: Extra[] = Array.isArray(body?.extra)
    ? body.extra.filter((e: unknown) => e && typeof (e as Extra).find === "string" && typeof (e as Extra).replace === "string")
    : [];
  // { apply: false } is a dry run that includes the extra fixes.
  if (body?.apply === false) return NextResponse.json(await run(false, skip, extra));
  const result = await run(true, skip, extra);
  await logActivity({
    actor: auth.session.email, action: "update", entity: "site", ref: "brand-rename",
    detail: `Global Untold Story → ${BRAND}: ${result.written} records, ${result.total - skip.length} strings`,
  });
  return NextResponse.json({ ...result, hits: result.hits.map((h) => ({ id: h.id, kept: skipped(h.id, skip) })) });
}

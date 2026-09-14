import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { singletonBlock, type SingletonBlock } from "@/lib/admin/blocks";
import { setPath } from "@/lib/admin/singleton-fields";
import { getSingleton, saveSingletonArray } from "@/lib/db/repo";
import { validateField, hasErrors, type Dict } from "@/lib/content-validate";
import { translateBlockItems } from "@/lib/translate/apply";
import { LOCALE_CODES } from "@/lib/i18n";
import { MACHINE_LOCALES } from "@/lib/translate";
import { triggerDeploy } from "@/lib/deploy";

/**
 * Save a repeating block (an array inside a singleton page). The editor sends
 * the whole list; each item carries a scalar for every fixed field and an
 * { en, ar } pair for every translatable one. We rebuild the array for all 14
 * languages together — English/Arabic as authored, the seven machine languages
 * translated from English, and the five English-shell languages copied from it —
 * so the items stay index-aligned across every locale.
 */
type Item = Record<string, unknown>;

const SHELL_LOCALES = LOCALE_CODES.filter(
  (l) => l !== "en" && l !== "ar" && !(MACHINE_LOCALES as readonly string[]).includes(l),
);

function fieldValue(f: { i18n?: boolean; noTranslate?: boolean; key: string }, item: Item, locale: string, machineTx?: Record<string, string>): unknown {
  if (!f.i18n) return item[f.key] ?? null;
  const pair = (item[f.key] ?? {}) as { en?: string; ar?: string };
  if (locale === "en") return pair.en ?? "";
  if (locale === "ar") return pair.ar ?? "";
  if (f.noTranslate) return pair.en ?? "";
  return machineTx?.[f.key] ?? pair.en ?? "";
}

// A normal block item is an object of fields; a scalar block item is just the
// single "value" string.
function buildItem(def: SingletonBlock, item: Item, locale: string, machineTx?: Record<string, string>): unknown {
  if (def.scalar) return fieldValue(def.fields[0], item, locale, machineTx);
  const out: Item = {};
  for (const f of def.fields) out[f.key] = fieldValue(f, item, locale, machineTx);
  return out;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ block: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { block } = await params;
  const def = singletonBlock(block);
  if (!def) return NextResponse.json({ error: "بلوك غير معروف" }, { status: 404 });
  if (!(await getSingleton(def.singleton))) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const items = body?.items as Item[] | undefined;
  if (!Array.isArray(items)) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  // Validate the translatable English/Arabic values only.
  const issues = [];
  for (let i = 0; i < items.length; i++) {
    for (const f of def.fields) {
      if (!f.i18n) continue;
      const pair = (items[i][f.key] ?? {}) as Dict;
      issues.push(...validateField(`${def.itemLabelAr} ${i + 1} — ${f.key}`, `${def.itemLabelAr} ${i + 1} — ${f.label}`, pair, {}));
    }
  }
  if (hasErrors(issues)) return NextResponse.json({ error: "فيه مشاكل لازم تتصلح", issues }, { status: 422 });

  // Machine-translate the translatable (and not noTranslate) fields from English.
  const txFields = def.fields.filter((f) => f.i18n && !f.noTranslate).map((f) => ({ key: f.key, format: "text" as const }));
  const itemsEn = items.map((it) => {
    const row: Record<string, string> = {};
    for (const f of txFields) row[f.key] = ((it[f.key] ?? {}) as { en?: string }).en ?? "";
    return row;
  });
  const { perLocale, warning } = await translateBlockItems(itemsEn, txFields);

  // Build every language's copy of the array, index-aligned.
  const arrays: Record<string, unknown[]> = {
    en: items.map((it) => buildItem(def, it, "en")),
    ar: items.map((it) => buildItem(def, it, "ar")),
  };
  for (const loc of MACHINE_LOCALES) {
    arrays[loc] = items.map((it, i) => buildItem(def, it, loc, perLocale[loc]?.[i]));
  }
  for (const loc of SHELL_LOCALES) {
    arrays[loc] = items.map((it) => buildItem(def, it, loc));
  }

  await saveSingletonArray(def.singleton, def.path, arrays, setPath);
  const deploy = await triggerDeploy();
  return NextResponse.json({ ok: true, translationWarning: warning, deploy });
}

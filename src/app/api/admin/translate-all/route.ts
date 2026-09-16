import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { CONTENT_TYPES } from "@/lib/admin/content-types";
import { listByType, saveByType, logActivity } from "@/lib/db/repo";
import { extractSeoForEditor, assembleSeo } from "@/lib/admin/seo-fields";
import { applyMachineTranslations } from "@/lib/translate/apply";
import { translationConfigured } from "@/lib/translate";
import { triggerDeploy } from "@/lib/deploy";

export const runtime = "nodejs";
export const maxDuration = 60;

type Dict = Record<string, string>;

/**
 * One-click: (re)generate every machine language for every service, project and
 * post from the English. Existing English/Arabic are never touched. Guarded so
 * that with no translation key configured it changes nothing and says so.
 */
export async function POST() {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  if (!translationConfigured()) {
    return NextResponse.json(
      { error: "الترجمة الآلية مش متظبطة — ضيف GOOGLE_TRANSLATE_API_KEY في المتغيرات وأعِد النشر، وبعدها الزر ده هيترجم كل حاجة." },
      { status: 503 },
    );
  }

  const TYPES = ["services", "projects", "posts"] as const;
  let done = 0;
  const failed: string[] = [];

  for (const type of TYPES) {
    const def = CONTENT_TYPES[type];
    if (!def) continue;
    const rows = (await listByType(type)) as unknown as Array<Record<string, unknown> & { slug: string; data: Record<string, Dict> }>;
    for (const row of rows) {
      try {
        const seo = (row.data as { seo?: Record<string, Record<string, string>> })?.seo;
        const data: Record<string, Dict> = {};
        for (const field of def.i18n) {
          if (field.key.startsWith("seo.")) continue;
          data[field.key] = { ...(row.data[field.key] || {}) };
        }
        Object.assign(data, extractSeoForEditor(seo as never, def));

        // existing=undefined forces a full (re)translation, replacing any English
        // fallbacks that were sitting in the other languages.
        const { warning } = await applyMachineTranslations(def, data, undefined);
        if (warning) { failed.push(`${type}/${row.slug}`); continue; }

        assembleSeo(data, seo as never);

        const fixed: Record<string, string | boolean | number | null> = {};
        for (const f of def.fixed) {
          const v = row[f.key];
          if (f.type === "bool") fixed[f.key] = Boolean(v);
          else if (f.type === "date") fixed[f.key] = v ? new Date(v as string).toISOString().slice(0, 10) : "";
          else fixed[f.key] = (v as string | number | null) ?? "";
        }
        await saveByType(type, row.slug, fixed, data);
        done++;
      } catch (e) {
        console.error(`translate-all ${type}/${row.slug} failed:`, e);
        failed.push(`${type}/${row.slug}`);
      }
    }
  }

  await logActivity({ actor: auth.session.email, action: "update", entity: "site", detail: `ترجمة شاملة: ${done} عنصر` });
  const deploy = await triggerDeploy({ force: true });
  return NextResponse.json({ ok: true, done, failed, deploy });
}

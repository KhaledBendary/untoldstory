import { redirect, notFound } from "next/navigation";
import { currentSession } from "@/lib/admin-session";
import { singletonDef, getPath } from "@/lib/admin/singleton-fields";
import { SINGLETON_BLOCKS } from "@/lib/admin/blocks";
import { getSingleton } from "@/lib/db/repo";
import PageEditor from "./PageEditor";
import BlockEditor, { type Item } from "@/app/admin/blocks/[block]/BlockEditor";

export const dynamic = "force-dynamic";

/**
 * One page, everything about it in one place: the single-value fields first,
 * then each repeating section (stats, steps, team, offices…) inline beneath —
 * so editing "the home page" means editing all of it here, not hunting for a
 * separate "blocks" area.
 */
export default async function EditPage({ params }: { params: Promise<{ key: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { key } = await params;
  const def = singletonDef(key);
  if (!def) notFound();

  const doc = await getSingleton(key);
  if (!doc) notFound();

  const en = (doc.en as Record<string, unknown>) ?? {};
  const ar = (doc.ar as Record<string, unknown>) ?? {};

  const values: Record<string, { en: string; ar: string }> = {};
  for (const g of def.groups) for (const f of g.fields) {
    values[f.path] = {
      en: String(getPath(en, f.path) ?? ""),
      ar: String(getPath(ar, f.path) ?? ""),
    };
  }

  // The repeating sections that belong to this page.
  const blocks = Object.values(SINGLETON_BLOCKS).filter((b) => b.singleton === key);
  const blockData = blocks.map((b) => {
    const enArr = (getPath(en, b.path) as unknown[]) ?? [];
    const arArr = (getPath(ar, b.path) as unknown[]) ?? [];
    const items: Item[] = enArr.map((enRaw, i) => {
      if (b.scalar) return { value: { en: String(enRaw ?? ""), ar: String(arArr[i] ?? "") } };
      const enItem = (enRaw ?? {}) as Record<string, unknown>;
      const arItem = (arArr[i] ?? {}) as Record<string, unknown>;
      const row: Item = {};
      for (const f of b.fields) {
        if (f.i18n) row[f.key] = { en: String(enItem?.[f.key] ?? ""), ar: String(arItem?.[f.key] ?? "") };
        else row[f.key] = (enItem?.[f.key] ?? "") as string | number;
      }
      return row;
    });
    return { def: b, items };
  });

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 20px 70px" }}>
      <PageEditor keyName={key} labelAr={def.labelAr} groups={def.groups} initial={values} />

      {blockData.length > 0 && (
        <div style={{ display: "grid", gap: 18, marginTop: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: ".18em", color: "var(--faint)", marginTop: 6 }}>أقسام الصفحة</div>
          {blockData.map(({ def: b, items }) => (
            <BlockEditor key={b.key} embedded block={b.key} labelAr={b.labelAr}
              itemLabelAr={b.itemLabelAr} titleField={b.titleField} fields={b.fields} initialItems={items} />
          ))}
        </div>
      )}
    </div>
  );
}

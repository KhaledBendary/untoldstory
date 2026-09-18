import "@/lib/db/register"; // server-only: publishes the DB content-source for api.ts
import { redirect, notFound } from "next/navigation";
import { currentSession } from "@/lib/admin-session";
import { singletonBlock } from "@/lib/admin/blocks";
import { getPath } from "@/lib/admin/singleton-fields";
import { getSingleton } from "@/lib/db/repo";
import BlockEditor, { type Item } from "./BlockEditor";

export const dynamic = "force-dynamic";

export default async function BlockPage({ params }: { params: Promise<{ block: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { block } = await params;
  const def = singletonBlock(block);
  if (!def) notFound();

  const doc = (await getSingleton(def.singleton)) ?? {};
  const enArr = (getPath(doc.en, def.path) as unknown[]) ?? [];
  const arArr = (getPath(doc.ar, def.path) as unknown[]) ?? [];

  const items: Item[] = enArr.map((enRaw, i) => {
    if (def.scalar) {
      // A plain string per item — surfaced through the synthetic "value" field.
      return { value: { en: String(enRaw ?? ""), ar: String(arArr[i] ?? "") } };
    }
    const enItem = (enRaw ?? {}) as Record<string, unknown>;
    const arItem = (arArr[i] ?? {}) as Record<string, unknown>;
    const row: Item = {};
    for (const f of def.fields) {
      if (f.i18n) row[f.key] = { en: String(enItem?.[f.key] ?? ""), ar: String(arItem?.[f.key] ?? "") };
      else row[f.key] = (enItem?.[f.key] ?? "") as string | number;
    }
    return row;
  });

  return (
    <BlockEditor
      block={def.key}
      labelAr={def.labelAr}
      itemLabelAr={def.itemLabelAr}
      titleField={def.titleField}
      fields={def.fields}
      initialItems={items}
    />
  );
}

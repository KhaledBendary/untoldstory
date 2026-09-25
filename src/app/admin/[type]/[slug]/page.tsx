import { redirect, notFound } from "next/navigation";
import { currentSession } from "@/lib/admin-session";
import { contentType } from "@/lib/admin/content-types";
import { getByType } from "@/lib/db/repo";
import { extractSeoForEditor } from "@/lib/admin/seo-fields";
import { aiConfigured } from "@/lib/ai";
import ContentEditor from "./ContentEditor";

export const dynamic = "force-dynamic";

export default async function EditContent({ params }: { params: Promise<{ type: string; slug: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { type, slug } = await params;
  const def = contentType(type);
  if (!def) notFound();

  const row = (await getByType(def.table, slug)) as unknown as Record<string, unknown> | null;
  if (!row) notFound();

  const data = (row.data ?? {}) as Record<string, Record<string, string>>;
  const fixed: Record<string, unknown> = {};
  for (const f of def.fixed) {
    const v = row[f.key];
    if (f.type === "bool") fixed[f.key] = Boolean(v);
    else if (f.type === "date") fixed[f.key] = v ? new Date(v as string).toISOString().slice(0, 10) : "";
    else fixed[f.key] = v ?? "";
  }
  const i18n: Record<string, Record<string, string>> = {};
  for (const f of def.i18n) i18n[f.key] = data[f.key] ?? {};
  // seo.* fields live under the nested data.seo, not as flat keys.
  Object.assign(i18n, extractSeoForEditor(data.seo as unknown as Record<string, Record<string, string>> | undefined, def));

  return (
    <ContentEditor
      type={type}
      slug={slug}
      fixedFields={def.fixed}
      i18nFields={def.i18n}
      labelAr={def.labelAr}
      initialFixed={fixed}
      initialI18n={i18n}
      initialStatus={(row.status as string) ?? "published"}
      aiEnabled={aiConfigured()}
      slugs={(data.slugs as Record<string, string> | undefined) ?? {}}
    />
  );
}

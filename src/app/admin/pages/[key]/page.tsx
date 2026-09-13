import { redirect, notFound } from "next/navigation";
import { currentSession } from "@/lib/admin-session";
import { singletonDef, getPath } from "@/lib/admin/singleton-fields";
import { getSingleton } from "@/lib/db/repo";
import PageEditor from "./PageEditor";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ key: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { key } = await params;
  const def = singletonDef(key);
  if (!def) notFound();

  const doc = await getSingleton(key);
  if (!doc) notFound();

  const en = (doc.en as Record<string, unknown>) ?? {};
  const ar = (doc.ar as Record<string, unknown>) ?? {};

  // Pull current en/ar for each declared path.
  const values: Record<string, { en: string; ar: string }> = {};
  for (const g of def.groups) for (const f of g.fields) {
    values[f.path] = {
      en: String(getPath(en, f.path) ?? ""),
      ar: String(getPath(ar, f.path) ?? ""),
    };
  }

  return <PageEditor keyName={key} labelAr={def.labelAr} groups={def.groups} initial={values} />;
}

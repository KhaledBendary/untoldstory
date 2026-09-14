import { redirect, notFound } from "next/navigation";
import { currentSession } from "@/lib/admin-session";
import { contentType } from "@/lib/admin/content-types";
import ContentEditor from "../[slug]/ContentEditor";

export const dynamic = "force-dynamic";

/** Create a new item of a content type — the editor in "create" mode. */
export default async function NewContent({ params }: { params: Promise<{ type: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { type } = await params;
  const def = contentType(type);
  if (!def) notFound();

  const fixed: Record<string, unknown> = {};
  for (const f of def.fixed) fixed[f.key] = f.type === "bool" ? false : "";
  const i18n: Record<string, Record<string, string>> = {};
  for (const f of def.i18n) i18n[f.key] = {};

  return (
    <ContentEditor
      type={type}
      slug=""
      create
      fixedFields={def.fixed}
      i18nFields={def.i18n}
      labelAr={def.labelAr}
      initialFixed={fixed}
      initialI18n={i18n}
    />
  );
}

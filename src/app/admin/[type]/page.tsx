import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { contentType } from "@/lib/admin/content-types";
import { listByType } from "@/lib/db/repo";
import ContentListClient, { type Row as ClientRow } from "./ContentListClient";

export const dynamic = "force-dynamic";

type Row = { slug: string; data: { title?: Record<string, string> }; icon?: string | null; status?: string };

/** The list for any content type, driven by its definition. */
export default async function ContentList({ params }: { params: Promise<{ type: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { type } = await params;
  const def = contentType(type);
  if (!def) notFound();

  const rows = (await listByType(def.table)) as unknown as Row[];
  const clientRows: ClientRow[] = rows.map((r) => {
    const t = r.data.title ?? {};
    const en = t.en || r.slug;
    return { slug: r.slug, title: t.ar || en, sub: en, icon: r.icon ?? null, arMissing: !t.ar, draft: r.status === "draft" };
  });

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>← اللوحة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{def.labelAr}</h1>
        <span style={{ fontSize: 13, color: "var(--faint)" }}>{rows.length}</span>
        <Link href={`/admin/${type}/new`} className="primary"
          style={{ marginInlineStart: "auto", fontSize: 13, padding: "8px 16px", borderRadius: 8,
            background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 600 }}>
          + {def.singularAr} جديدة
        </Link>
      </div>

      <ContentListClient type={type} orderable={def.orderable} initial={clientRows} />
    </div>
  );
}

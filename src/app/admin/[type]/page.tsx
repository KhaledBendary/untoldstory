import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { contentType } from "@/lib/admin/content-types";
import { listByType } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

type Row = { slug: string; data: { title?: Record<string, string> }; icon?: string | null };

/** The list for any content type, driven by its definition. */
export default async function ContentList({ params }: { params: Promise<{ type: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { type } = await params;
  const def = contentType(type);
  if (!def) notFound();

  const rows = (await listByType(def.table)) as unknown as Row[];

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>← اللوحة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{def.labelAr}</h1>
        <span style={{ fontSize: 13, color: "var(--faint)" }}>{rows.length}</span>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((r) => {
          const t = r.data.title ?? {};
          const en = t.en || r.slug;
          const arMissing = !t.ar;
          return (
            <Link key={r.slug} href={`/admin/${type}/${r.slug}`}
              style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--panel)",
                border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", color: "var(--ink)" }}>
              {"icon" in r && r.icon && <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{r.icon}</span>}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 15,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.ar || en}</span>
                <span dir="ltr" style={{ display: "block", fontSize: 12, color: "var(--faint)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{en}</span>
              </span>
              {arMissing && (
                <span style={{ fontSize: 11, color: "var(--warn)", border: "1px solid var(--warn)",
                  borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>ناقص عربي</span>
              )}
              <span style={{ color: "var(--faint)" }}>‹</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { SINGLETON_BLOCKS } from "@/lib/admin/blocks";

export const dynamic = "force-dynamic";

const GROUP: Record<string, string> = { home: "الصفحة الرئيسية", about: "صفحة من نحن", layout: "الترويسة والفوتر" };

/** The repeating blocks (lists) inside the one-off pages, grouped by page. */
export default async function BlocksList() {
  if (!(await currentSession())) redirect("/admin/login");

  const groups = new Map<string, typeof SINGLETON_BLOCKS[string][]>();
  for (const b of Object.values(SINGLETON_BLOCKS)) {
    (groups.get(b.singleton) ?? groups.set(b.singleton, []).get(b.singleton)!).push(b);
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>← اللوحة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>البلوكات المتكررة</h1>
      </div>

      {[...groups.entries()].map(([singleton, blocks]) => (
        <section key={singleton} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 8px" }}>{GROUP[singleton] ?? singleton}</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {blocks.map((b) => (
              <Link key={b.key} href={`/admin/blocks/${b.key}`}
                style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--panel)",
                  border: "1px solid var(--line)", borderRadius: 10, padding: "14px", color: "var(--ink)" }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{b.labelAr}</span>
                <span style={{ color: "var(--faint)" }}>‹</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

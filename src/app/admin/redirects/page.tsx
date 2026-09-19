import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { getRedirects, getNotFounds } from "@/lib/db/repo";
import RedirectsClient, { type RedirectRow, type NotFoundRow } from "./RedirectsClient";

export const dynamic = "force-dynamic";

/** 301 redirects manager + broken-link (404) monitor. */
export default async function RedirectsPage() {
  if (!(await currentSession())) redirect("/admin/login");
  const [redirects, notFounds] = await Promise.all([getRedirects(), getNotFounds()]);

  const rItems: RedirectRow[] = redirects.map((r) => ({
    id: r.id, from: r.from_path, to: r.to_path, createdAt: new Date(r.created_at).toISOString(),
  }));
  const nItems: NotFoundRow[] = notFounds.map((n) => ({
    path: n.path, hits: n.hits, referrer: n.referrer, lastSeen: new Date(n.last_seen).toISOString(),
  }));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>← اللوحة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>التحويلات والروابط المكسورة</h1>
      </div>
      <RedirectsClient initialRedirects={rItems} initialNotFounds={nItems} />
    </div>
  );
}

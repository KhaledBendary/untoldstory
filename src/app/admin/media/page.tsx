import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { getMedia } from "@/lib/db/repo";
import MediaManager from "./MediaManager";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  if (!(await currentSession())) redirect("/admin/login");
  const media = await getMedia();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>← اللوحة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>الصور</h1>
        <span style={{ fontSize: 13, color: "var(--faint)" }}>{media.length}</span>
      </div>
      <MediaManager initial={media.map((m) => ({ id: m.id, url: m.url, filename: m.filename, alt: m.alt || {} }))} />
    </div>
  );
}

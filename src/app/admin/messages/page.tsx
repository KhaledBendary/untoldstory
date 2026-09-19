import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { getMessages } from "@/lib/db/repo";
import MessagesClient, { type Message } from "./MessagesClient";

export const dynamic = "force-dynamic";

/** The leads inbox — every contact-form submission, with a status workflow. */
export default async function MessagesPage() {
  if (!(await currentSession())) redirect("/admin/login");
  const rows = await getMessages();
  const items: Message[] = rows.map((m) => ({
    id: m.id, name: m.name, email: m.email, phone: m.phone, service: m.service,
    message: m.message, locale: m.locale, status: m.status, emailed: m.emailed,
    createdAt: new Date(m.created_at).toISOString(),
  }));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>← اللوحة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>الرسائل</h1>
        <span style={{ fontSize: 13, color: "var(--faint)" }}>{items.length}</span>
      </div>
      <div style={{ marginBottom: 20 }} />
      <MessagesClient initial={items} />
    </div>
  );
}

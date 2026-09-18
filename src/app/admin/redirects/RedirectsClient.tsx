"use client";

import { useState } from "react";

export type RedirectRow = { id: number; from: string; to: string; createdAt: string };
export type NotFoundRow = { path: string; hits: number; referrer: string | null; lastSeen: string };

/**
 * Manage 301 redirects and watch for broken links. A redirect maps an old path
 * to a new one; it takes effect on the next publish. The 404 list shows URLs
 * visitors hit that don't exist — one click turns any of them into a redirect.
 */
export default function RedirectsClient({
  initialRedirects,
  initialNotFounds,
}: {
  initialRedirects: RedirectRow[];
  initialNotFounds: NotFoundRow[];
}) {
  const [redirects, setRedirects] = useState<RedirectRow[]>(initialRedirects);
  const [notFounds, setNotFounds] = useState<NotFoundRow[]>(initialNotFounds);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fmt = (iso: string) => new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

  async function add(fromPath: string, toPath: string) {
    setError("");
    if (!fromPath.startsWith("/") || !toPath) {
      setError("المسار القديم لازم يبدأ بـ / وتحدد الوجهة");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromPath, to: toPath }),
    }).catch(() => null);
    setBusy(false);
    if (!res || !res.ok) {
      const j = res ? await res.json().catch(() => null) : null;
      setError(j?.error || "حصل خطأ، حاول تاني");
      return;
    }
    setRedirects((prev) => [
      { id: Date.now(), from: fromPath, to: toPath, createdAt: new Date().toISOString() },
      ...prev.filter((r) => r.from !== fromPath),
    ]);
    setNotFounds((prev) => prev.filter((n) => n.path !== fromPath));
    setFrom("");
    setTo("");
  }

  async function removeRedirect(id: number) {
    if (!confirm("متأكد إنك عايز تمسح التحويل ده؟")) return;
    setRedirects((prev) => prev.filter((r) => r.id !== id));
    await fetch("/api/admin/redirects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  async function dismiss404(path: string) {
    setNotFounds((prev) => prev.filter((n) => n.path !== path));
    await fetch("/api/admin/redirects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    }).catch(() => {});
  }

  return (
    <div style={{ display: "grid", gap: 32 }}>
      {/* Add a redirect */}
      <section>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <label style={{ flex: 1, minWidth: 180, fontSize: 12, color: "var(--muted)" }}>
              المسار القديم
              <input dir="ltr" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="/old-page"
                style={{ display: "block", width: "100%", marginTop: 4, fontSize: 14, padding: "8px 10px" }} />
            </label>
            <span style={{ paddingBottom: 10, color: "var(--faint)" }}>←</span>
            <label style={{ flex: 1, minWidth: 180, fontSize: 12, color: "var(--muted)" }}>
              الوجهة الجديدة
              <input dir="ltr" value={to} onChange={(e) => setTo(e.target.value)} placeholder="/work/new-slug"
                style={{ display: "block", width: "100%", marginTop: 4, fontSize: 14, padding: "8px 10px" }} />
            </label>
            <button className="primary" disabled={busy} onClick={() => add(from.trim(), to.trim())}
              style={{ fontSize: 13, padding: "9px 18px", background: "var(--accent)", color: "var(--accent-ink)",
                borderColor: "var(--accent)", opacity: busy ? 0.6 : 1 }}>
              {busy ? "..." : "إضافة تحويل"}
            </button>
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: 13, margin: "10px 2px 0" }}>{error}</p>}
        </div>
      </section>

      {/* Active redirects */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>
          التحويلات المفعّلة <span style={{ color: "var(--faint)", fontWeight: 400 }}>{redirects.length}</span>
        </h2>
        {redirects.length === 0 ? (
          <p style={{ color: "var(--faint)", fontSize: 14 }}>مفيش تحويلات لسه.</p>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "var(--faint)" }}>
                  {["من", "إلى", "أُضيف", ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "start", padding: "10px 12px", fontWeight: 500, borderBottom: "1px solid var(--line)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {redirects.map((r) => (
                  <tr key={r.id}>
                    <td dir="ltr" style={{ padding: "9px 12px" }}>{r.from}</td>
                    <td dir="ltr" style={{ padding: "9px 12px", color: "var(--muted)" }}>{r.to}</td>
                    <td style={{ padding: "9px 12px", color: "var(--faint)", whiteSpace: "nowrap" }}>{fmt(r.createdAt)}</td>
                    <td style={{ padding: "9px 12px", textAlign: "end" }}>
                      <button onClick={() => removeRedirect(r.id)}
                        style={{ fontSize: 12, padding: "5px 10px", color: "var(--danger)", borderColor: "var(--line)" }}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 404 monitor */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>
          روابط مكسورة (404) <span style={{ color: "var(--faint)", fontWeight: 400 }}>{notFounds.length}</span>
        </h2>
        {notFounds.length === 0 ? (
          <p style={{ color: "var(--faint)", fontSize: 14 }}>مفيش روابط مكسورة اتسجّلت — تمام كده. 🎉</p>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "var(--faint)" }}>
                  {["المسار", "مرات", "آخر مرة", ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "start", padding: "10px 12px", fontWeight: 500, borderBottom: "1px solid var(--line)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notFounds.map((n) => (
                  <tr key={n.path}>
                    <td dir="ltr" style={{ padding: "9px 12px", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.referrer || undefined}>{n.path}</td>
                    <td style={{ padding: "9px 12px", color: "var(--muted)" }}>{n.hits}</td>
                    <td style={{ padding: "9px 12px", color: "var(--faint)", whiteSpace: "nowrap" }}>{fmt(n.lastSeen)}</td>
                    <td style={{ padding: "9px 12px", textAlign: "end", whiteSpace: "nowrap" }}>
                      <button onClick={() => { setFrom(n.path); setTo(""); }}
                        style={{ fontSize: 12, padding: "5px 10px", marginInlineEnd: 6 }}>حوّل</button>
                      <button onClick={() => dismiss404(n.path)}
                        style={{ fontSize: 12, padding: "5px 10px", color: "var(--muted)", borderColor: "var(--line)" }}>تجاهل</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

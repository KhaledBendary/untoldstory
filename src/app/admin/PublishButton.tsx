"use client";

import { useState } from "react";

/**
 * Force a production rebuild from the dashboard. Content saves already trigger a
 * build on their own (with a cooldown), but this makes the current state go live
 * immediately — the reliable "make it appear now" control.
 */
export default function PublishButton() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function publish() {
    if (!confirm("تبدأ نشر الموقع دلوقتي؟ التعديلات هتظهر خلال دقيقة–دقيقتين.")) return;
    setState("busy"); setMsg("");
    try {
      const res = await fetch("/api/admin/publish", { method: "POST" });
      const out = await res.json().catch(() => ({}));
      if (res.ok) { setState("done"); setMsg("بدأ النشر — هيظهر على الموقع خلال دقيقة–دقيقتين"); }
      else { setState("error"); setMsg(out.error || "تعذّر بدء النشر"); }
    } catch {
      setState("error"); setMsg("تعذّر الاتصال بالخادم");
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button onClick={publish} disabled={state === "busy"}
        style={{ fontSize: 14, fontWeight: 600, padding: "9px 18px", borderRadius: 8,
          background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)" }}>
        {state === "busy" ? "بيبدأ النشر…" : "🚀 نشر الموقع الآن"}
      </button>
      {msg && (
        <span style={{ fontSize: 13, color: state === "error" ? "var(--danger)" : "var(--ok)" }}>{msg}</span>
      )}
    </div>
  );
}

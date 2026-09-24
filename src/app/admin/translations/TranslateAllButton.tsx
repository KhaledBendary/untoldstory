"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * One-click: regenerate every machine language from English across all
 * content, and — for any item missing one of English/Arabic — fill it in
 * from whichever one is written (see applyMachineTranslations).
 */
export default function TranslateAllButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function run() {
    if (!confirm("هيترجم كل الخدمات والمشاريع والمقالات لكل اللغات من الإنجليزي، وهيكمّل أي عنصر ناقصه إنجليزي أو عربي من اللغة التانية. تكمّل؟")) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/translate-all", { method: "POST" });
      const out = await res.json();
      if (!res.ok) { setMsg({ kind: "err", text: out.error || "حصل خطأ" }); return; }
      const failed = out.failed?.length ? ` — فشل ${out.failed.length}` : "";
      setMsg({ kind: "ok", text: `تمت ترجمة ${out.done} عنصر${failed}. جاري نشر الموقع…` });
      router.refresh();
    } catch {
      setMsg({ kind: "err", text: "تعذّر الاتصال بالخادم" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button className="primary" onClick={run} disabled={busy}
        style={{ fontSize: 13, padding: "9px 18px", background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)", opacity: busy ? 0.6 : 1 }}>
        {busy ? "بيترجم… (ممكن ياخد دقيقة)" : "✨ ترجم كل الناقص للـ12 لغة"}
      </button>
      {msg && <span style={{ fontSize: 13, color: msg.kind === "ok" ? "var(--ok)" : "var(--danger)" }}>{msg.text}</span>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Translate a single item into all machine languages, on demand. */
export default function TranslateItemButton({ type, slug }: { type: string; slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function run() {
    setState("busy"); setMsg("");
    try {
      const res = await fetch("/api/admin/translate-all", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug }),
      });
      const out = await res.json();
      if (!res.ok) { setState("err"); setMsg(out.error || "فشل"); return; }
      setState("ok"); setMsg("اترجم ✓");
      router.refresh();
    } catch {
      setState("err"); setMsg("خطأ اتصال");
    }
  }

  return (
    <button type="button" onClick={run} disabled={state === "busy"} title="ترجمة العنصر ده لكل اللغات"
      style={{ fontSize: 11.5, padding: "4px 10px", borderColor: "var(--line)",
        color: state === "err" ? "var(--danger)" : state === "ok" ? "var(--ok)" : "var(--accent)",
        opacity: state === "busy" ? 0.6 : 1, whiteSpace: "nowrap" }}>
      {state === "busy" ? "…بيترجم" : state === "ok" ? (msg) : state === "err" ? (msg) : "✨ ترجم"}
    </button>
  );
}

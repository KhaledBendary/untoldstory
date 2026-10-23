"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// The 12 machine languages, translated one at a time so no single request times out.
// "ar" is included too — not a machine locale itself, but sending it as `locale`
// is what makes the server also run the English/Arabic sync (see
// applyMachineTranslations), which this button used to skip entirely: it could
// turn every machine-language dot green while leaving Arabic missing forever,
// since only a full item save (no locale filter) ever triggered that sync.
const LOCALES = ["ar", "fr", "de", "es", "it", "pt", "ru", "tr", "zh", "ja", "ko", "pl", "sw"];

/** Translate a single item into every machine language and sync Arabic — one request per language. */
export default function TranslateItemButton({ type, slug }: { type: string; slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function run() {
    setState("busy"); setMsg("");
    let done = 0; let failed = 0; let firstError = "";
    // Small concurrency: fast, but gentle on the API rate limits.
    const queue = [...LOCALES];
    async function worker() {
      while (queue.length) {
        const loc = queue.shift()!;
        try {
          const res = await fetch("/api/admin/translate-all", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, slug, locale: loc }),
          });
          if (res.ok) done++;
          else { failed++; if (!firstError) firstError = (await res.json().catch(() => ({})))?.error || `HTTP ${res.status}`; }
        } catch { failed++; if (!firstError) firstError = "خطأ اتصال"; }
        setMsg(`بيترجم… ${done + failed}/${LOCALES.length}`);
      }
    }
    try {
      await Promise.all([worker(), worker(), worker()]); // 3 in parallel
      if (done > 0) {
        // Publish once after all languages are in.
        await fetch("/api/admin/publish", { method: "POST" }).catch(() => {});
        setState(failed ? "err" : "ok");
        setMsg(failed ? `تم ${done} · فشل ${failed}${firstError ? " — " + firstError : ""}` : "اترجم ✓ ونشر");
        router.refresh();
      } else {
        setState("err"); setMsg(firstError || "فشلت الترجمة");
      }
    } catch {
      setState("err"); setMsg("خطأ غير متوقع");
    }
  }

  return (
    <button type="button" onClick={run} disabled={state === "busy"} title={msg || "ترجمة العنصر ده لكل اللغات"}
      style={{ fontSize: 11.5, padding: "4px 10px", borderColor: "var(--line)",
        color: state === "err" ? "var(--danger)" : state === "ok" ? "var(--ok)" : "var(--accent)",
        opacity: state === "busy" ? 0.6 : 1, whiteSpace: "nowrap", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
      {state === "busy" ? msg || "…بيترجم" : state === "ok" ? msg : state === "err" ? msg : "✨ ترجم"}
    </button>
  );
}

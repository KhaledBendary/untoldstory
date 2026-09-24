"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A small visual editor for the long article fields, so no one has to write HTML
 * by hand. A toolbar covers what these articles actually use — headings,
 * paragraphs, bold/italic, lists and links — and the content is edited as it
 * will look. A "HTML" toggle stays available for anyone who wants the source.
 *
 * The editor is uncontrolled while typing (so the cursor never jumps) and is
 * re-seeded from `value` only when it changes from outside — e.g. switching the
 * language tab. It reports clean-ish HTML on every edit.
 */
export default function RichTextEditor({ value, onChange, dir = "ltr" }: {
  value: string; onChange: (html: string) => void; dir?: "ltr" | "rtl";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [source, setSource] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const last = useRef(value);

  // Re-seed the DOM only when the incoming value differs from what we last
  // emitted (external change, e.g. language switch) — never mid-typing.
  useEffect(() => {
    if (!ref.current) return;
    if (value !== last.current) {
      ref.current.innerHTML = value || "";
      last.current = value;
    }
  }, [value]);

  useEffect(() => {
    if (ref.current && !source) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const emit = () => {
    const html = ref.current?.innerHTML ?? "";
    last.current = html;
    onChange(html);
  };

  const cmd = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const heading = (tag: "H2" | "H3" | "P") => cmd("formatBlock", tag);

  const link = () => {
    const url = prompt("رابط اللينك (https://…)");
    if (url) cmd("createLink", url);
  };

  // Remember where the caret is before the file dialog steals focus.
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRange.current = null;
    }
  };

  // Insert an <img> at the saved caret (or append to the end), then emit.
  const insertImage = (url: string) => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const img = `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px" />`;
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
      document.execCommand("insertHTML", false, img);
    } else {
      el.insertAdjacentHTML("beforeend", img);
    }
    emit();
  };

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploading(true); setUploadErr("");
    try {
      const body = new FormData(); body.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) { setUploadErr(data.error || "فشل رفع الصورة"); return; }
      insertImage(data.media.url);
    } catch {
      setUploadErr("تعذّر الاتصال بالخادم");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const Btn = ({ on, children, title }: { on: () => void; children: React.ReactNode; title: string }) => (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); on(); }}
      style={{ fontSize: 13, padding: "5px 9px", minWidth: 32, background: "var(--panel)", borderColor: "var(--line)" }}>
      {children}
    </button>
  );

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "var(--panel)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 6, borderBottom: "1px solid var(--line)" }}>
        <Btn on={() => heading("H2")} title="عنوان كبير">H2</Btn>
        <Btn on={() => heading("H3")} title="عنوان صغير">H3</Btn>
        <Btn on={() => heading("P")} title="فقرة">¶</Btn>
        <Btn on={() => cmd("bold")} title="عريض"><b>B</b></Btn>
        <Btn on={() => cmd("italic")} title="مائل"><i>I</i></Btn>
        <Btn on={() => cmd("insertUnorderedList")} title="قائمة نقطية">• —</Btn>
        <Btn on={() => cmd("insertOrderedList")} title="قائمة مرقّمة">1.</Btn>
        <Btn on={link} title="إضافة رابط">🔗</Btn>
        <button type="button" title="إدراج صورة" disabled={uploading}
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); fileRef.current?.click(); }}
          style={{ fontSize: 13, padding: "5px 9px", minWidth: 32, background: "var(--panel)", borderColor: "var(--line)", opacity: uploading ? 0.6 : 1 }}>
          {uploading ? "…" : "🖼️"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => uploadImage(e.target.files?.[0])} />
        <Btn on={() => cmd("removeFormat")} title="إزالة التنسيق">✕</Btn>
        <button type="button" onClick={() => setSource((s) => !s)}
          style={{ marginInlineStart: "auto", fontSize: 12, padding: "5px 10px",
            background: source ? "var(--accent)" : "var(--panel)", color: source ? "var(--accent-ink)" : "var(--ink)",
            borderColor: source ? "var(--accent)" : "var(--line)" }}>HTML</button>
      </div>

      {source ? (
        <textarea dir="ltr" value={value} onChange={(e) => { last.current = e.target.value; onChange(e.target.value); }}
          rows={14} style={{ width: "100%", border: "none", borderRadius: 0, fontFamily: "ui-monospace, monospace",
            fontSize: 13, background: "var(--bg)", resize: "vertical" }} />
      ) : (
        <div ref={ref} dir={dir} contentEditable suppressContentEditableWarning onInput={emit}
          style={{ minHeight: 260, padding: "12px 14px", outline: "none", lineHeight: 1.7, fontSize: 15,
            background: "var(--bg)" }} />
      )}
      {uploadErr && <div style={{ color: "var(--danger)", fontSize: 12, padding: "6px 10px" }}>{uploadErr}</div>}
    </div>
  );
}

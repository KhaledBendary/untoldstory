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
  const [source, setSource] = useState(false);
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
    </div>
  );
}

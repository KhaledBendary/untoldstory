"use client";

import { useState } from "react";
import type { GeoSettings, GeoOffice, GeoFaq } from "@/lib/seo/geo";

const lbl = { fontSize: 12.5, color: "var(--muted)", display: "block", marginBottom: 4 } as const;
const input = { width: "100%", fontSize: 14, padding: "8px 10px" } as const;
const card = { background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginBottom: 14 } as const;
const h2 = { fontSize: 16, fontWeight: 700, margin: "22px 0 10px" } as const;

/** Editor for the GEO/SEO settings document. */
export default function SeoSettingsClient({ initial }: { initial: GeoSettings }) {
  const [s, setS] = useState<GeoSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const set = (patch: Partial<GeoSettings>) => { setDirty(true); setS((p) => ({ ...p, ...patch })); };
  const setOrg = (patch: Partial<GeoSettings["organization"]>) => set({ organization: { ...s.organization, ...patch } });

  const setOffice = (i: number, patch: Partial<GeoOffice>) => {
    const offices = s.offices.map((o, n) => (n === i ? { ...o, ...patch } : o));
    set({ offices });
  };
  const addOffice = () => set({ offices: [...s.offices, { id: `office-${Date.now()}`, name: "", locality: "", region: "", country: "", phone: "", lat: null, lng: null, days: "Sun–Thu", opens: "09:00", closes: "18:00" }] });
  const removeOffice = (i: number) => set({ offices: s.offices.filter((_, n) => n !== i) });

  const setFaq = (i: number, patch: Partial<GeoFaq>) => set({ faq: s.faq.map((f, n) => (n === i ? { ...f, ...patch } : f)) });
  const addFaq = () => set({ faq: [...s.faq, { qEn: "", aEn: "", qAr: "", aAr: "" }] });
  const removeFaq = (i: number) => set({ faq: s.faq.filter((_, n) => n !== i) });

  async function save() {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/seo-settings", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
      });
      const out = await res.json();
      if (!res.ok) { setMsg({ kind: "err", text: out.error || "حصل خطأ" }); return; }
      setDirty(false);
      setMsg({ kind: "ok", text: out.deploy?.triggered ? "اتحفظ ✓ — وبدأ نشر الموقع" : "اتحفظ ✓" });
    } catch {
      setMsg({ kind: "err", text: "تعذّر الاتصال بالخادم" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Organization identity */}
      <h2 style={h2}>هوية الشركة</h2>
      <div style={card}>
        <div style={{ display: "grid", gap: 12 }}>
          <label><span style={lbl}>الاسم</span><input style={input} value={s.organization.name} onChange={(e) => setOrg({ name: e.target.value })} /></label>
          <label><span style={lbl}>الشعار (Slogan)</span><input style={input} value={s.organization.slogan} onChange={(e) => setOrg({ slogan: e.target.value })} /></label>
          <label><span style={lbl}>الوصف</span><textarea style={{ ...input, minHeight: 70 }} value={s.organization.description} onChange={(e) => setOrg({ description: e.target.value })} /></label>
          <label><span style={lbl}>البريد الإلكتروني</span><input dir="ltr" style={input} value={s.organization.email} onChange={(e) => setOrg({ email: e.target.value })} /></label>
          <label><span style={lbl}>مجالات الخبرة (كل سطر واحد)</span>
            <textarea style={{ ...input, minHeight: 110 }} value={s.organization.knowsAbout.join("\n")} onChange={(e) => setOrg({ knowsAbout: e.target.value.split("\n") })} /></label>
          <label><span style={lbl}>روابط السوشيال ميديا (كل رابط في سطر)</span>
            <textarea dir="ltr" style={{ ...input, minHeight: 90 }} value={s.organization.sameAs.join("\n")} onChange={(e) => setOrg({ sameAs: e.target.value.split("\n") })} /></label>
        </div>
      </div>

      {/* Offices */}
      <h2 style={h2}>المكاتب (LocalBusiness)</h2>
      {s.offices.map((o, i) => (
        <div key={i} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <strong style={{ fontSize: 14 }}>{o.name || `مكتب ${i + 1}`}</strong>
            <button onClick={() => removeOffice(i)} style={{ fontSize: 12, padding: "5px 10px", color: "var(--danger)", borderColor: "var(--line)" }}>حذف</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ gridColumn: "1 / -1" }}><span style={lbl}>اسم المكتب</span><input style={input} value={o.name} onChange={(e) => setOffice(i, { name: e.target.value })} /></label>
            <label style={{ gridColumn: "1 / -1" }}><span style={lbl}>العنوان / المنطقة</span><input style={input} value={o.locality} onChange={(e) => setOffice(i, { locality: e.target.value })} /></label>
            <label><span style={lbl}>المحافظة/الإمارة</span><input style={input} value={o.region} onChange={(e) => setOffice(i, { region: e.target.value })} /></label>
            <label><span style={lbl}>الدولة (رمز ISO مثل EG)</span><input dir="ltr" style={input} value={o.country} onChange={(e) => setOffice(i, { country: e.target.value })} /></label>
            <label><span style={lbl}>التليفون</span><input dir="ltr" style={input} value={o.phone || ""} onChange={(e) => setOffice(i, { phone: e.target.value })} /></label>
            <label><span style={lbl}>أيام العمل</span><input dir="ltr" style={input} value={o.days || ""} onChange={(e) => setOffice(i, { days: e.target.value })} /></label>
            <label><span style={lbl}>خط العرض (Latitude)</span><input dir="ltr" type="number" step="any" style={input} value={o.lat ?? ""} onChange={(e) => setOffice(i, { lat: e.target.value === "" ? null : Number(e.target.value) })} /></label>
            <label><span style={lbl}>خط الطول (Longitude)</span><input dir="ltr" type="number" step="any" style={input} value={o.lng ?? ""} onChange={(e) => setOffice(i, { lng: e.target.value === "" ? null : Number(e.target.value) })} /></label>
            <label><span style={lbl}>يفتح</span><input dir="ltr" style={input} value={o.opens || ""} onChange={(e) => setOffice(i, { opens: e.target.value })} placeholder="09:00" /></label>
            <label><span style={lbl}>يقفل</span><input dir="ltr" style={input} value={o.closes || ""} onChange={(e) => setOffice(i, { closes: e.target.value })} placeholder="18:00" /></label>
          </div>
        </div>
      ))}
      <button onClick={addOffice} style={{ fontSize: 13, padding: "8px 14px", marginBottom: 8 }}>+ إضافة مكتب</button>

      {/* FAQ */}
      <h2 style={h2}>الأسئلة الشائعة (FAQ Schema)</h2>
      {s.faq.map((f, i) => (
        <div key={i} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <strong style={{ fontSize: 14 }}>سؤال {i + 1}</strong>
            <button onClick={() => removeFaq(i)} style={{ fontSize: 12, padding: "5px 10px", color: "var(--danger)", borderColor: "var(--line)" }}>حذف</button>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <label><span style={lbl}>السؤال (إنجليزي)</span><input dir="ltr" style={input} value={f.qEn} onChange={(e) => setFaq(i, { qEn: e.target.value })} /></label>
            <label><span style={lbl}>الإجابة (إنجليزي)</span><textarea dir="ltr" style={{ ...input, minHeight: 60 }} value={f.aEn} onChange={(e) => setFaq(i, { aEn: e.target.value })} /></label>
            <label><span style={lbl}>السؤال (عربي)</span><input dir="rtl" style={input} value={f.qAr} onChange={(e) => setFaq(i, { qAr: e.target.value })} /></label>
            <label><span style={lbl}>الإجابة (عربي)</span><textarea dir="rtl" style={{ ...input, minHeight: 60 }} value={f.aAr} onChange={(e) => setFaq(i, { aAr: e.target.value })} /></label>
          </div>
        </div>
      ))}
      <button onClick={addFaq} style={{ fontSize: 13, padding: "8px 14px", marginBottom: 8 }}>+ إضافة سؤال</button>

      {/* llms.txt + AI crawlers */}
      <h2 style={h2}>الذكاء الاصطناعي (llms.txt وزواحف AI)</h2>
      <div style={card}>
        <label><span style={lbl}>مقدّمة الموقع لمحركات الـAI (llms.txt)</span>
          <textarea style={{ ...input, minHeight: 80 }} value={s.llmsIntro} onChange={(e) => set({ llmsIntro: e.target.value })} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, marginTop: 14 }}>
          <input type="checkbox" checked={s.aiCrawlers} onChange={(e) => set({ aiCrawlers: e.target.checked })} style={{ width: 18, height: 18 }} />
          السماح لزواحف الذكاء الاصطناعي (ChatGPT، Claude، Perplexity…) بقراءة الموقع والاقتباس منه
        </label>
      </div>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, position: "sticky", bottom: 0, background: "var(--bg)", padding: "12px 0" }}>
        <button className="primary" onClick={save} disabled={saving}
          style={{ fontSize: 14, padding: "10px 22px", background: "var(--accent)", color: "var(--accent-ink)", borderColor: "var(--accent)", opacity: saving ? 0.6 : 1 }}>
          {saving ? "بيتحفظ…" : "حفظ"}
        </button>
        {dirty && !msg && <span style={{ fontSize: 13, color: "var(--faint)" }}>فيه تعديلات مش متحفوظة</span>}
        {msg && <span style={{ fontSize: 13, color: msg.kind === "ok" ? "var(--ok)" : "var(--danger)" }}>{msg.text}</span>}
      </div>
    </div>
  );
}

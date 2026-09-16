import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { getGeoSettings } from "@/lib/seo/geo-store";
import SeoSettingsClient from "./SeoSettingsClient";

export const dynamic = "force-dynamic";

/** Dashboard control for the site's GEO/SEO settings (schema, offices, FAQ, llms.txt). */
export default async function SeoSettingsPage() {
  if (!(await currentSession())) redirect("/admin/login");
  const settings = await getGeoSettings();

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <Link href="/admin/seo" style={{ fontSize: 13, color: "var(--muted)" }}>← السيو والفهرسة</Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>إعدادات SEO / GEO</h1>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--faint)", margin: "0 0 20px", lineHeight: 1.7 }}>
        بتتحكّم في البيانات المنظّمة (Schema) اللي جوجل ومحركات الذكاء الاصطناعي بتقراها: هوية الشركة، المكاتب وإحداثياتها، الأسئلة الشائعة، ملف llms.txt، والسماح لزواحف الـAI.
      </p>
      <SeoSettingsClient initial={settings} />
    </div>
  );
}

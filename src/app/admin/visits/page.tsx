import { redirect } from "next/navigation";
import Link from "next/link";
import { currentSession } from "@/lib/admin-session";
import { visitStats, getRecentVisits } from "@/lib/db/repo";

export const dynamic = "force-dynamic";

const PERIODS = [{ d: 7, l: "٧ أيام" }, { d: 30, l: "٣٠ يوم" }, { d: 90, l: "٩٠ يوم" }];

function Bars({ rows, label }: { rows: { name: string; n: number }[]; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{label}</div>
      {rows.length === 0 ? (
        <p style={{ color: "var(--faint)", fontSize: 13, margin: 0 }}>لا يوجد بيانات بعد.</p>
      ) : (
        <div style={{ display: "grid", gap: 9 }}>
          {rows.map((r) => (
            <div key={r.name} style={{ display: "grid", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                <span dir="auto" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                <span style={{ color: "var(--muted)", fontFamily: "ui-monospace, monospace", flexShrink: 0 }}>{r.n}</span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: "var(--bg-2)", overflow: "hidden" }}>
                <div style={{ width: `${(r.n / max) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function VisitsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { days: daysParam } = await searchParams;
  const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30;

  const stats = await visitStats(days);
  const recent = await getRecentVisits(60);
  const fmt = (d: Date) => new Date(d).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });

  const cards = [
    { label: "مشاهدات الصفحات", value: stats.totals?.views ?? 0 },
    { label: "زيارات (جلسات)", value: stats.totals?.sessions ?? 0 },
    { label: "النهارده", value: stats.totals?.today ?? 0 },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "22px 24px 56px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, flex: 1 }}>الزيارات</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODS.map((p) => (
            <Link key={p.d} href={`/admin/visits?days=${p.d}`}
              style={{ fontSize: 13, padding: "6px 12px", borderRadius: 8,
                border: `1px solid ${days === p.d ? "var(--accent)" : "var(--line)"}`,
                background: days === p.d ? "var(--accent)" : "var(--panel)",
                color: days === p.d ? "var(--accent-ink)" : "var(--ink)" }}>{p.l}</Link>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 18, marginTop: 14 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "ui-monospace, monospace" }}>{c.value}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 18 }}>
        <Bars label="أكثر الصفحات زيارة" rows={stats.topPages.map((r) => ({ name: r.path, n: r.n }))} />
        <Bars label="المصدر" rows={stats.sources.map((r) => ({ name: r.source, n: r.n }))} />
        <Bars label="الحملات (UTM)" rows={stats.campaigns.map((r) => ({ name: r.campaign, n: r.n }))} />
        <Bars label="الدول" rows={stats.countries.map((r) => ({ name: r.country, n: r.n }))} />
      </div>

      <div className="card" style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>آخر الزيارات</div>
        {recent.length === 0 ? (
          <p style={{ color: "var(--faint)", fontSize: 13, margin: 0 }}>
            لسه مفيش زيارات مسجّلة. هتظهر هنا بعد ما الموقع يُنشر ويزوره ناس.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "var(--faint)", textAlign: "start" }}>
                  {["الوقت", "الصفحة", "المصدر", "الدولة", "الجهاز"].map((h) => (
                    <th key={h} style={{ textAlign: "start", padding: "6px 8px", fontWeight: 500, borderBottom: "1px solid var(--line)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((v) => (
                  <tr key={v.id}>
                    <td style={{ padding: "6px 8px", color: "var(--muted)", whiteSpace: "nowrap" }}>{fmt(v.created_at)}</td>
                    <td dir="ltr" style={{ padding: "6px 8px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.path}</td>
                    <td style={{ padding: "6px 8px", color: "var(--muted)" }}>{v.utm_source || v.utm_campaign || "مباشر"}</td>
                    <td style={{ padding: "6px 8px" }}>{v.country || "—"}</td>
                    <td style={{ padding: "6px 8px", color: "var(--muted)" }}>{v.device === "mobile" ? "موبايل" : "كمبيوتر"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

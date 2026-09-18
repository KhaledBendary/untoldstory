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

/** Daily views as a bar trend. Labels thin out so they stay readable at 30/90 days. */
function Trend({ rows }: { rows: { day: string; n: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  const total = rows.reduce((a, r) => a + r.n, 0);
  const step = rows.length > 45 ? 7 : rows.length > 14 ? 3 : 1;
  return (
    <div className="card" style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>الاتجاه بمرور الوقت (مشاهدات/يوم)</span>
        <span style={{ fontSize: 12, color: "var(--faint)" }}>{total} مشاهدة</span>
      </div>
      {total === 0 ? (
        <p style={{ color: "var(--faint)", fontSize: 13, margin: 0 }}>لا يوجد بيانات بعد.</p>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120 }}>
          {rows.map((r, i) => (
            <div key={r.day} title={`${r.day}: ${r.n}`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 4, minWidth: 0 }}>
              <div style={{ width: "100%", height: `${(r.n / max) * 100}%`, minHeight: r.n > 0 ? 2 : 0, background: "var(--accent)", borderRadius: 3 }} />
              <span style={{ fontSize: 9, color: "var(--faint)", whiteSpace: "nowrap", height: 10 }}>
                {i % step === 0 ? r.day.slice(5) : ""}
              </span>
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

      <div style={{ marginBottom: 18 }}>
        <Trend rows={stats.daily ?? []} />
      </div>

      {(() => {
        const d = stats.devices ?? { mobile: 0, desktop: 0, other: 0 };
        const t = d.mobile + d.desktop + d.other;
        const pct = (n: number) => (t ? Math.round((n / t) * 100) : 0);
        const seg = [
          { l: "موبايل", n: d.mobile, c: "var(--accent)" },
          { l: "كمبيوتر", n: d.desktop, c: "var(--ok)" },
          ...(d.other ? [{ l: "غير معروف", n: d.other, c: "var(--faint)" }] : []),
        ];
        return (
          <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>الأجهزة</div>
            {t === 0 ? <p style={{ color: "var(--faint)", fontSize: 13, margin: 0 }}>لا يوجد بيانات بعد.</p> : (
              <>
                <div style={{ display: "flex", height: 12, borderRadius: 8, overflow: "hidden", marginBottom: 10 }}>
                  {seg.map((s) => s.n > 0 && <div key={s.l} title={`${s.l}: ${pct(s.n)}%`} style={{ width: `${pct(s.n)}%`, background: s.c }} />)}
                </div>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 13 }}>
                  {seg.map((s) => (
                    <span key={s.l} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: s.c }} />
                      {s.l} <span style={{ color: "var(--muted)", fontFamily: "ui-monospace, monospace" }}>{pct(s.n)}%</span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })()}

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

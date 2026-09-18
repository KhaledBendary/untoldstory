import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getSingleton, putSingleton, logActivity } from "@/lib/db/repo";
import { mergeGeo, type GeoSettings } from "@/lib/seo/geo";
import { triggerDeploy } from "@/lib/deploy";

/** Read the current GEO/SEO settings (merged over defaults). */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;
  return NextResponse.json({ settings: mergeGeo(await getSingleton("seo_settings")) });
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const numOrNull = (v: unknown) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const lines = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String).map((x) => x.trim()).filter(Boolean) : [];

/** Save the GEO/SEO settings. Shaped server-side to store only known fields. */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const body = (await request.json().catch(() => null)) as Partial<GeoSettings> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const org = body.organization ?? ({} as GeoSettings["organization"]);
  const clean: GeoSettings = {
    organization: {
      name: str(org.name),
      description: str(org.description),
      slogan: str(org.slogan),
      email: str(org.email),
      knowsAbout: lines(org.knowsAbout),
      sameAs: lines(org.sameAs),
    },
    offices: Array.isArray(body.offices)
      ? body.offices.map((o, i) => ({
          id: str(o.id) || `office-${i}`,
          name: str(o.name),
          locality: str(o.locality),
          region: str(o.region),
          country: str(o.country).toUpperCase().slice(0, 2),
          phone: str(o.phone),
          lat: numOrNull(o.lat),
          lng: numOrNull(o.lng),
          days: str(o.days) || "Sun–Thu",
          opens: str(o.opens) || "09:00",
          closes: str(o.closes) || "18:00",
        }))
      : [],
    faq: Array.isArray(body.faq)
      ? body.faq
          .map((f) => ({ qEn: str(f.qEn), aEn: str(f.aEn), qAr: str(f.qAr), aAr: str(f.aAr) }))
          .filter((f) => f.qEn || f.qAr)
      : [],
    llmsIntro: str(body.llmsIntro),
    aiCrawlers: typeof body.aiCrawlers === "boolean" ? body.aiCrawlers : true,
  };

  await putSingleton("seo_settings", clean);
  await logActivity({ actor: auth.session.email, action: "update", entity: "site", ref: "seo_settings", detail: "إعدادات SEO/GEO" });
  const deploy = await triggerDeploy();
  return NextResponse.json({ ok: true, deploy });
}

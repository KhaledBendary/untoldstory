import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getService, saveService } from "@/lib/db/repo";
import { validateField, hasErrors, type Dict } from "@/lib/content-validate";

/** Save one service. Guarded, then validated — a broken value never reaches the row. */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { slug } = await params;
  if (!(await getService(slug))) {
    return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const data: Record<string, Dict> = {
    title: body.title ?? {},
    shortDesc: body.shortDesc ?? {},
    fullDesc: body.fullDesc ?? {},
  };

  const issues = [
    ...validateField("title", "العنوان", data.title, { required: true }),
    ...validateField("shortDesc", "الوصف المختصر", data.shortDesc, {}),
    ...validateField("fullDesc", "الوصف الكامل", data.fullDesc, {}),
  ];
  if (hasErrors(issues)) {
    return NextResponse.json({ error: "فيه مشاكل لازم تتصلح", issues }, { status: 422 });
  }

  await saveService(slug, {
    icon: body.icon || null,
    image_url: body.image_url || null,
    price: body.price || null,
    is_featured: Boolean(body.is_featured),
  }, data);

  return NextResponse.json({ ok: true, issues });
}

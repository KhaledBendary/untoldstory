import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { singletonDef, setPath } from "@/lib/admin/singleton-fields";
import { getSingleton, saveSingletonPaths } from "@/lib/db/repo";
import { validateField, hasErrors } from "@/lib/content-validate";

/** Save selected fields of a singleton page (home / layout / about). */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const auth = await requireAdmin();
  if (!auth.session) return auth.response;

  const { key } = await params;
  const def = singletonDef(key);
  if (!def) return NextResponse.json({ error: "صفحة غير معروفة" }, { status: 404 });
  if (!(await getSingleton(key))) return NextResponse.json({ error: "غير موجودة" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const incoming = body?.fields as Record<string, { en?: string; ar?: string }> | undefined;
  if (!incoming) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  // Only paths this page actually declares — nothing the client invents.
  const known = new Map(def.groups.flatMap((g) => g.fields.map((f) => [f.path, f])));
  const edits: { path: string; en: string; ar: string }[] = [];
  const issues = [];
  for (const [path, val] of Object.entries(incoming)) {
    const field = known.get(path);
    if (!field) continue;
    const dict = { en: val.en ?? "", ar: val.ar ?? "" };
    issues.push(...validateField(path, field.label, dict, {}));
    edits.push({ path, en: dict.en, ar: dict.ar });
  }
  if (hasErrors(issues)) {
    return NextResponse.json({ error: "فيه مشاكل لازم تتصلح", issues }, { status: 422 });
  }

  await saveSingletonPaths(key, edits, setPath);
  return NextResponse.json({ ok: true, issues });
}

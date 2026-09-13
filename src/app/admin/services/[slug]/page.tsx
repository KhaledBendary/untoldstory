import { redirect, notFound } from "next/navigation";
import { currentSession } from "@/lib/admin-session";
import { getService } from "@/lib/db/repo";
import ServiceEditor from "./ServiceEditor";

export const dynamic = "force-dynamic";

export default async function EditService({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await currentSession())) redirect("/admin/login");
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <ServiceEditor
      slug={service.slug}
      initial={{
        icon: service.icon ?? "",
        image_url: service.image_url ?? "",
        price: service.price ?? "",
        is_featured: service.is_featured,
        title: service.data.title ?? {},
        shortDesc: service.data.shortDesc ?? {},
        fullDesc: service.data.fullDesc ?? {},
      }}
    />
  );
}

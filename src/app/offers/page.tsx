import { requireAuth } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OffersRedirectPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    redirect("/admin/offers");
  } else if (user.role === "PLACEMENT_TEAM") {
    redirect("/placement-team/offers");
  } else {
    redirect("/manager/offers");
  }
}

import { requireAuth } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CompaniesRedirectPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    redirect("/admin/companies");
  } else if (user.role === "PLACEMENT_TEAM") {
    redirect("/placement-team/companies");
  } else {
    redirect("/manager/companies");
  }
}

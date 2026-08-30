import { requireAuth } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DrivesRedirectPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    redirect("/admin/drives");
  } else if (user.role === "PLACEMENT_TEAM") {
    redirect("/placement-team/drives");
  } else {
    redirect("/manager/drives");
  }
}

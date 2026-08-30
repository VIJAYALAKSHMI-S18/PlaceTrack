import { requireAuth } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentsRedirectPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") {
    redirect("/admin/students");
  } else if (user.role === "PLACEMENT_TEAM") {
    redirect("/placement-team/students");
  } else {
    redirect("/manager/students");
  }
}

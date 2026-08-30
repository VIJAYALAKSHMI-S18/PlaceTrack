import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "MANAGER") {
    redirect("/manager/dashboard");
  } else {
    redirect("/placement-team/dashboard");
  }
}

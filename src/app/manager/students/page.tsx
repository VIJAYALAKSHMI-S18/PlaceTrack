import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { StudentTable } from "@/components/students/StudentTable";

export const dynamic = "force-dynamic";

export default async function ManagerStudentsPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);

  return (
    <DashboardShell role="MANAGER" user={user}>
      <StudentTable role="MANAGER" />
    </DashboardShell>
  );
}

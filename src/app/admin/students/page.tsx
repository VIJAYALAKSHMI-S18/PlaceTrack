import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { StudentTable } from "@/components/students/StudentTable";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const user = await requireRole(["ADMIN"]);

  return (
    <DashboardShell role="ADMIN" user={user}>
      <StudentTable role="ADMIN" />
    </DashboardShell>
  );
}

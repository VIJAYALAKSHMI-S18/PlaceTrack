import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { StudentTable } from "@/components/students/StudentTable";

export const dynamic = "force-dynamic";

export default async function PlacementTeamStudentsPage() {
  const user = await requireRole(["PLACEMENT_TEAM", "ADMIN"]);

  return (
    <DashboardShell role="PLACEMENT_TEAM" user={user}>
      <StudentTable role="PLACEMENT_TEAM" />
    </DashboardShell>
  );
}

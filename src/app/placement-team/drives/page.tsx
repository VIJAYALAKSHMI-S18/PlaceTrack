import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { DriveTable } from "@/components/drives/DriveTable";

export const dynamic = "force-dynamic";

export default async function PlacementTeamDrivesPage() {
  const user = await requireRole(["PLACEMENT_TEAM", "ADMIN"]);

  return (
    <DashboardShell role="PLACEMENT_TEAM" user={user}>
      <DriveTable role="PLACEMENT_TEAM" />
    </DashboardShell>
  );
}

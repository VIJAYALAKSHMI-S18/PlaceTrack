import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { DriveTable } from "@/components/drives/DriveTable";

export const dynamic = "force-dynamic";

export default async function ManagerDrivesPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);

  return (
    <DashboardShell role="MANAGER" user={user}>
      <DriveTable role="MANAGER" />
    </DashboardShell>
  );
}

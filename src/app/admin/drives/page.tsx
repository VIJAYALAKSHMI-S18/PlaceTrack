import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { DriveTable } from "@/components/drives/DriveTable";

export const dynamic = "force-dynamic";

export default async function AdminDrivesPage() {
  const user = await requireRole(["ADMIN"]);

  return (
    <DashboardShell role="ADMIN" user={user}>
      <DriveTable role="ADMIN" />
    </DashboardShell>
  );
}

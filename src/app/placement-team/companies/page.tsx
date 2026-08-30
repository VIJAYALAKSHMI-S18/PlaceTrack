import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { CompanyTable } from "@/components/companies/CompanyTable";

export const dynamic = "force-dynamic";

export default async function PlacementTeamCompaniesPage() {
  const user = await requireRole(["PLACEMENT_TEAM", "ADMIN"]);

  return (
    <DashboardShell role="PLACEMENT_TEAM" user={user}>
      <CompanyTable role="PLACEMENT_TEAM" />
    </DashboardShell>
  );
}

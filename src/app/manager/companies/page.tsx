import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { CompanyTable } from "@/components/companies/CompanyTable";

export const dynamic = "force-dynamic";

export default async function ManagerCompaniesPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);

  return (
    <DashboardShell role="MANAGER" user={user}>
      <CompanyTable role="MANAGER" />
    </DashboardShell>
  );
}

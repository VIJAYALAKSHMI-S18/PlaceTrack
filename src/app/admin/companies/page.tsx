import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { CompanyTable } from "@/components/companies/CompanyTable";

export const dynamic = "force-dynamic";

export default async function AdminCompaniesPage() {
  const user = await requireRole(["ADMIN"]);

  return (
    <DashboardShell role="ADMIN" user={user}>
      <CompanyTable role="ADMIN" />
    </DashboardShell>
  );
}

import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { CompanyApprovalQueue } from "@/components/companies/CompanyApprovalQueue";

export const dynamic = "force-dynamic";

export default async function AdminCompanyApprovalsPage() {
  const user = await requireRole(["ADMIN"]);

  return (
    <DashboardShell role="ADMIN" user={user}>
      <CompanyApprovalQueue />
    </DashboardShell>
  );
}

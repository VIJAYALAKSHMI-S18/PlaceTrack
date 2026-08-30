import { requireRole } from "@/lib/rbac";
import { getManagerDashboardStats } from "@/services/dashboard.service";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, Building2, Briefcase, Award, TrendingUp, PlusCircle } from "lucide-react";
import { DepartmentPlacementChart, PackageDistributionChart } from "@/components/analytics/PlacementCharts";
import { InteractiveMetricCards } from "@/components/dashboard/InteractiveMetricCards";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);
  const stats = await getManagerDashboardStats();
  const ov = stats.overview;

  return (
    <DashboardShell role="MANAGER" user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Manager Intelligence Dashboard
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Welcome, {user.name}. Institutional placement metrics and analytics overview.
            </p>
          </div>
          <Link href="/manager/submit-company">
            <Button size="sm">
              <PlusCircle className="h-4 w-4" /> Submit Company for Approval
            </Button>
          </Link>
        </div>

        {/* Summary Metric Cards with Click Popups */}
        <InteractiveMetricCards
          stats={{
            totalStudents: ov.totalStudents,
            placementPercentage: ov.placementPercentage,
            approvedCompanies: ov.approvedCompanies,
            pendingCompanies: ov.pendingCompanies,
            completedDrives: ov.completedDrives,
            upcomingDrives: ov.upcomingDrives,
            totalOffers: ov.totalOffers,
            averagePackage: ov.averagePackage,
          }}
          studentsList={stats.studentsList || []}
          companiesList={stats.companiesList || []}
          drivesList={stats.drivesList || []}
          offersList={stats.offersList || []}
          role="MANAGER"
        />

        {/* Recharts Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DepartmentPlacementChart data={stats.departmentPlacementStats} />
          <PackageDistributionChart data={stats.packageDistribution} />
        </div>
      </div>
    </DashboardShell>
  );
}

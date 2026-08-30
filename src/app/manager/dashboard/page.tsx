import { requireRole } from "@/lib/rbac";
import { getManagerDashboardStats } from "@/services/dashboard.service";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, Building2, Briefcase, Award, TrendingUp, PlusCircle } from "lucide-react";
import { formatLPA } from "@/lib/utils";
import { DepartmentPlacementChart, PackageDistributionChart } from "@/components/analytics/PlacementCharts";
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

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Total Students</span>
              <Users className="h-4 w-4 text-[#818CF8]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#F8FAFC]">{ov.totalStudents}</div>
            <div className="text-[10px] text-[#10B981] mt-1">{ov.placementPercentage}% Placed</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Active Companies</span>
              <Building2 className="h-4 w-4 text-[#3B82F6]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#3B82F6]">{ov.approvedCompanies}</div>
            <div className="text-[10px] text-[#F59E0B] mt-1">{ov.pendingCompanies} in queue</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Completed Drives</span>
              <Briefcase className="h-4 w-4 text-[#EC4899]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#EC4899]">{ov.completedDrives}</div>
            <div className="text-[10px] text-[#94A3B8] mt-1">{ov.upcomingDrives} Upcoming</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Total Offers</span>
              <Award className="h-4 w-4 text-[#10B981]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#10B981]">{ov.totalOffers}</div>
            <div className="text-[10px] text-[#94A3B8] mt-1">Avg: {formatLPA(ov.averagePackage)}</div>
          </Card>
        </div>

        {/* Recharts Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DepartmentPlacementChart data={stats.departmentPlacementStats} />
          <PackageDistributionChart data={stats.packageDistribution} />
        </div>
      </div>
    </DashboardShell>
  );
}

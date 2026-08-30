import { requireRole } from "@/lib/rbac";
import { getAdminDashboardStats } from "@/services/dashboard.service";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Users,
  Building2,
  Briefcase,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { formatLPA, formatDate } from "@/lib/utils";
import {
  DepartmentPlacementChart,
  PackageDistributionChart,
  CompanyOffersChart,
} from "@/components/analytics/PlacementCharts";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireRole(["ADMIN"]);
  const stats = await getAdminDashboardStats();
  const ov = stats.overview;

  return (
    <DashboardShell role="ADMIN" user={user}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Executive Placement Overview
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Welcome back, {user.name}. Here is the complete placement operational intelligence.
            </p>
          </div>
          <Badge variant="primary" size="md">
            Placement Cycle 2025–2026
          </Badge>
        </div>

        {/* 12 Key Metric Summary Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card className="p-4 bg-[#111827]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Total Students</span>
              <Users className="h-4 w-4 text-[#818CF8]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#F8FAFC]">{ov.totalStudents}</div>
            <div className="text-[10px] text-[#10B981] mt-1">{ov.placedStudents} Placed ({ov.placementPercentage}%)</div>
          </Card>

          <Card className="p-4 bg-[#111827]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Placement %</span>
              <TrendingUp className="h-4 w-4 text-[#10B981]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#10B981]">{ov.placementPercentage}%</div>
            <div className="text-[10px] text-[#94A3B8] mt-1">{ov.notPlacedStudents} Unplaced</div>
          </Card>

          <Card className="p-4 bg-[#111827]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Highest Package</span>
              <Award className="h-4 w-4 text-[#F59E0B]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#F59E0B]">{formatLPA(ov.highestPackage)}</div>
            <div className="text-[10px] text-[#94A3B8] mt-1">Avg: {formatLPA(ov.averagePackage)}</div>
          </Card>

          <Card className="p-4 bg-[#111827]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Total Offers</span>
              <Award className="h-4 w-4 text-[#818CF8]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#818CF8]">{ov.totalOffers}</div>
            <div className="text-[10px] text-[#64748B] mt-1">Across all drives</div>
          </Card>

          <Card className="p-4 bg-[#111827]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Companies</span>
              <Building2 className="h-4 w-4 text-[#3B82F6]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#3B82F6]">{ov.approvedCompanies}</div>
            <div className="text-[10px] text-[#F59E0B] mt-1">
              <Link href="/admin/company-approvals" className="hover:underline">
                {ov.pendingCompanies} Pending Approval
              </Link>
            </div>
          </Card>

          <Card className="p-4 bg-[#111827]">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Drives</span>
              <Briefcase className="h-4 w-4 text-[#EC4899]" />
            </div>
            <div className="mt-2 text-xl font-bold text-[#EC4899]">
              {ov.completedDrives + ov.upcomingDrives + ov.ongoingDrives}
            </div>
            <div className="text-[10px] text-[#94A3B8] mt-1">
              {ov.completedDrives} Done • {ov.upcomingDrives} Next
            </div>
          </Card>
        </div>

        {/* Recharts Visualizations Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DepartmentPlacementChart data={stats.departmentPlacementStats} />
          <PackageDistributionChart data={stats.packageDistribution} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Company Offers Chart */}
          <div className="lg:col-span-2">
            <CompanyOffersChart data={stats.companyOfferStats} />
          </div>

          {/* Pending Approval Widget */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Approval Queue</CardTitle>
                <CardDescription>Company submissions awaiting review</CardDescription>
              </div>
              <Link href="/admin/company-approvals" className="text-xs text-[#818CF8] hover:underline">
                View All
              </Link>
            </CardHeader>
            <div className="space-y-3">
              {stats.recentSubmissions.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#64748B]">
                  No pending company approval requests.
                </p>
              ) : (
                stats.recentSubmissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#F8FAFC]">
                        {sub.company?.company_name}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        By {sub.submittedBy?.name} ({sub.submittedBy?.role})
                      </div>
                    </div>
                    <Link
                      href="/admin/company-approvals"
                      className="rounded bg-[#6366F1]/20 px-2 py-1 text-[10px] font-bold text-[#818CF8] hover:bg-[#6366F1]/30"
                    >
                      Review
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

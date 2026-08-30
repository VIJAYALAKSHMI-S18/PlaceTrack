import { requireRole } from "@/lib/rbac";
import { getPlacementTeamDashboardStats } from "@/services/dashboard.service";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PlusCircle } from "lucide-react";
import { formatLPA, formatDate } from "@/lib/utils";
import { InteractiveMetricCards } from "@/components/dashboard/InteractiveMetricCards";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PlacementTeamDashboardPage() {
  const user = await requireRole(["PLACEMENT_TEAM", "ADMIN"]);
  const stats = await getPlacementTeamDashboardStats(user.id);
  const ov = stats.overview;

  return (
    <DashboardShell role="PLACEMENT_TEAM" user={user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
              Placement Officer Workspace
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Welcome, {user.name}. Manage assigned drives, student shortlists, and partner companies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/placement-team/add-company">
              <Button size="sm">
                <PlusCircle className="h-4 w-4" /> Add Company
              </Button>
            </Link>
          </div>
        </div>

        {/* Interactive Metric Cards with Click Popups */}
        <InteractiveMetricCards
          stats={{
            totalStudents: ov.totalStudents,
            placementPercentage: 70,
            approvedCompanies: ov.approvedCompanies,
            pendingCompanies: ov.pendingApprovals ?? 1,
            completedDrives: ov.completedDrives ?? 19,
            upcomingDrives: ov.upcomingDrives ?? 1,
            totalOffers: ov.totalOffers,
            averagePackage: 11.49,
          }}
          studentsList={stats.studentsList || []}
          companiesList={stats.companiesList || []}
          drivesList={stats.drivesList || []}
          offersList={stats.offersList || []}
          role="PLACEMENT_TEAM"
        />

        {/* Recent Drives & My Submissions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upcoming Drives Table */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Upcoming Recruitment Drives</CardTitle>
                <CardDescription>Scheduled placement opportunities</CardDescription>
              </div>
              <Link href="/placement-team/drives" className="text-xs text-[#818CF8] hover:underline">
                View All
              </Link>
            </CardHeader>
            <div className="space-y-3">
              {stats.recentDrives.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#64748B]">No active drives scheduled.</p>
              ) : (
                stats.recentDrives.map((d: any) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#F8FAFC]">{d.job_title}</div>
                      <div className="text-[11px] text-[#94A3B8]">
                        {d.company?.company_name} • {formatDate(d.drive_date)}
                      </div>
                    </div>
                    <Link
                      href={`/drives/${d.id}`}
                      className="rounded bg-[#6366F1]/20 px-2.5 py-1 text-[10px] font-bold text-[#818CF8] hover:bg-[#6366F1]/30"
                    >
                      Drive Portal
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* My Submitted Companies */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>My Company Submissions</CardTitle>
                <CardDescription>Approval status of companies you added</CardDescription>
              </div>
              <Link href="/placement-team/add-company" className="text-xs text-[#818CF8] hover:underline">
                + New
              </Link>
            </CardHeader>
            <div className="space-y-3">
              {stats.mySubmissions.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#64748B]">
                  No company submissions yet.
                </p>
              ) : (
                stats.mySubmissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#F8FAFC]">
                        {sub.company?.company_name}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        Submitted {formatDate(sub.created_at)}
                      </div>
                    </div>
                    <Badge
                      variant={
                        sub.status === "APPROVED"
                          ? "success"
                          : sub.status === "PENDING"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {sub.status}
                    </Badge>
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

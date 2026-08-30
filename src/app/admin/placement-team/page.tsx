import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { parseJsonSafe } from "@/lib/utils";
import { UserCheck, Mail, Phone, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPlacementTeamPage() {
  const user = await requireRole(["ADMIN"]);

  const teamMembers = await prisma.user.findMany({
    where: { role: "PLACEMENT_TEAM", deletedAt: null },
    include: {
      placementTeamProfile: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardShell role="ADMIN" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Placement Team Members
          </h1>
          <p className="text-xs font-medium text-[#94A3B8]">
            PLACEMENT OFFICERS, COORDINATORS & DEPARTMENT ASSIGNMENTS
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => {
            const depts = parseJsonSafe<string[]>(
              member.placementTeamProfile?.assigned_departments,
              []
            );
            return (
              <Card key={member.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6366F1]/20 text-[#818CF8]">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC]">{member.name}</h3>
                      <p className="text-[11px] text-[#818CF8]">
                        {member.placementTeamProfile?.designation || "Placement Officer"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>

                <div className="space-y-2 text-xs text-[#94A3B8] border-t border-[#1E293B] pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#64748B]" />
                    <span>{member.phone || "Not specified"}</span>
                  </div>
                </div>

                <div className="border-t border-[#1E293B] pt-3">
                  <div className="mb-1.5 text-[10px] font-semibold uppercase text-[#64748B]">
                    Assigned Departments
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {depts.map((d) => (
                      <span
                        key={d}
                        className="rounded bg-[#1E293B] px-2 py-0.5 text-xs font-bold text-[#94A3B8]"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}

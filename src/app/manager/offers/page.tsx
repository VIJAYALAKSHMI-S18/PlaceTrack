import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { formatLPA, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Building2, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ManagerOffersPage() {
  const user = await requireRole(["MANAGER", "ADMIN"]);

  const offers = await prisma.offer.findMany({
    include: {
      student: true,
      company: true,
      drive: true,
    },
    orderBy: { offer_date: "desc" },
  });

  return (
    <DashboardShell role="MANAGER" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Offers Tracking (Manager View)
          </h1>
          <p className="text-xs font-medium text-[#94A3B8]">
            INSTITUTIONAL PLACEMENT SELECTION & PACKAGE RECORDS
          </p>
        </div>

        <div className="table-container">
          <table className="w-full text-left text-xs">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3.5">STUDENT</th>
                <th className="px-4 py-3.5">REG. NUMBER</th>
                <th className="px-4 py-3.5">COMPANY</th>
                <th className="px-4 py-3.5">JOB ROLE</th>
                <th className="px-4 py-3.5">PACKAGE (CTC)</th>
                <th className="px-4 py-3.5">OFFER DATE</th>
                <th className="px-4 py-3.5">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                    No offers recorded yet.
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="table-row">
                    <td className="px-4 py-3.5 font-semibold text-[#F8FAFC]">
                      <Link
                        href={`/students/${offer.student_id}`}
                        className="hover:text-[#818CF8]"
                      >
                        {offer.student?.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#818CF8]">
                      {offer.student?.register_number}
                    </td>
                    <td className="px-4 py-3.5 text-[#F8FAFC]">
                      <Link
                        href={`/companies/${offer.company_id}`}
                        className="flex items-center gap-1.5 hover:text-[#818CF8]"
                      >
                        <Building2 className="h-3.5 w-3.5 text-[#64748B]" />
                        {offer.company?.company_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-[#94A3B8]">{offer.job_role}</td>
                    <td className="px-4 py-3.5 font-bold text-[#10B981]">
                      {formatLPA(offer.ctc_lpa)}
                    </td>
                    <td className="px-4 py-3.5 text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                        {formatDate(offer.offer_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          offer.offer_status === "ACCEPTED" || offer.offer_status === "JOINED"
                            ? "success"
                            : offer.offer_status === "OFFERED"
                            ? "info"
                            : "danger"
                        }
                      >
                        {offer.offer_status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

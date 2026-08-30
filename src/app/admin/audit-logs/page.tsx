import { requireRole } from "@/lib/rbac";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { ShieldAlert, User, Clock, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const user = await requireRole(["ADMIN"]);

  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  return (
    <DashboardShell role="ADMIN" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            System Audit Trail & Security Logs
          </h1>
          <p className="text-xs font-medium text-[#94A3B8]">
            IMMUTABLE ENTERPRISE RECORD OF ALL ADMINISTRATIVE, APPROVAL & RECRUITMENT ACTIONS
          </p>
        </div>

        <div className="table-container">
          <table className="w-full text-left text-xs">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3.5">TIMESTAMP</th>
                <th className="px-4 py-3.5">ACTOR (USER)</th>
                <th className="px-4 py-3.5">ROLE</th>
                <th className="px-4 py-3.5">ACTION</th>
                <th className="px-4 py-3.5">TARGET ENTITY</th>
                <th className="px-4 py-3.5">MODIFICATIONS / DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#94A3B8]">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="table-row">
                    <td className="px-4 py-3.5 text-[#94A3B8] whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                        {formatDateTime(log.timestamp)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#F8FAFC]">
                      {log.user_email || "System"}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          log.role === "ADMIN"
                            ? "danger"
                            : log.role === "MANAGER"
                            ? "warning"
                            : "info"
                        }
                        size="sm"
                      >
                        {log.role || "SYSTEM"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#818CF8]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5 text-[#94A3B8]">
                      <span className="rounded bg-[#1E293B] px-1.5 py-0.5 text-[11px] font-semibold text-[#F8FAFC]">
                        {log.entity}
                      </span>
                      {log.entity_id && (
                        <span className="ml-1 text-[10px] text-[#64748B]">
                          ({log.entity_id.substring(0, 8)}...)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-[#94A3B8] font-mono text-[11px]">
                      {log.new_value || log.old_value || "—"}
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

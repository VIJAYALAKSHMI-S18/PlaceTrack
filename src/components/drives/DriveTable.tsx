"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Briefcase,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Award,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Role } from "@/types";
import { formatLPA, formatDate, parseJsonSafe } from "@/lib/utils";
import { DriveFormModal } from "./DriveFormModal";
import { ExportButtons } from "@/components/common/ExportButtons";
import { exportTableToExcel, exportTableToPdf } from "@/lib/export-utils";

interface DriveTableProps {
  role: Role;
}

export const DriveTable: React.FC<DriveTableProps> = ({ role }) => {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [driveStatus, setDriveStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const isAdmin = role === "ADMIN";
  const canCreate = role === "ADMIN" || role === "PLACEMENT_TEAM";

  const handleExportExcel = async () => {
    const res = await fetch("/api/drives?limit=500");
    const json = await res.json();
    const list = json.data || [];
    const headers = [
      "Company",
      "Job Title",
      "CTC (LPA)",
      "Drive Date",
      "Location",
      "Drive Type",
      "Min UG %",
      "Min ATS",
      "Status",
    ];
    const rows = list.map((d: any) => [
      d.company?.company_name,
      d.job_title,
      d.ctc_lpa,
      formatDate(d.drive_date),
      d.drive_location || "Campus / Virtual",
      d.drive_type,
      d.minimum_ug_percentage || 60,
      d.minimum_ats_score || 70,
      d.company?.status === "PENDING_APPROVAL" ? "APPROVAL PENDING" : d.drive_status,
    ]);
    exportTableToExcel("RGU_Placement_Drives_Schedule", "Drives", headers, rows);
  };

  const handleExportPdf = async () => {
    const res = await fetch("/api/drives?limit=500");
    const json = await res.json();
    const list = json.data || [];
    const headers = ["Company", "Job Title", "CTC", "Drive Date", "Location", "Status"];
    const rows = list.map((d: any) => [
      d.company?.company_name,
      d.job_title,
      `${d.ctc_lpa} LPA`,
      formatDate(d.drive_date),
      d.drive_location || "Campus",
      d.company?.status === "PENDING_APPROVAL" ? "APPROVAL PENDING" : d.drive_status,
    ]);
    exportTableToPdf({
      title: "RGU Campus Recruitment Drives Master Schedule",
      subtitle: `Corporate Campus Recruitment Schedule (${list.length} Drives Tracked)`,
      filename: "RGU_Placement_Drives_Schedule",
      headers,
      data: rows,
    });
  };

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search.trim()) params.append("search", search.trim());
      if (driveStatus !== "ALL") params.append("driveStatus", driveStatus);

      const res = await fetch(`/api/drives?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setDrives(json.data || []);
        setTotalPages(json.meta?.totalPages || 1);
        setTotalCount(json.meta?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDrives();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, driveStatus, page]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete / archive placement drive '${title}'?`)) return;
    try {
      const res = await fetch(`/api/drives/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDrives();
      } else {
        const json = await res.json();
        alert(json.message || "Failed to delete placement drive.");
      }
    } catch {
      alert("Error occurred while deleting placement drive.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Placement Drives
          </h1>
          <p className="text-xs font-medium text-slate-600">
            JOB OPPORTUNITIES, ELIGIBILITY & RECRUITMENT SCHEDULE
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportButtons onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
          {canCreate && (
            <Button size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Schedule New Drive
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search Role, Company, Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-[#64748B] focus:border-[#0284C7] focus:outline-none"
            />
          </div>

          <select
            value={driveStatus}
            onChange={(e) => {
              setDriveStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
          >
            <option value="ALL">All Drive Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Main Table */}
      <div className="table-container">
        <table className="w-full text-left text-xs">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3.5">COMPANY</th>
              <th className="px-4 py-3.5">ROLE & PACKAGE</th>
              <th className="px-4 py-3.5">DRIVE DATE</th>
              <th className="px-4 py-3.5">LOCATION & TYPE</th>
              <th className="px-4 py-3.5">ELIGIBILITY CRITERIA</th>
              <th className="px-4 py-3.5">STATUS</th>
              <th className="px-4 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-600">
                  Loading placement drives...
                </td>
              </tr>
            ) : drives.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-600">
                  No placement drives found.
                </td>
              </tr>
            ) : (
              drives.map((drive) => {
                const depts = parseJsonSafe<string[]>(drive.eligible_departments, []);
                return (
                  <tr key={drive.id} className="table-row">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      <Link
                        href={`/drives/${drive.id}`}
                        className="hover:text-[#0284C7]"
                      >
                        {drive.company?.company_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{drive.job_title}</div>
                      <div className="text-[11px] font-bold text-[#10B981]">
                        {formatLPA(drive.ctc_lpa)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#64748B]" />
                        {formatDate(drive.drive_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{drive.drive_location || "Campus / Virtual"}</div>
                      <span className="text-[10px] text-[#0284C7] font-medium">
                        {drive.drive_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {depts.slice(0, 3).map((d) => (
                          <span
                            key={d}
                            className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-600"
                          >
                            {d}
                          </span>
                        ))}
                        {depts.length > 3 && (
                          <span className="text-[10px] text-[#64748B]">
                            +{depts.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#64748B] mt-0.5">
                        Min UG: {drive.minimum_ug_percentage || 60}% • Min ATS: {drive.minimum_ats_score}%
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {drive.company?.status === "PENDING_APPROVAL" ? (
                        <Badge variant="warning" className="text-[10px] font-bold">
                          APPROVAL PENDING
                        </Badge>
                      ) : (
                        <Badge
                          variant={
                            drive.drive_status === "COMPLETED"
                              ? "success"
                              : drive.drive_status === "ONGOING"
                              ? "warning"
                              : drive.drive_status === "UPCOMING"
                              ? "info"
                              : "danger"
                          }
                        >
                          {drive.drive_status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <Link
                        href={`/drives/${drive.id}`}
                        className="inline-flex items-center rounded p-1.5 text-slate-600 hover:bg-blue-50/50 hover:text-slate-900"
                        title="View Drive Portal"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(drive.id, drive.job_title)}
                          className="inline-flex items-center rounded p-1.5 text-slate-600 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                          title="Delete Drive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
          <span>
            Showing {drives.length} of {totalCount} placement drives
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <span className="font-semibold text-slate-900">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {isAddOpen && (
        <DriveFormModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            fetchDrives();
          }}
        />
      )}
    </div>
  );
};

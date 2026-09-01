"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Building2, Calendar, Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatLPA, formatDate } from "@/lib/utils";
import { ExportButtons } from "@/components/common/ExportButtons";
import { exportTableToExcel, exportTableToPdf } from "@/lib/export-utils";

interface OffersTrackerClientProps {
  initialOffers: any[];
  title?: string;
}

export const OffersTrackerClient: React.FC<OffersTrackerClientProps> = ({
  initialOffers,
  title = "Offers Tracking",
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOffers = initialOffers.filter((o) => {
    const s = o.student;
    const c = o.company;
    const matchSearch =
      !search.trim() ||
      s?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s?.register_number?.toLowerCase().includes(search.toLowerCase()) ||
      c?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.job_role?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || o.offer_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportExcel = () => {
    const headers = [
      "Student Name",
      "Register Number",
      "Department",
      "Company",
      "Job Role",
      "CTC (LPA)",
      "Offer Date",
      "Status",
    ];
    const rows = filteredOffers.map((o) => [
      o.student?.name,
      o.student?.register_number,
      o.student?.department || "N/A",
      o.company?.company_name,
      o.job_role,
      o.ctc_lpa,
      formatDate(o.offer_date),
      o.offer_status,
    ]);
    exportTableToExcel("RGU_Placement_Offers_Tracking", "Offers", headers, rows);
  };

  const handleExportPdf = () => {
    const headers = ["Student", "Reg. No", "Company", "Job Role", "CTC", "Offer Date", "Status"];
    const rows = filteredOffers.map((o) => [
      o.student?.name,
      o.student?.register_number,
      o.company?.company_name,
      o.job_role,
      `${o.ctc_lpa} LPA`,
      formatDate(o.offer_date),
      o.offer_status,
    ]);
    exportTableToPdf({
      title: "RGU Placement Offers & Selections Report",
      subtitle: `Verified Offers Extended (${filteredOffers.length} Selections)`,
      filename: "RGU_Placement_Offers_Tracking",
      headers,
      data: rows,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-xs font-medium text-slate-600">
            JOB SELECTIONS, OFFERS & PACKAGE DETAILS ({filteredOffers.length} OFFERS)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportButtons onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
        </div>
      </div>

      {/* Filter & Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search Student, Register No, Company, Job Role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-[#64748B] focus:border-[#0284C7] focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0284C7] focus:outline-none"
          >
            <option value="ALL">All Offer Statuses</option>
            <option value="OFFERED">Offered</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="JOINED">Joined</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Table */}
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
            {filteredOffers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-600">
                  No matching offers found.
                </td>
              </tr>
            ) : (
              filteredOffers.map((offer) => (
                <tr key={offer.id} className="table-row">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    <Link href={`/students/${offer.student_id}`} className="hover:text-[#0284C7]">
                      {offer.student?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#0284C7]">
                    {offer.student?.register_number}
                  </td>
                  <td className="px-4 py-3.5 text-slate-900">
                    <Link
                      href={`/companies/${offer.company_id}`}
                      className="flex items-center gap-1.5 hover:text-[#0284C7]"
                    >
                      <Building2 className="h-3.5 w-3.5 text-[#64748B]" />
                      {offer.company?.company_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{offer.job_role}</td>
                  <td className="px-4 py-3.5 font-bold text-[#10B981]">
                    {formatLPA(offer.ctc_lpa)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
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
  );
};

"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileSpreadsheet, FileText, Download, Users, Building2, Briefcase } from "lucide-react";

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (reportType: string, format: "xlsx" | "csv") => {
    const key = `${reportType}_${format}`;
    setDownloading(key);
    try {
      const url = `/api/reports/${reportType}?format=${format}`;
      window.open(url, "_blank");
    } catch {
      alert("Failed to export report.");
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <DashboardShell role="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Placement Reports Generator
          </h1>
          <p className="text-xs font-medium text-[#94A3B8]">
            EXPORT OFFICIAL PLACEMENT DATA IN EXCEL (.XLSX) AND CSV FORMATS
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Student Report */}
          <Card className="flex flex-col justify-between space-y-4 p-6">
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/20 text-[#818CF8]">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Students Master Report</CardTitle>
              <CardDescription>
                Complete academic percentages (SSLC, HSC, UG, PG), CGPA, backlogs, placement status, and received offers.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#1E293B]">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleExport("students", "xlsx")}
                isLoading={downloading === "students_xlsx"}
              >
                <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleExport("students", "csv")}
                isLoading={downloading === "students_csv"}
              >
                CSV
              </Button>
            </div>
          </Card>

          {/* Company Report */}
          <Card className="flex flex-col justify-between space-y-4 p-6">
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6]/20 text-[#3B82F6]">
                <Building2 className="h-6 w-6" />
              </div>
              <CardTitle>Companies Directory Report</CardTitle>
              <CardDescription>
                Partner recruitment organizations, contact persons, industries, approval statuses, and total drives conducted.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#1E293B]">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleExport("companies", "xlsx")}
                isLoading={downloading === "companies_xlsx"}
              >
                <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleExport("companies", "csv")}
                isLoading={downloading === "companies_csv"}
              >
                CSV
              </Button>
            </div>
          </Card>

          {/* Placement Report */}
          <Card className="flex flex-col justify-between space-y-4 p-6">
            <div className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/20 text-[#10B981]">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle>Recruitment Drives & CTC Report</CardTitle>
              <CardDescription>
                Drive schedules, candidates participated, offers rolled out, and detailed Highest / Average / Lowest CTC statistics.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#1E293B]">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleExport("placements", "xlsx")}
                isLoading={downloading === "placements_xlsx"}
              >
                <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleExport("placements", "csv")}
                isLoading={downloading === "placements_csv"}
              >
                CSV
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

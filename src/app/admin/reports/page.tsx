"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Users,
  Building2,
  Briefcase,
  Award,
  Filter,
  Search,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { exportTableToExcel, exportTableToPdf } from "@/lib/export-utils";
import { formatDate, formatLPA } from "@/lib/utils";

type ReportTab = "STUDENTS" | "COMPANIES" | "DRIVES" | "OFFERS";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("STUDENTS");
  const [downloading, setDownloading] = useState<string | null>(null);

  // Raw fetched data caches
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [allDrives, setAllDrives] = useState<any[]>([]);
  const [allOffers, setAllOffers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Student Filters
  const [studentDept, setStudentDept] = useState("ALL");
  const [studentStatus, setStudentStatus] = useState("ALL");
  const [studentMinUg, setStudentMinUg] = useState("ALL");
  const [studentBacklogs, setStudentBacklogs] = useState("ALL");
  const [studentType, setStudentType] = useState("ALL");
  const [studentSearch, setStudentSearch] = useState("");

  // Company Filters
  const [companyStatus, setCompanyStatus] = useState("ALL");
  const [companyIndustry, setCompanyIndustry] = useState("ALL");
  const [companySearch, setCompanySearch] = useState("");

  // Drive Filters
  const [driveStatus, setDriveStatus] = useState("ALL");
  const [driveDept, setDriveDept] = useState("ALL");
  const [driveMinCtc, setDriveMinCtc] = useState("ALL");
  const [driveSearch, setDriveSearch] = useState("");

  // Offer Filters
  const [offerStatus, setOfferStatus] = useState("ALL");
  const [offerTier, setOfferTier] = useState("ALL");
  const [offerCompany, setOfferCompany] = useState("ALL");
  const [offerSearch, setOfferSearch] = useState("");

  // Fetch initial datasets
  useEffect(() => {
    const loadAll = async () => {
      setLoadingData(true);
      try {
        const [stRes, coRes, drRes, ofRes] = await Promise.all([
          fetch("/api/students?limit=500"),
          fetch("/api/companies?limit=500"),
          fetch("/api/drives?limit=500"),
          fetch("/api/offers?limit=500"),
        ]);
        if (stRes.ok) setAllStudents((await stRes.json()).data || []);
        if (coRes.ok) setAllCompanies((await coRes.json()).data || []);
        if (drRes.ok) setAllDrives((await drRes.json()).data || []);
        if (ofRes.ok) setAllOffers((await ofRes.json()).data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    };
    loadAll();
  }, []);

  // Filtered Students Calculation
  const filteredStudents = allStudents.filter((s) => {
    const matchSearch =
      !studentSearch.trim() ||
      s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(studentSearch.toLowerCase());
    const matchDept = studentDept === "ALL" || s.department === studentDept;
    const matchStatus = studentStatus === "ALL" || s.placement_status === studentStatus;
    const matchType = studentType === "ALL" || s.student_type === studentType;
    const matchBacklogs = studentBacklogs === "ALL" || (studentBacklogs === "ZERO" ? s.backlogs === 0 : s.backlogs > 0);
    const matchUg =
      studentMinUg === "ALL" ||
      (studentMinUg === "60" && s.ug_percentage >= 60) ||
      (studentMinUg === "70" && s.ug_percentage >= 70) ||
      (studentMinUg === "80" && s.ug_percentage >= 80) ||
      (studentMinUg === "90" && s.ug_percentage >= 90);

    return matchSearch && matchDept && matchStatus && matchType && matchBacklogs && matchUg;
  });

  // Filtered Companies Calculation
  const filteredCompanies = allCompanies.filter((c) => {
    const matchSearch =
      !companySearch.trim() ||
      c.company_name?.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.industry?.toLowerCase().includes(companySearch.toLowerCase());
    const matchStatus = companyStatus === "ALL" || c.status === companyStatus;
    const matchIndustry = companyIndustry === "ALL" || c.industry === companyIndustry;
    return matchSearch && matchStatus && matchIndustry;
  });

  // Filtered Drives Calculation
  const filteredDrives = allDrives.filter((d) => {
    const matchSearch =
      !driveSearch.trim() ||
      d.company?.company_name?.toLowerCase().includes(driveSearch.toLowerCase()) ||
      d.job_title?.toLowerCase().includes(driveSearch.toLowerCase());
    const matchStatus =
      driveStatus === "ALL" ||
      (driveStatus === "PENDING" ? d.company?.status === "PENDING_APPROVAL" : d.drive_status === driveStatus);
    const matchMinCtc =
      driveMinCtc === "ALL" ||
      (driveMinCtc === "5" && d.ctc_lpa >= 5) ||
      (driveMinCtc === "10" && d.ctc_lpa >= 10) ||
      (driveMinCtc === "15" && d.ctc_lpa >= 15);

    let matchDept = true;
    if (driveDept !== "ALL") {
      try {
        const depts = JSON.parse(d.eligible_departments || "[]");
        matchDept = depts.includes(driveDept);
      } catch {
        matchDept = true;
      }
    }

    return matchSearch && matchStatus && matchMinCtc && matchDept;
  });

  // Filtered Offers Calculation
  const filteredOffers = allOffers.filter((o) => {
    const matchSearch =
      !offerSearch.trim() ||
      o.student?.name?.toLowerCase().includes(offerSearch.toLowerCase()) ||
      o.student?.register_number?.toLowerCase().includes(offerSearch.toLowerCase()) ||
      o.company?.company_name?.toLowerCase().includes(offerSearch.toLowerCase()) ||
      o.job_role?.toLowerCase().includes(offerSearch.toLowerCase());
    const matchStatus = offerStatus === "ALL" || o.offer_status === offerStatus;
    const matchCompany = offerCompany === "ALL" || o.company?.company_name === offerCompany;
    const matchTier =
      offerTier === "ALL" ||
      (offerTier === "SUPER_DREAM" && o.ctc_lpa >= 10) ||
      (offerTier === "DREAM" && o.ctc_lpa >= 6 && o.ctc_lpa < 10) ||
      (offerTier === "CORE" && o.ctc_lpa < 6);

    return matchSearch && matchStatus && matchCompany && matchTier;
  });

  // Export Filtered Students Handler
  const handleDownloadStudents = (format: "xlsx" | "pdf") => {
    const filterDesc = [
      studentDept !== "ALL" ? studentDept : "",
      studentStatus !== "ALL" ? studentStatus : "",
      studentMinUg !== "ALL" ? `UG_${studentMinUg}Plus` : "",
    ]
      .filter(Boolean)
      .join("_");

    const fileTag = filterDesc ? `Filtered_${filterDesc}` : "All_Candidates";

    if (format === "xlsx") {
      const headers = [
        "Reg Number",
        "Student Name",
        "Department",
        "UG Aggregate %",
        "CGPA",
        "10th %",
        "12th %",
        "Backlogs",
        "Student Type",
        "Placement Status",
        "Email",
        "Phone",
      ];
      const rows = filteredStudents.map((s) => [
        s.register_number,
        s.name,
        s.department,
        s.ug_percentage,
        s.cgpa || "N/A",
        s.sslc_percentage || "N/A",
        s.hsc_percentage || "N/A",
        s.backlogs || 0,
        s.student_type,
        s.placement_status,
        s.email,
        s.phone_number || "N/A",
      ]);
      exportTableToExcel(`RGU_Students_${fileTag}`, "Filtered Students", headers, rows);
    } else {
      const headers = ["Reg Number", "Student Name", "Department", "UG %", "CGPA", "Backlogs", "Status"];
      const rows = filteredStudents.map((s) => [
        s.register_number,
        s.name,
        s.department,
        `${s.ug_percentage}%`,
        s.cgpa || "-",
        s.backlogs || 0,
        s.placement_status.replace("_", " "),
      ]);
      exportTableToPdf({
        title: "RGU Filtered Student Academic & Placement Report",
        subtitle: `Criteria: Dept (${studentDept}) | Status (${studentStatus}) | Min UG (${studentMinUg}%) | Total: ${filteredStudents.length}`,
        filename: `RGU_Students_${fileTag}`,
        headers,
        data: rows,
      });
    }
  };

  // Export Filtered Companies Handler
  const handleDownloadCompanies = (format: "xlsx" | "pdf") => {
    const fileTag = companyStatus !== "ALL" ? `_${companyStatus}` : "";
    if (format === "xlsx") {
      const headers = ["Company Name", "Industry", "Location", "Approval Status", "Contact Person", "Email", "Phone", "Website"];
      const rows = filteredCompanies.map((c) => [
        c.company_name,
        c.industry || "Technology",
        c.location || "Campus",
        c.status,
        c.contact_person || "HR Team",
        c.contact_email || "hr@company.com",
        c.contact_phone || "N/A",
        c.website || "N/A",
      ]);
      exportTableToExcel(`RGU_Companies${fileTag}`, "Companies", headers, rows);
    } else {
      const headers = ["Company Name", "Industry", "Location", "Status", "Contact Person", "Email"];
      const rows = filteredCompanies.map((c) => [
        c.company_name,
        c.industry || "Technology",
        c.location || "Campus",
        c.status,
        c.contact_person || "HR Team",
        c.contact_email || "careers@company.com",
      ]);
      exportTableToPdf({
        title: "RGU Filtered Corporate Partners Directory",
        subtitle: `Filter Status: ${companyStatus} | Matching Partners: ${filteredCompanies.length}`,
        filename: `RGU_Companies${fileTag}`,
        headers,
        data: rows,
      });
    }
  };

  // Export Filtered Drives Handler
  const handleDownloadDrives = (format: "xlsx" | "pdf") => {
    const fileTag = driveStatus !== "ALL" ? `_${driveStatus}` : "";
    if (format === "xlsx") {
      const headers = ["Company", "Job Title", "CTC (LPA)", "Drive Date", "Location", "Drive Type", "Min UG %", "Status"];
      const rows = filteredDrives.map((d) => [
        d.company?.company_name,
        d.job_title,
        d.ctc_lpa,
        formatDate(d.drive_date),
        d.drive_location || "Campus",
        d.drive_type,
        d.minimum_ug_percentage || 60,
        d.company?.status === "PENDING_APPROVAL" ? "APPROVAL PENDING" : d.drive_status,
      ]);
      exportTableToExcel(`RGU_Recruitment_Drives${fileTag}`, "Drives", headers, rows);
    } else {
      const headers = ["Company", "Job Title", "CTC", "Drive Date", "Location", "Status"];
      const rows = filteredDrives.map((d) => [
        d.company?.company_name,
        d.job_title,
        `${d.ctc_lpa} LPA`,
        formatDate(d.drive_date),
        d.drive_location || "Campus",
        d.company?.status === "PENDING_APPROVAL" ? "APPROVAL PENDING" : d.drive_status,
      ]);
      exportTableToPdf({
        title: "RGU Filtered Campus Recruitment Drives Schedule",
        subtitle: `Status: ${driveStatus} | Min CTC: ${driveMinCtc} LPA | Total: ${filteredDrives.length}`,
        filename: `RGU_Recruitment_Drives${fileTag}`,
        headers,
        data: rows,
      });
    }
  };

  // Export Filtered Offers Handler
  const handleDownloadOffers = (format: "xlsx" | "pdf") => {
    const fileTag = offerStatus !== "ALL" ? `_${offerStatus}` : "";
    if (format === "xlsx") {
      const headers = ["Student Name", "Register Number", "Department", "Company", "Job Role", "CTC (LPA)", "Offer Date", "Status"];
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
      exportTableToExcel(`RGU_Offers_Tracking${fileTag}`, "Offers", headers, rows);
    } else {
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
        title: "RGU Filtered Placement Offers & Package Selections",
        subtitle: `Offer Status: ${offerStatus} | Tier: ${offerTier} | Total: ${filteredOffers.length} Offers`,
        filename: `RGU_Offers_Tracking${fileTag}`,
        headers,
        data: rows,
      });
    }
  };

  return (
    <DashboardShell role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Placement Reports & Custom Filtered Export Hub
          </h1>
          <p className="text-xs font-medium text-[#94A3B8]">
            FILTER BY DEPARTMENT, STATUS, CTC TIER & DOWNLOAD TAILORED EXCEL (.XLSX) AND PDF (.PDF) REPORTS
          </p>
        </div>

        {/* 4 Report Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab("STUDENTS")}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
              activeTab === "STUDENTS"
                ? "border-purple-500/60 bg-gradient-to-r from-purple-500/20 to-purple-500/5 text-white shadow-lg shadow-purple-950/20"
                : "border-white/10 bg-[#111827] text-[#94A3B8] hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Students Roster</span>
              <span className="text-[11px] text-purple-400 font-semibold">
                {allStudents.length} Candidates
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("COMPANIES")}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
              activeTab === "COMPANIES"
                ? "border-blue-500/60 bg-gradient-to-r from-blue-500/20 to-blue-500/5 text-white shadow-lg shadow-blue-950/20"
                : "border-white/10 bg-[#111827] text-[#94A3B8] hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Corporate Partners</span>
              <span className="text-[11px] text-blue-400 font-semibold">
                {allCompanies.length} Companies
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("DRIVES")}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
              activeTab === "DRIVES"
                ? "border-pink-500/60 bg-gradient-to-r from-pink-500/20 to-pink-500/5 text-white shadow-lg shadow-pink-950/20"
                : "border-white/10 bg-[#111827] text-[#94A3B8] hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Recruitment Drives</span>
              <span className="text-[11px] text-pink-400 font-semibold">
                {allDrives.length} Drives
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("OFFERS")}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
              activeTab === "OFFERS"
                ? "border-emerald-500/60 bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-white shadow-lg shadow-emerald-950/20"
                : "border-white/10 bg-[#111827] text-[#94A3B8] hover:border-white/20 hover:text-white"
            }`}
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Offers & Packages</span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {allOffers.length} Offers
              </span>
            </div>
          </button>
        </div>

        {/* TAB 1: STUDENTS FILTER & DOWNLOAD */}
        {activeTab === "STUDENTS" && (
          <div className="space-y-6">
            <Card className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Configure Student Filter Criteria</span>
                </div>

                {/* Filtered Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadStudents("xlsx")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 shadow-md"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Download Filtered Excel ({filteredStudents.length})
                  </button>

                  <button
                    onClick={() => handleDownloadStudents("pdf")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 shadow-md"
                  >
                    <FileText className="h-4 w-4" /> Download Filtered PDF ({filteredStudents.length})
                  </button>
                </div>
              </div>

              {/* 5 Filter Selectors */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Department</label>
                  <select
                    value={studentDept}
                    onChange={(e) => setStudentDept(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Computer Science and Engineering">Computer Science and Engineering (CSE)</option>
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Artificial Intelligence and Data Science">AI & Data Science (AIDS)</option>
                    <option value="Electronics and Communication">Electronics & Communication (ECE)</option>
                    <option value="Cyber Security">Cyber Security (CY)</option>
                    <option value="Business Administration">Business Administration (BBA)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Placement Status</label>
                  <select
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ALL">All Placement Statuses</option>
                    <option value="PLACED">Placed Candidates (70)</option>
                    <option value="NOT_PLACED">Unplaced Candidates (30)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Minimum Academic % (UG)</label>
                  <select
                    value={studentMinUg}
                    onChange={(e) => setStudentMinUg(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ALL">All Percentage Ranges</option>
                    <option value="60">60% & Above (Standard Cutoff)</option>
                    <option value="70">70% & Above (First Class Distinction)</option>
                    <option value="80">80% & Above (High Achievers)</option>
                    <option value="90">90% & Above (Top Tier)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Standing Backlogs</label>
                  <select
                    value={studentBacklogs}
                    onChange={(e) => setStudentBacklogs(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ALL">All Backlog Statuses</option>
                    <option value="ZERO">0 Backlogs (100% Eligible)</option>
                    <option value="HAS_BACKLOGS">Has Standing Backlogs</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Student Type</label>
                  <select
                    value={studentType}
                    onChange={(e) => setStudentType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="ALL">All Student Types</option>
                    <option value="Day Scholar">Day Scholar</option>
                    <option value="Hosteller">Hosteller</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Search Candidate</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search Name or Reg No..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Live Filter Results Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#94A3B8]">
                  LIVE FILTER PREVIEW ({filteredStudents.length} MATCHING CANDIDATES)
                </span>
                <span className="text-[11px] text-purple-400 font-medium">
                  Showing top 5 matching records
                </span>
              </div>

              <div className="table-container">
                <table className="w-full text-left text-xs">
                  <thead className="table-header">
                    <tr>
                      <th className="px-4 py-3">STUDENT</th>
                      <th className="px-4 py-3">REG. NUMBER</th>
                      <th className="px-4 py-3">DEPARTMENT</th>
                      <th className="px-4 py-3">UG %</th>
                      <th className="px-4 py-3">CGPA</th>
                      <th className="px-4 py-3">BACKLOGS</th>
                      <th className="px-4 py-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                          No candidates match the selected filter combination.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.slice(0, 5).map((s) => (
                        <tr key={s.id} className="table-row">
                          <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                          <td className="px-4 py-3 font-mono text-[#818CF8]">{s.register_number}</td>
                          <td className="px-4 py-3 text-[#94A3B8]">{s.department}</td>
                          <td className="px-4 py-3 font-bold text-white">{s.ug_percentage}%</td>
                          <td className="px-4 py-3 text-[#94A3B8]">{s.cgpa || "—"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-bold ${
                                s.backlogs === 0 ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {s.backlogs}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={s.placement_status === "PLACED" ? "success" : "neutral"}>
                              {s.placement_status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANIES FILTER & DOWNLOAD */}
        {activeTab === "COMPANIES" && (
          <div className="space-y-6">
            <Card className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Configure Corporate Partner Filters</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadCompanies("xlsx")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 shadow-md"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Download Filtered Excel ({filteredCompanies.length})
                  </button>

                  <button
                    onClick={() => handleDownloadCompanies("pdf")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 shadow-md"
                  >
                    <FileText className="h-4 w-4" /> Download Filtered PDF ({filteredCompanies.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Approval Status</label>
                  <select
                    value={companyStatus}
                    onChange={(e) => setCompanyStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="APPROVED">Approved Partners (19)</option>
                    <option value="PENDING_APPROVAL">Pending Approval Queue (2)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Industry Sector</label>
                  <select
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL">All Industries</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Product & Cloud">Product & Cloud</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Banking & Financial Services">Banking & Financial Services</option>
                    <option value="Hardware & Embedded Systems">Hardware & Embedded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Search Company</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search Company Name..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="table-container">
              <table className="w-full text-left text-xs">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3">COMPANY NAME</th>
                    <th className="px-4 py-3">INDUSTRY</th>
                    <th className="px-4 py-3">LOCATION</th>
                    <th className="px-4 py-3">HR CONTACT</th>
                    <th className="px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCompanies.slice(0, 5).map((c) => (
                    <tr key={c.id} className="table-row">
                      <td className="px-4 py-3 font-semibold text-white">{c.company_name}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{c.industry || "Technology"}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{c.location || "Campus / Virtual"}</td>
                      <td className="px-4 py-3 text-white">{c.contact_person || "HR Team"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.status === "APPROVED" ? "success" : "warning"}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DRIVES FILTER & DOWNLOAD */}
        {activeTab === "DRIVES" && (
          <div className="space-y-6">
            <Card className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Configure Recruitment Drive Filters</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadDrives("xlsx")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 shadow-md"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Download Filtered Excel ({filteredDrives.length})
                  </button>

                  <button
                    onClick={() => handleDownloadDrives("pdf")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 shadow-md"
                  >
                    <FileText className="h-4 w-4" /> Download Filtered PDF ({filteredDrives.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Drive Status</label>
                  <select
                    value={driveStatus}
                    onChange={(e) => setDriveStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    <option value="ALL">All Drive Statuses</option>
                    <option value="COMPLETED">Completed Drives (19)</option>
                    <option value="UPCOMING">Upcoming Drives</option>
                    <option value="PENDING">Pending Company Approval</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Minimum CTC Range</label>
                  <select
                    value={driveMinCtc}
                    onChange={(e) => setDriveMinCtc(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    <option value="ALL">All CTC Packages</option>
                    <option value="5">5+ LPA</option>
                    <option value="10">10+ LPA (Super Dream)</option>
                    <option value="15">15+ LPA (Top Marquee)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Search Drive / Company</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search Company, Role..."
                      value={driveSearch}
                      onChange={(e) => setDriveSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="table-container">
              <table className="w-full text-left text-xs">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3">COMPANY</th>
                    <th className="px-4 py-3">JOB ROLE</th>
                    <th className="px-4 py-3">PACKAGE (CTC)</th>
                    <th className="px-4 py-3">DRIVE DATE</th>
                    <th className="px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDrives.slice(0, 5).map((d) => (
                    <tr key={d.id} className="table-row">
                      <td className="px-4 py-3 font-semibold text-white">{d.company?.company_name}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{d.job_title}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{formatLPA(d.ctc_lpa)}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{formatDate(d.drive_date)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            d.company?.status === "PENDING_APPROVAL"
                              ? "warning"
                              : d.drive_status === "COMPLETED"
                              ? "success"
                              : "info"
                          }
                        >
                          {d.company?.status === "PENDING_APPROVAL" ? "APPROVAL PENDING" : d.drive_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: OFFERS FILTER & DOWNLOAD */}
        {activeTab === "OFFERS" && (
          <div className="space-y-6">
            <Card className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Configure Placement Offers & CTC Filters</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadOffers("xlsx")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 shadow-md"
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Download Filtered Excel ({filteredOffers.length})
                  </button>

                  <button
                    onClick={() => handleDownloadOffers("pdf")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 shadow-md"
                  >
                    <FileText className="h-4 w-4" /> Download Filtered PDF ({filteredOffers.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Package Tier</label>
                  <select
                    value={offerTier}
                    onChange={(e) => setOfferTier(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ALL">All Packages</option>
                    <option value="SUPER_DREAM">Super Dream (&gt;= 10.00 LPA)</option>
                    <option value="DREAM">Dream (6.00 - 9.99 LPA)</option>
                    <option value="CORE">Standard / Core (&lt; 6.00 LPA)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Onboarding Status</label>
                  <select
                    value={offerStatus}
                    onChange={(e) => setOfferStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="JOINED">Joined & Onboarded</option>
                    <option value="OFFERED">Offer Letter Released</option>
                    <option value="ACCEPTED">Accepted Offer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#94A3B8]">Search Candidate / Company</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search Name, Reg No, Company..."
                      value={offerSearch}
                      onChange={(e) => setOfferSearch(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="table-container">
              <table className="w-full text-left text-xs">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3">STUDENT</th>
                    <th className="px-4 py-3">REG. NUMBER</th>
                    <th className="px-4 py-3">COMPANY</th>
                    <th className="px-4 py-3">JOB ROLE</th>
                    <th className="px-4 py-3">PACKAGE (CTC)</th>
                    <th className="px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOffers.slice(0, 5).map((o) => (
                    <tr key={o.id} className="table-row">
                      <td className="px-4 py-3 font-semibold text-white">{o.student?.name}</td>
                      <td className="px-4 py-3 font-mono text-[#818CF8]">{o.student?.register_number}</td>
                      <td className="px-4 py-3 text-white">{o.company?.company_name}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{o.job_role}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{formatLPA(o.ctc_lpa)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={o.offer_status === "JOINED" ? "success" : "info"}>
                          {o.offer_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

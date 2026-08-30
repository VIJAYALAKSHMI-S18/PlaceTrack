"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  FileText,
  Globe,
  Sparkles,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { formatLPA, formatDate, parseJsonSafe } from "@/lib/utils";
import { AtsEvaluationViewer } from "@/components/drives/AtsEvaluationViewer";
import { ExportButtons } from "@/components/common/ExportButtons";
import { exportTableToExcel, exportTableToPdf } from "@/lib/export-utils";

export default function DrivePortalPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const driveId = params?.driveId as string;
  const initialTab = searchParams?.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState<
    "overview" | "jd" | "eligibility" | "ats" | "placed" | "statistics"
  >(initialTab as any);

  const [drive, setDrive] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // ATS Search & Filter
  const [atsSearch, setAtsSearch] = useState("");
  const [atsEligibilityFilter, setAtsEligibilityFilter] = useState("ALL");
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [evaluatingBulk, setEvaluatingBulk] = useState(false);

  const fetchDriveDetails = async () => {
    setLoading(true);
    try {
      const [driveRes, statsRes] = await Promise.all([
        fetch(`/api/drives/${driveId}`),
        fetch(`/api/drives/${driveId}/stats`),
      ]);

      if (driveRes.ok) {
        const dJson = await driveRes.json();
        setDrive(dJson.data);
      }
      if (statsRes.ok) {
        const sJson = await statsRes.json();
        setStats(sJson.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driveId) {
      fetchDriveDetails();
    }
  }, [driveId]);

  const handleBulkEvaluate = async () => {
    setEvaluatingBulk(true);
    try {
      const res = await fetch(`/api/drives/${driveId}/evaluate`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        alert(`Successfully evaluated ${json.data?.totalEvaluated} candidates.`);
        fetchDriveDetails();
      } else {
        alert(json.message || "Failed to run evaluation.");
      }
    } catch {
      alert("Error occurred during ATS evaluation.");
    } finally {
      setEvaluatingBulk(false);
    }
  };

  const handleExportAtsExcel = () => {
    if (!drive) return;
    const headers = [
      "Student Name",
      "Register Number",
      "Department",
      "UG %",
      "CGPA",
      "ATS Score",
      "Skill Match",
      "Eligibility Status",
      "Evaluated At",
    ];
    const rows = filteredEvaluations.map((ev) => [
      ev.student?.name,
      ev.student?.register_number,
      ev.student?.department,
      ev.student?.ug_percentage,
      ev.student?.cgpa || "N/A",
      ev.ats_score,
      ev.skill_match_score,
      ev.eligibility_status,
      formatDate(ev.evaluated_at),
    ]);
    exportTableToExcel(
      `${drive.company?.company_name || "Drive"}_ATS_Evaluation_Roster`,
      "ATS Candidates",
      headers,
      rows
    );
  };

  const handleExportAtsPdf = () => {
    if (!drive) return;
    const headers = ["Candidate", "Reg No", "Department", "UG %", "ATS Score", "Eligibility"];
    const rows = filteredEvaluations.map((ev) => [
      ev.student?.name,
      ev.student?.register_number,
      ev.student?.department,
      `${ev.student?.ug_percentage}%`,
      `${ev.ats_score}/100`,
      ev.eligibility_status?.replace("_", " "),
    ]);
    exportTableToPdf({
      title: `${drive.company?.company_name} — Candidate ATS Shortlist`,
      subtitle: `Role: ${drive.job_title} | CTC: ${drive.ctc_lpa} LPA | Total Evaluated: ${filteredEvaluations.length}`,
      filename: `${drive.company?.company_name || "Drive"}_ATS_Evaluation_Roster`,
      headers,
      data: rows,
    });
  };

  if (loading && !drive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] text-xs text-[#818CF8]">
        Loading placement drive portal...
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F19] p-6 text-center space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
          <Briefcase className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-[#F8FAFC]">Placement Drive Record Not Found</h2>
        <p className="text-xs text-[#94A3B8] max-w-md">
          This recruitment drive link might be from a previous session or the database was refreshed.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link href="/manager/drives">
            <Button size="sm" className="text-xs">
              Browse Active Drives
            </Button>
          </Link>
          <Button onClick={() => router.back()} variant="outline" size="sm" className="text-xs">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const eligibleDepts = parseJsonSafe<string[]>(drive.eligible_departments, []);
  const reqSkills = parseJsonSafe<string[]>(drive.required_skills, []);
  const prefSkills = parseJsonSafe<string[]>(drive.preferred_skills, []);

  // Filtered candidate evaluations
  const evaluations: any[] = drive.evaluations || [];
  const filteredEvaluations = evaluations.filter((ev) => {
    const s = ev.student;
    if (!s) return false;
    const matchSearch =
      !atsSearch.trim() ||
      s.name.toLowerCase().includes(atsSearch.toLowerCase()) ||
      s.register_number.toLowerCase().includes(atsSearch.toLowerCase()) ||
      s.department.toLowerCase().includes(atsSearch.toLowerCase());

    const matchEligibility =
      atsEligibilityFilter === "ALL" || ev.eligibility_status === atsEligibilityFilter;

    return matchSearch && matchEligibility;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC]">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-30 border-b border-[#1E293B] bg-[#111827]/95 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-2 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-[#F8FAFC]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-[#F8FAFC]">
                  {drive.company?.company_name} — {drive.job_title}
                </h1>
                {drive.company?.status === "PENDING_APPROVAL" ? (
                  <Badge variant="warning" size="md">
                    APPROVAL PENDING
                  </Badge>
                ) : (
                  <Badge
                    variant={
                      drive.drive_status === "COMPLETED"
                        ? "success"
                        : drive.drive_status === "ONGOING"
                        ? "warning"
                        : "info"
                    }
                    size="md"
                  >
                    {drive.drive_status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#94A3B8]">
                {formatLPA(drive.ctc_lpa)} • {drive.drive_location || "Campus / Virtual"} • Date: {formatDate(drive.drive_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {drive.jd_pdf_url && (
              <a href={drive.jd_pdf_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <FileText className="h-3.5 w-3.5" /> View JD PDF
                </Button>
              </a>
            )}
            {drive.official_careers_url && (
              <a href={drive.official_careers_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs text-[#818CF8]">
                  <Globe className="h-3.5 w-3.5" /> Official Careers
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto mt-4 flex max-w-7xl space-x-1 border-b border-[#1E293B]">
          {[
            { id: "overview", label: "Overview" },
            { id: "jd", label: "Job Description (JD)" },
            { id: "eligibility", label: "Eligibility Criteria" },
            { id: "ats", label: `ATS Candidate Matching (${evaluations.length})` },
            { id: "placed", label: `Placed Students (${drive.offers?.length || 0})` },
            { id: "statistics", label: "Drive Statistics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab.id
                  ? "border-[#6366F1] text-[#818CF8]"
                  : "border-transparent text-[#94A3B8] hover:text-[#F8FAFC]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl p-6 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="space-y-4 lg:col-span-2">
              <CardHeader>
                <CardTitle>Recruitment Opportunity Summary</CardTitle>
              </CardHeader>
              <p className="text-xs leading-relaxed text-[#94A3B8]">
                {drive.job_description_summary ||
                  "No summarized description provided. Refer to the official Job Description tab for skills, eligibility, and recruitment parameters."}
              </p>

              <div className="grid grid-cols-2 gap-4 border-t border-[#1E293B] pt-4 text-xs">
                <div>
                  <span className="text-[#64748B]">Recruiting Organization</span>
                  <p className="font-semibold text-[#F8FAFC]">{drive.company?.company_name}</p>
                </div>
                <div>
                  <span className="text-[#64748B]">Offered CTC Package</span>
                  <p className="text-base font-extrabold text-[#10B981]">{formatLPA(drive.ctc_lpa)}</p>
                </div>
                <div>
                  <span className="text-[#64748B]">Drive Format</span>
                  <p className="font-semibold text-[#F8FAFC]">{drive.drive_type.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-[#64748B]">Drive Date</span>
                  <p className="font-semibold text-[#F8FAFC]">{formatDate(drive.drive_date)}</p>
                </div>
              </div>
            </Card>

            {/* Quick Metrics */}
            <Card className="space-y-4">
              <CardHeader>
                <CardTitle>Drive Status & Progress</CardTitle>
              </CardHeader>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-[#1E293B] pb-2">
                  <span className="text-[#94A3B8]">Candidates Evaluated</span>
                  <span className="font-bold text-[#818CF8]">{evaluations.length}</span>
                </div>
                <div className="flex justify-between border-b border-[#1E293B] pb-2">
                  <span className="text-[#94A3B8]">Eligible Candidates</span>
                  <span className="font-bold text-[#10B981]">
                    {evaluations.filter((e) => e.eligibility_status === "ELIGIBLE").length}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#1E293B] pb-2">
                  <span className="text-[#94A3B8]">Offers Extended</span>
                  <span className="font-bold text-[#EC4899]">{drive.offers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Min ATS Threshold</span>
                  <span className="font-bold text-[#F8FAFC]">{drive.minimum_ats_score} / 100</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleBulkEvaluate}
                  isLoading={evaluatingBulk}
                  className="w-full text-xs"
                >
                  <Sparkles className="h-4 w-4" /> Run Eligibility & ATS Check
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: JD */}
        {activeTab === "jd" && (
          <div className="space-y-6">
            <Card className="space-y-6 p-6">
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">{drive.job_title}</h3>
                <p className="text-xs text-[#818CF8] mt-0.5">Role: {drive.job_role || drive.job_title}</p>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                  Job Description Summary
                </h4>
                <p className="text-xs leading-relaxed text-[#F8FAFC]">
                  {drive.job_description_summary || "Please refer to the attached official PDF document."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#10B981]">
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {reqSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-[#10B981]/15 px-2.5 py-1 text-xs font-semibold text-[#10B981]"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#818CF8]">
                    Preferred Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {prefSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-[#6366F1]/15 px-2.5 py-1 text-xs font-semibold text-[#818CF8]"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-[#1E293B] pt-4">
                {drive.jd_pdf_url && (
                  <a href={drive.jd_pdf_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" /> Open Official JD PDF Document
                    </Button>
                  </a>
                )}
                {drive.official_careers_url && (
                  <a href={drive.official_careers_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-[#818CF8]">
                      <Globe className="h-4 w-4" /> Company Careers Link
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: ELIGIBILITY */}
        {activeTab === "eligibility" && (
          <div className="space-y-6">
            <Card className="space-y-4 p-6">
              <CardHeader>
                <CardTitle>Institutional Eligibility Policy & Rules</CardTitle>
                <CardDescription>
                  Criteria enforced across academic credentials and ATS resume matching algorithms.
                </CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
                  <span className="text-[#64748B] block mb-1">Eligible Departments</span>
                  <div className="flex flex-wrap gap-1">
                    {eligibleDepts.map((d) => (
                      <span key={d} className="rounded bg-[#1E293B] px-2 py-0.5 font-bold text-[#818CF8]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
                  <span className="text-[#64748B] block mb-1">Minimum Academic Marks</span>
                  <p className="font-bold text-[#F8FAFC]">UG Aggregate: {drive.minimum_ug_percentage || 60}%</p>
                  <p className="text-[11px] text-[#94A3B8] mt-1">Min CGPA: {drive.minimum_cgpa ?? "N/A"}</p>
                </div>

                <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
                  <span className="text-[#64748B] block mb-1">Backlogs & ATS Threshold</span>
                  <p className="font-bold text-[#F8FAFC]">Max Allowed Backlogs: {drive.maximum_backlogs}</p>
                  <p className="text-[11px] text-[#818CF8] mt-1">Min ATS Score: {drive.minimum_ats_score} / 100</p>
                </div>
              </div>

              <div className="rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/30 p-4 text-xs text-[#94A3B8]">
                <strong className="text-[#818CF8]">CRITICAL ELIGIBILITY RULE:</strong> Academic requirements are strict prerequisites. An applicant possessing a high ATS score (e.g. 95) who fails the minimum academic criteria (e.g. UG percentage or backlog limit) will strictly evaluate to <span className="font-bold text-[#EF4444]">NOT_ELIGIBLE</span>.
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: ATS CANDIDATE MATCHING */}
        {activeTab === "ats" && (
          <div className="space-y-6">
            {/* Top Filter & Bulk Evaluation Bar */}
            <Card className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder="Search Candidate Name, Reg No, Dept..."
                      value={atsSearch}
                      onChange={(e) => setAtsSearch(e.target.value)}
                      className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#6366F1] focus:outline-none"
                    />
                  </div>

                  <select
                    value={atsEligibilityFilter}
                    onChange={(e) => setAtsEligibilityFilter(e.target.value)}
                    className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
                  >
                    <option value="ALL">All Eligibility Statuses</option>
                    <option value="ELIGIBLE">Eligible Only</option>
                    <option value="CONDITIONALLY_ELIGIBLE">Conditionally Eligible</option>
                    <option value="NOT_ELIGIBLE">Not Eligible</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <ExportButtons onExportExcel={handleExportAtsExcel} onExportPdf={handleExportAtsPdf} />
                  <Button
                    size="sm"
                    onClick={handleBulkEvaluate}
                    isLoading={evaluatingBulk}
                    className="whitespace-nowrap"
                  >
                    <RefreshCw className="h-4 w-4" /> Run Eligibility Check
                  </Button>
                </div>
              </div>
            </Card>

            {/* Candidate Table */}
            <div className="table-container">
              <table className="w-full text-left text-xs">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3.5">STUDENT</th>
                    <th className="px-4 py-3.5">REG. NUMBER</th>
                    <th className="px-4 py-3.5">DEPARTMENT</th>
                    <th className="px-4 py-3.5">UG % / CGPA</th>
                    <th className="px-4 py-3.5">ATS SCORE</th>
                    <th className="px-4 py-3.5">ELIGIBILITY</th>
                    <th className="px-4 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {filteredEvaluations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                        No candidate evaluations found. Click "Run Eligibility Check" to evaluate students against this drive.
                      </td>
                    </tr>
                  ) : (
                    filteredEvaluations.map((ev) => (
                      <tr key={ev.id} className="table-row">
                        <td className="px-4 py-3.5 font-semibold text-[#F8FAFC]">
                          <Link
                            href={`/students/${ev.student_id}`}
                            className="hover:text-[#818CF8]"
                          >
                            {ev.student?.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[#818CF8]">
                          {ev.student?.register_number}
                        </td>
                        <td className="px-4 py-3.5 text-[#94A3B8]">{ev.student?.department}</td>
                        <td className="px-4 py-3.5 text-[#F8FAFC]">
                          {ev.student?.ug_percentage}% ({ev.student?.cgpa ?? "—"})
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-extrabold text-[#818CF8] text-sm">
                            {ev.ats_score}
                          </span>
                          <span className="text-[10px] text-[#64748B]"> / 100</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={
                              ev.eligibility_status === "ELIGIBLE"
                                ? "success"
                                : ev.eligibility_status === "CONDITIONALLY_ELIGIBLE"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {ev.eligibility_status?.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEvaluation(ev)}
                            className="px-2.5 py-1 text-xs"
                          >
                            View ATS Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PLACED STUDENTS */}
        {activeTab === "placed" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Selected Candidates & Offer Rollouts</CardTitle>
                  <CardDescription>Verified offers extended through this placement drive</CardDescription>
                </div>
              </CardHeader>

              {(!drive.offers || drive.offers.length === 0) ? (
                <p className="p-8 text-center text-xs text-[#64748B]">
                  No candidates marked as placed yet for this drive.
                </p>
              ) : (
                <div className="table-container">
                  <table className="w-full text-left text-xs">
                    <thead className="table-header">
                      <tr>
                        <th className="px-4 py-3">STUDENT</th>
                        <th className="px-4 py-3">REG. NUMBER</th>
                        <th className="px-4 py-3">DEPARTMENT</th>
                        <th className="px-4 py-3">ROLE</th>
                        <th className="px-4 py-3">CTC</th>
                        <th className="px-4 py-3">OFFER STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {drive.offers.map((off: any) => (
                        <tr key={off.id} className="table-row">
                          <td className="px-4 py-3 font-semibold text-[#F8FAFC]">
                            <Link href={`/students/${off.student_id}`} className="hover:text-[#818CF8]">
                              {off.student?.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-mono text-[#818CF8]">{off.student?.register_number}</td>
                          <td className="px-4 py-3 text-[#94A3B8]">{off.student?.department}</td>
                          <td className="px-4 py-3 text-[#94A3B8]">{off.job_role}</td>
                          <td className="px-4 py-3 font-bold text-[#10B981]">{formatLPA(off.ctc_lpa)}</td>
                          <td className="px-4 py-3">
                            <Badge variant="success">{off.offer_status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 6: STATISTICS */}
        {activeTab === "statistics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <Card className="p-4">
                <span className="text-[11px] text-[#94A3B8]">Participated</span>
                <div className="mt-1 text-xl font-bold text-[#F8FAFC]">
                  {stats?.studentsParticipated ?? 0}
                </div>
              </Card>

              <Card className="p-4">
                <span className="text-[11px] text-[#94A3B8]">Selected</span>
                <div className="mt-1 text-xl font-bold text-[#10B981]">
                  {stats?.studentsSelected ?? 0}
                </div>
              </Card>

              <Card className="p-4">
                <span className="text-[11px] text-[#94A3B8]">Total Offers</span>
                <div className="mt-1 text-xl font-bold text-[#818CF8]">
                  {stats?.totalOffers ?? 0}
                </div>
              </Card>

              <Card className="p-4">
                <span className="text-[11px] text-[#94A3B8]">Highest CTC</span>
                <div className="mt-1 text-xl font-bold text-[#F59E0B]">
                  {formatLPA(stats?.highestCtc)}
                </div>
              </Card>

              <Card className="p-4">
                <span className="text-[11px] text-[#94A3B8]">Average CTC</span>
                <div className="mt-1 text-xl font-bold text-[#10B981]">
                  {formatLPA(stats?.averageCtc)}
                </div>
              </Card>

              <Card className="p-4">
                <span className="text-[11px] text-[#94A3B8]">Lowest CTC</span>
                <div className="mt-1 text-xl font-bold text-[#94A3B8]">
                  {formatLPA(stats?.lowestCtc)}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* ATS Evaluation Modal */}
      {selectedEvaluation && (
        <AtsEvaluationViewer
          isOpen={!!selectedEvaluation}
          onClose={() => setSelectedEvaluation(null)}
          evaluation={selectedEvaluation}
          drive={drive}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  Calendar,
  Award,
  Layers,
  GraduationCap,
  Sparkles,
  X,
  Download,
  Building2,
  MapPin,
} from "lucide-react";
import { formatLPA } from "@/lib/utils";
import Link from "next/link";

interface CompanyJdViewerProps {
  company: {
    id: string;
    company_name: string;
    location: string;
    industry?: string | null;
    status: string;
    drives: any[];
  };
}

export function CompanyJdViewer({ company }: CompanyJdViewerProps) {
  const [selectedDriveForModal, setSelectedDriveForModal] = useState<any | null>(null);

  const drives = company.drives || [];

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              Job Descriptions & Recruitment Tracks ({drives.length})
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Official job descriptions, eligibility criteria, and attached JD files for {company.company_name}
            </p>
          </div>
          <a
            href="https://drive.google.com/drive/folders/1gRwKWhM8tWiPA4fAJOXtjqvXSux8kqdw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-500/20 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open {company.company_name} JD Folder (Google Drive)</span>
          </a>
        </div>

        {drives.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#64748B] bg-[#111827] border-[#1E293B]">
            <FileText className="h-8 w-8 mx-auto mb-2 text-[#475569]" />
            <p className="font-semibold text-white">No active job description published yet for {company.company_name}.</p>
            <p className="mt-1 text-[#94A3B8]">Job tracks and eligibility criteria will appear here once the recruitment drive is scheduled.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {drives.map((drive) => {
              let depts: string[] = [];
              let reqSkills: string[] = [];
              try {
                depts = typeof drive.eligible_departments === "string" ? JSON.parse(drive.eligible_departments) : drive.eligible_departments || [];
              } catch {
                depts = ["CSE", "IT", "AIDS", "ECE"];
              }
              try {
                reqSkills = typeof drive.required_skills === "string" ? JSON.parse(drive.required_skills) : drive.required_skills || [];
              } catch {
                reqSkills = ["Problem Solving", "Core Domain", "Git"];
              }

              const jdLink = drive.jd_pdf_url || "https://drive.google.com/drive/folders/1gRwKWhM8tWiPA4fAJOXtjqvXSux8kqdw";

              return (
                <Card
                  key={drive.id}
                  hoverEffect
                  className="flex flex-col justify-between space-y-4 p-5 border-[#1E293B] bg-[#111827]"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            drive.drive_status === "COMPLETED"
                              ? "success"
                              : drive.drive_status === "ONGOING"
                              ? "warning"
                              : "info"
                          }
                        >
                          {drive.drive_status}
                        </Badge>
                        <span className="text-xs text-[#64748B]">
                          {drive.drive_location || "Campus / Virtual"}
                        </span>
                      </div>
                      <span className="text-base font-extrabold text-[#10B981]">
                        {formatLPA(drive.ctc_lpa)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#F8FAFC]">{drive.job_title}</h3>
                      <p className="text-xs text-[#94A3B8] line-clamp-3 mt-1.5 leading-relaxed">
                        {drive.job_description_summary ||
                          `Official placement JD for ${drive.job_title} at ${company.company_name}. Complete specifications on requirements, academic eligibility, and evaluation stages.`}
                      </p>
                    </div>

                    {/* Required Skills */}
                    {reqSkills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-[#64748B]">
                          Required Competencies:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {reqSkills.slice(0, 5).map((sk) => (
                            <span
                              key={sk}
                              className="rounded bg-[#7C2D87]/20 border border-[#7C2D87]/30 px-1.5 py-0.5 text-[10px] font-medium text-[#D8B4FE]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Eligible Departments */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase text-[#64748B]">
                        Eligible Branches:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {depts.map((d) => (
                          <span
                            key={d}
                            className="rounded bg-[#0F172A] border border-[#1E293B] px-1.5 py-0.5 text-[10px] font-bold text-[#94A3B8]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-[#1E293B] pt-4">
                    {/* Primary Button: View Particular Company JD Document */}
                    <button
                      onClick={() => setSelectedDriveForModal(drive)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-600/20 px-3 py-2 text-xs font-bold text-purple-200 transition hover:bg-purple-600/30 hover:text-white"
                    >
                      <FileText className="h-4 w-4 text-purple-400" />
                      <span>View Detailed JD: {company.company_name} — {drive.job_title}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={jdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-[#38BDF8] bg-[#0EA5E9]/10 hover:bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Google Drive PDF</span>
                      </a>
                      <Link href={`/drives/${drive.id}?tab=ats`} className="flex-1">
                        <Button size="sm" className="w-full text-xs py-1.5">
                          <Sparkles className="h-3 w-3" /> ATS Matching
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Full JD Modal Popup */}
      {selectedDriveForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-purple-500/30 bg-[#0B0F19] shadow-2xl shadow-purple-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#111827]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {company.company_name} — {selectedDriveForModal.job_title}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    Official Campus Recruitment Job Description Specification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriveForModal(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed text-[#CBD5E1]">
              {/* Key Highlights Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/5 bg-[#1E293B]/40 p-3">
                  <span className="text-[#94A3B8]">Package (CTC)</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {formatLPA(selectedDriveForModal.ctc_lpa)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#1E293B]/40 p-3">
                  <span className="text-[#94A3B8]">Location</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {selectedDriveForModal.drive_location || company.location}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#1E293B]/40 p-3">
                  <span className="text-[#94A3B8]">Min UG Cutoff</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {selectedDriveForModal.minimum_ug_percentage || 60}% Aggregate
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#1E293B]/40 p-3">
                  <span className="text-[#94A3B8]">Min ATS Threshold</span>
                  <p className="text-sm font-bold text-purple-400 mt-0.5">
                    {selectedDriveForModal.minimum_ats_score || 70} / 100
                  </p>
                </div>
              </div>

              {/* JD Summary */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-purple-400" />
                  Role Overview & Objective
                </h4>
                <p className="bg-[#111827] rounded-xl p-4 border border-white/5 text-[#94A3B8] leading-relaxed">
                  {selectedDriveForModal.job_description_summary ||
                    `Recruitment opportunity for ${selectedDriveForModal.job_title} at ${company.company_name}. The selected candidate will collaborate on engineering deliverables, high-throughput software architectures, and production-grade technologies.`}
                </p>
              </div>

              {/* Required & Preferred Skills */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#F59E0B]" />
                  Required Technical Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(typeof selectedDriveForModal.required_skills === "string"
                    ? JSON.parse(selectedDriveForModal.required_skills || "[]")
                    : selectedDriveForModal.required_skills || ["Python", "SQL", "Data Structures", "Git"]
                  ).map((sk: string) => (
                    <span
                      key={sk}
                      className="rounded-lg bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 text-xs font-semibold text-purple-300"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Eligible Branches & Prerequisite Criteria */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-blue-400" />
                  Eligible Departments & Graduation Batch
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(typeof selectedDriveForModal.eligible_departments === "string"
                    ? JSON.parse(selectedDriveForModal.eligible_departments || "[]")
                    : selectedDriveForModal.eligible_departments || ["CSE", "IT", "AIDS", "ECE"]
                  ).map((dept: string) => (
                    <span
                      key={dept}
                      className="rounded-lg bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 text-xs font-semibold text-blue-300"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recruitment Evaluation Stages */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  Recruitment Evaluation Stages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/5 bg-[#111827] p-3">
                    <span className="font-bold text-white">Round 1: Online Technical Assessment</span>
                    <p className="text-[#94A3B8] mt-1 text-[11px]">Coding algorithms, quantitative aptitude, and core domain MCQs.</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#111827] p-3">
                    <span className="font-bold text-white">Round 2: Technical Interview 1</span>
                    <p className="text-[#94A3B8] mt-1 text-[11px]">Data structures, problem solving, system design, and live coding.</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#111827] p-3">
                    <span className="font-bold text-white">Round 3: Advanced Technical & Project Deep-Dive</span>
                    <p className="text-[#94A3B8] mt-1 text-[11px]">Architecture discussion, past internships, and domain problem solving.</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#111827] p-3">
                    <span className="font-bold text-white">Round 4: HR & Leadership Fitment</span>
                    <p className="text-[#94A3B8] mt-1 text-[11px]">Behavioral assessment, culture fitment, and compensation offer discussion.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 bg-[#111827]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDriveForModal(null)}
                className="text-xs text-[#94A3B8]"
              >
                Close Window
              </Button>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDriveForModal.jd_pdf_url || "https://drive.google.com/drive/folders/1gRwKWhM8tWiPA4fAJOXtjqvXSux8kqdw"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 text-[#38BDF8]">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Google Drive JD
                  </Button>
                </a>
                <Link href={`/drives/${selectedDriveForModal.id}?tab=ats`}>
                  <Button size="sm" className="text-xs flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Open ATS Matching Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

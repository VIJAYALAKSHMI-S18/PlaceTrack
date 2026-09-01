"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Sparkles,
  Award,
  Briefcase,
  X,
  ExternalLink,
  Calendar,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatLPA, formatDate } from "@/lib/utils";
import { exportTableToExcel, exportTableToPdf } from "@/lib/export-utils";

interface StudentInteractiveMetricCardsProps {
  student: any;
}

type ModalType = "ATTENDED" | "ELIGIBLE" | "OFFERS" | "HIGHEST_CTC" | null;

export const StudentInteractiveMetricCards: React.FC<StudentInteractiveMetricCardsProps> = ({
  student,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const completedEvaluations = (student.evaluations || []).filter(
    (e: any) => e.drive?.company?.status === "APPROVED" && e.drive?.drive_status === "COMPLETED"
  );

  const isPlaced =
    student.placement_status === "PLACED" || student.placement_status === "MULTIPLE_OFFERS";
  const acceptedOffer = student.offers?.[0];

  // Placed students only attend drives up until they secure their offer (One Student, One Job)
  let attendedEvaluations = completedEvaluations;
  if (isPlaced && acceptedOffer) {
    const placedDriveIdx = completedEvaluations.findIndex(
      (e: any) => e.placement_drive_id === acceptedOffer.placement_drive_id
    );
    if (placedDriveIdx >= 0) {
      attendedEvaluations = completedEvaluations.slice(0, placedDriveIdx + 1);
    } else {
      attendedEvaluations = completedEvaluations.slice(0, Math.min(completedEvaluations.length, 4));
    }
  }

  const eligibleEvaluations = completedEvaluations.filter(
    (e: any) => e.eligibility_status === "ELIGIBLE"
  );

  const offers = student.offers || [];
  const highestPackage =
    offers.length > 0 ? Math.max(...offers.map((o: any) => o.ctc_lpa)) : 0;
  const highestOffer = offers.find((o: any) => o.ctc_lpa === highestPackage) || offers[0];

  const handleExportModal = (format: "xlsx" | "pdf") => {
    if (!activeModal) return;

    if (activeModal === "ATTENDED") {
      const headers = ["Company", "Job Role", "CTC", "ATS Score", "Skill Match", "Eligibility Result", "Date"];
      const rows = attendedEvaluations.map((ev: any) => [
        ev.drive?.company?.company_name,
        ev.drive?.job_title,
        `${ev.drive?.ctc_lpa} LPA`,
        `${ev.ats_score}/100`,
        `${ev.skill_match_score}/50`,
        ev.eligibility_status,
        formatDate(ev.evaluated_at),
      ]);
      if (format === "xlsx") {
        exportTableToExcel(`${student.name}_Companies_Attended`, "Attended Drives", headers, rows);
      } else {
        exportTableToPdf({
          title: `${student.name} — Companies & Drives Attended`,
          subtitle: `Reg No: ${student.register_number} | Total Attended: ${attendedEvaluations.length}`,
          filename: `${student.name}_Companies_Attended`,
          headers,
          data: rows,
        });
      }
    } else if (activeModal === "ELIGIBLE") {
      const headers = ["Company", "Job Role", "CTC", "ATS Score", "Skill Match", "Date"];
      const rows = eligibleEvaluations.map((ev: any) => [
        ev.drive?.company?.company_name,
        ev.drive?.job_title,
        `${ev.drive?.ctc_lpa} LPA`,
        `${ev.ats_score}/100`,
        `${ev.skill_match_score}/50`,
        formatDate(ev.evaluated_at),
      ]);
      if (format === "xlsx") {
        exportTableToExcel(`${student.name}_Eligible_Shortlists`, "Shortlists", headers, rows);
      } else {
        exportTableToPdf({
          title: `${student.name} — Eligible Shortlisted Drives`,
          subtitle: `Reg No: ${student.register_number} | Total Qualified: ${eligibleEvaluations.length}`,
          filename: `${student.name}_Eligible_Shortlists`,
          headers,
          data: rows,
        });
      }
    } else if (activeModal === "OFFERS" || activeModal === "HIGHEST_CTC") {
      const headers = ["Company", "Job Role", "CTC (LPA)", "Offer Date", "Status"];
      const rows = offers.map((o: any) => [
        o.company?.company_name,
        o.job_role,
        `${o.ctc_lpa} LPA`,
        formatDate(o.offer_date),
        o.offer_status,
      ]);
      if (format === "xlsx") {
        exportTableToExcel(`${student.name}_Placement_Offers`, "Offers", headers, rows);
      } else {
        exportTableToPdf({
          title: `${student.name} — Verified Job Offers`,
          subtitle: `Reg No: ${student.register_number} | Total Offers: ${offers.length}`,
          filename: `${student.name}_Placement_Offers`,
          headers,
          data: rows,
        });
      }
    }
  };

  return (
    <>
      {/* 4 Interactive Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Companies Attended */}
        <button
          type="button"
          onClick={() => setActiveModal("ATTENDED")}
          className="group text-left rounded-2xl border border-purple-500/30 bg-white p-4 transition-all duration-200 hover:border-purple-500/60 hover:bg-[#151C2C] hover:shadow-xl hover:shadow-purple-950/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        >
          <span className="text-xs text-slate-600 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5 group-hover:text-purple-300 transition">
              <Building2 className="h-4 w-4 text-purple-400" />
              Companies Attended
            </span>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-mono font-bold">
              View List ↗
            </span>
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{attendedEvaluations.length}</span>
            <span className="text-xs text-purple-400 font-semibold">
              {isPlaced ? `Placed in Drive #${attendedEvaluations.length}` : "Full Season (19)"}
            </span>
          </div>
        </button>

        {/* Card 2: Eligible Shortlists */}
        <button
          type="button"
          onClick={() => setActiveModal("ELIGIBLE")}
          className="group text-left rounded-2xl border border-blue-500/30 bg-white p-4 transition-all duration-200 hover:border-blue-500/60 hover:bg-[#151C2C] hover:shadow-xl hover:shadow-blue-950/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <span className="text-xs text-slate-600 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5 group-hover:text-blue-300 transition">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Eligible Shortlists
            </span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono font-bold">
              View List ↗
            </span>
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{eligibleEvaluations.length}</span>
            <span className="text-xs text-blue-400 font-semibold">Matches</span>
          </div>
        </button>

        {/* Card 3: Offers Extended */}
        <button
          type="button"
          onClick={() => setActiveModal("OFFERS")}
          className="group text-left rounded-2xl border border-emerald-500/30 bg-white p-4 transition-all duration-200 hover:border-emerald-500/60 hover:bg-[#151C2C] hover:shadow-xl hover:shadow-emerald-950/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <span className="text-xs text-slate-600 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5 group-hover:text-emerald-300 transition">
              <Award className="h-4 w-4 text-emerald-400" />
              Offers Extended
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
              View List ↗
            </span>
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{offers.length}</span>
            <span className="text-xs text-slate-600 font-semibold">
              {offers.length > 0 ? "Placed" : "In Progress"}
            </span>
          </div>
        </button>

        {/* Card 4: Highest Package */}
        <button
          type="button"
          onClick={() => setActiveModal("HIGHEST_CTC")}
          className="group text-left rounded-2xl border border-orange-500/30 bg-white p-4 transition-all duration-200 hover:border-orange-500/60 hover:bg-[#151C2C] hover:shadow-xl hover:shadow-orange-950/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        >
          <span className="text-xs text-slate-600 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5 group-hover:text-orange-300 transition">
              <Briefcase className="h-4 w-4 text-orange-400" />
              Highest Package
            </span>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-mono font-bold">
              Details ↗
            </span>
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-400">
              {highestPackage > 0 ? formatLPA(highestPackage) : "—"}
            </span>
          </div>
        </button>
      </div>

      {/* Interactive Modal Popup */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    activeModal === "ATTENDED"
                      ? "bg-purple-500/20 text-purple-400"
                      : activeModal === "ELIGIBLE"
                      ? "bg-blue-500/20 text-blue-400"
                      : activeModal === "OFFERS"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {activeModal === "ATTENDED" && <Building2 className="h-5 w-5" />}
                  {activeModal === "ELIGIBLE" && <Sparkles className="h-5 w-5" />}
                  {activeModal === "OFFERS" && <Award className="h-5 w-5" />}
                  {activeModal === "HIGHEST_CTC" && <Briefcase className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeModal === "ATTENDED" &&
                      `Companies & Recruitment Drives Attended (${attendedEvaluations.length})`}
                    {activeModal === "ELIGIBLE" &&
                      `Eligible Shortlists & Matching Drives (${eligibleEvaluations.length})`}
                    {activeModal === "OFFERS" &&
                      `Verified Job Offers & Selections (${offers.length})`}
                    {activeModal === "HIGHEST_CTC" &&
                      `Highest CTC Package Breakdown (${formatLPA(highestPackage)})`}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Candidate: <strong className="text-white">{student.name}</strong> (
                    {student.register_number} • {student.department})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportModal("xlsx")}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-400 hover:bg-emerald-500/20 transition"
                  title="Export Excel"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleExportModal("pdf")}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-rose-400 hover:bg-rose-500/20 transition"
                  title="Export PDF"
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg p-2 text-slate-600 hover:bg-white/10 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* MODAL 1: ATTENDED */}
              {activeModal === "ATTENDED" && (
                <div className="space-y-4">
                  <table className="w-full text-left text-xs">
                    <thead className="table-header">
                      <tr>
                        <th className="px-3 py-2.5">DRIVE #</th>
                        <th className="px-3 py-2.5">COMPANY</th>
                        <th className="px-3 py-2.5">JOB ROLE</th>
                        <th className="px-3 py-2.5">PACKAGE</th>
                        <th className="px-3 py-2.5">ATS SCORE</th>
                        <th className="px-3 py-2.5">RESULT</th>
                        <th className="px-3 py-2.5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {attendedEvaluations.map((ev: any, idx: number) => (
                        <tr key={ev.id} className="table-row">
                          <td className="px-3 py-2.5 font-mono text-[#0284C7]">#{idx + 1}</td>
                          <td className="px-3 py-2.5 font-semibold text-white">
                            {ev.drive?.company?.company_name}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{ev.drive?.job_title}</td>
                          <td className="px-3 py-2.5 font-bold text-[#10B981]">
                            {formatLPA(ev.drive?.ctc_lpa)}
                          </td>
                          <td className="px-3 py-2.5 font-mono font-bold text-white">
                            {ev.ats_score}/100
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              variant={
                                ev.eligibility_status === "ELIGIBLE"
                                  ? "success"
                                  : ev.eligibility_status === "CONDITIONALLY_ELIGIBLE"
                                  ? "warning"
                                  : "danger"
                              }
                            >
                              {ev.eligibility_status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <Link
                              href={`/drives/${ev.placement_drive_id}`}
                              className="text-[#0284C7] hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MODAL 2: ELIGIBLE */}
              {activeModal === "ELIGIBLE" && (
                <div className="space-y-4">
                  {eligibleEvaluations.length === 0 ? (
                    <p className="text-center text-xs text-slate-600 py-8">
                      No eligible shortlists recorded.
                    </p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="table-header">
                        <tr>
                          <th className="px-3 py-2.5">COMPANY</th>
                          <th className="px-3 py-2.5">ROLE</th>
                          <th className="px-3 py-2.5">PACKAGE</th>
                          <th className="px-3 py-2.5">ATS MATCH</th>
                          <th className="px-3 py-2.5">SKILL SCORE</th>
                          <th className="px-3 py-2.5 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {eligibleEvaluations.map((ev: any) => (
                          <tr key={ev.id} className="table-row">
                            <td className="px-3 py-2.5 font-semibold text-white">
                              {ev.drive?.company?.company_name}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">{ev.drive?.job_title}</td>
                            <td className="px-3 py-2.5 font-bold text-[#10B981]">
                              {formatLPA(ev.drive?.ctc_lpa)}
                            </td>
                            <td className="px-3 py-2.5 font-bold text-white">
                              {ev.ats_score} / 100
                            </td>
                            <td className="px-3 py-2.5 text-emerald-400 font-semibold">
                              {ev.skill_match_score} / 50
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <Link
                                href={`/drives/${ev.placement_drive_id}`}
                                className="text-[#0284C7] hover:underline inline-flex items-center gap-1 font-semibold"
                              >
                                Portal <ExternalLink className="h-3 w-3" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* MODAL 3: OFFERS */}
              {activeModal === "OFFERS" && (
                <div className="space-y-4">
                  {offers.length === 0 ? (
                    <p className="text-center text-xs text-slate-600 py-8">
                      Candidate has not received an offer yet.
                    </p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="table-header">
                        <tr>
                          <th className="px-3 py-2.5">COMPANY</th>
                          <th className="px-3 py-2.5">ROLE</th>
                          <th className="px-3 py-2.5">PACKAGE (CTC)</th>
                          <th className="px-3 py-2.5">OFFER DATE</th>
                          <th className="px-3 py-2.5">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {offers.map((offer: any) => (
                          <tr key={offer.id} className="table-row">
                            <td className="px-3 py-2.5 font-semibold text-white">
                              {offer.company?.company_name}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">{offer.job_role}</td>
                            <td className="px-3 py-2.5 font-bold text-emerald-400">
                              {formatLPA(offer.ctc_lpa)}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">
                              {formatDate(offer.offer_date)}
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge
                                variant={
                                  offer.offer_status === "ACCEPTED" ||
                                  offer.offer_status === "JOINED"
                                    ? "success"
                                    : "info"
                                }
                              >
                                {offer.offer_status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* MODAL 4: HIGHEST CTC BREAKDOWN */}
              {activeModal === "HIGHEST_CTC" && (
                <div className="space-y-4">
                  {highestOffer ? (
                    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                            Highest Confirmed Campus Offer
                          </span>
                          <h2 className="text-3xl font-black text-white mt-1">
                            {formatLPA(highestOffer.ctc_lpa)}
                          </h2>
                        </div>
                        <Badge variant="success" size="md">
                          {highestOffer.offer_status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-200 pt-4">
                        <div>
                          <span className="text-slate-600 block">Hiring Organization</span>
                          <strong className="text-white text-sm">
                            {highestOffer.company?.company_name}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Designation / Role</span>
                          <strong className="text-white text-sm">{highestOffer.job_role}</strong>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Offer Issue Date</span>
                          <span className="text-white">{formatDate(highestOffer.offer_date)}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Work Location</span>
                          <span className="text-white">
                            {highestOffer.company?.location || "Bangalore / Campus"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-slate-600 py-8">
                      No offers recorded for this candidate yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

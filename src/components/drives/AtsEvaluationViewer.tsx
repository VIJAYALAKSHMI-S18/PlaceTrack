"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, BookOpen, Layers, Award } from "lucide-react";
import { parseJsonSafe } from "@/lib/utils";

interface AtsEvaluationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: any;
  drive: any;
}

export const AtsEvaluationViewer: React.FC<AtsEvaluationViewerProps> = ({
  isOpen,
  onClose,
  evaluation,
  drive,
}) => {
  if (!evaluation) return null;

  const matchedSkills = parseJsonSafe<string[]>(evaluation.matched_skills, []);
  const missingSkills = parseJsonSafe<string[]>(evaluation.missing_skills, []);
  const eligibilityReasons = parseJsonSafe<string[]>(evaluation.eligibility_reasons, []);

  const student = evaluation.student;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ATS Resume Matching & Eligibility Breakdown"
      description={`Detailed multi-tier analysis for ${student?.name} (${student?.register_number})`}
      maxWidth="3xl"
    >
      <div className="space-y-6 pt-2">
        {/* Top Summary Card */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900">{student?.name}</div>
            <div className="text-xs text-slate-600">
              {student?.department} • UG: {student?.ug_percentage}% • Backlogs: {student?.backlogs ?? 0}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-600">
                Calculated ATS Score
              </div>
              <div className="text-2xl font-extrabold text-[#0284C7]">
                {evaluation.ats_score}
                <span className="text-xs text-[#64748B]"> / 100</span>
              </div>
            </div>

            <Badge
              variant={
                evaluation.eligibility_status === "ELIGIBLE"
                  ? "success"
                  : evaluation.eligibility_status === "CONDITIONALLY_ELIGIBLE"
                  ? "warning"
                  : "danger"
              }
              size="md"
            >
              {evaluation.eligibility_status?.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* 5-Factor Weighted Score Breakdown */}
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">
            Weighted 5-Factor ATS Scoring Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-center">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-600">Skill Match</div>
              <div className="text-lg font-bold text-[#10B981]">
                {evaluation.skill_match_score}
                <span className="text-[10px] text-[#64748B]"> / 50</span>
              </div>
              <div className="text-[10px] text-[#64748B]">50% Weight</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-600">Semantic Match</div>
              <div className="text-lg font-bold text-[#0284C7]">
                {evaluation.semantic_match_score}
                <span className="text-[10px] text-[#64748B]"> / 20</span>
              </div>
              <div className="text-[10px] text-[#64748B]">20% Weight</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-600">Education</div>
              <div className="text-lg font-bold text-[#3B82F6]">
                {evaluation.education_score}
                <span className="text-[10px] text-[#64748B]"> / 10</span>
              </div>
              <div className="text-[10px] text-[#64748B]">10% Weight</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-600">Experience</div>
              <div className="text-lg font-bold text-[#F59E0B]">
                {evaluation.experience_score}
                <span className="text-[10px] text-[#64748B]"> / 10</span>
              </div>
              <div className="text-[10px] text-[#64748B]">10% Weight</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-600">Project Fit</div>
              <div className="text-lg font-bold text-[#EC4899]">
                {evaluation.project_score}
                <span className="text-[10px] text-[#64748B]"> / 10</span>
              </div>
              <div className="text-[10px] text-[#64748B]">10% Weight</div>
            </div>
          </div>
        </div>

        {/* Matched vs Missing Skills */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Matched Skills */}
          <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
              <CheckCircle2 className="h-4 w-4" /> Matched Skills ({matchedSkills.length})
            </div>
            {matchedSkills.length === 0 ? (
              <p className="text-xs text-[#64748B]">No exact or synonym skill matches found.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 rounded-md bg-[#10B981]/15 px-2 py-0.5 text-xs font-semibold text-[#10B981]"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing Skills */}
          <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#EF4444]">
              <XCircle className="h-4 w-4" /> Missing Required Skills ({missingSkills.length})
            </div>
            {missingSkills.length === 0 ? (
              <p className="text-xs text-[#10B981]">All required skills present on candidate resume!</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 rounded-md bg-[#EF4444]/15 px-2 py-0.5 text-xs font-semibold text-[#EF4444]"
                  >
                    ✗ {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Tier Eligibility Rule Checks */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            Academic & ATS Eligibility Diagnostics
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-900">
            {eligibilityReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#0284C7] font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
};

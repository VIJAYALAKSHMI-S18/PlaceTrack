import { requireAuth } from "@/lib/rbac";
import { getStudentById } from "@/services/student.service";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  User,
  GraduationCap,
  FileText,
  Video,
  Globe,
  Github,
  Linkedin,
  Award,
  Building2,
  Calendar,
  Briefcase,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { formatLPA, formatDate, formatPercentage, parseJsonSafe } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: { studentId: string };
}) {
  const user = await requireAuth();
  const student = await getStudentById(params.studentId);

  if (!student) {
    notFound();
  }

  const skills: string[] = parseJsonSafe<string[]>(student.skills, []);

  return (
    <DashboardShell role={user.role as any} user={user}>
      <div className="space-y-6">
        {/* Back navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${user.role.toLowerCase().replace("_", "-")}/students`}
              className="rounded-lg border border-[#1E293B] bg-[#111827] p-2 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-[#F8FAFC]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                  {student.name}
                </h1>
                <Badge
                  variant={
                    student.placement_status === "PLACED"
                      ? "success"
                      : student.placement_status === "MULTIPLE_OFFERS"
                      ? "primary"
                      : "neutral"
                  }
                  size="md"
                >
                  {student.placement_status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs font-mono text-[#818CF8]">
                {student.register_number} • {student.department} • Class of {student.graduation_year || 2025}
              </p>
            </div>
          </div>
        </div>

        {/* Top Grid: Personal & Academic Info */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Personal Information */}
          <Card className="space-y-4">
            <CardHeader>
              <div className="flex items-center gap-2 text-[#818CF8]">
                <User className="h-4 w-4" />
                <CardTitle>Personal Information</CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">Full Name</span>
                <span className="font-semibold text-[#F8FAFC]">{student.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">Register Number</span>
                <span className="font-mono font-bold text-[#818CF8]">{student.register_number}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">Department</span>
                <span className="font-semibold text-[#F8FAFC]">{student.department}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">Student Type</span>
                <span className="font-semibold text-[#F8FAFC]">{student.student_type}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">Email</span>
                <span className="text-[#F8FAFC]">{student.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Phone</span>
                <span className="text-[#F8FAFC]">{student.phone_number}</span>
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          <Card className="space-y-4">
            <CardHeader>
              <div className="flex items-center gap-2 text-[#10B981]">
                <GraduationCap className="h-4 w-4" />
                <CardTitle>Academic Records</CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">UG Aggregate %</span>
                <span className="font-bold text-[#10B981]">{formatPercentage(student.ug_percentage)}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">CGPA (10 pt scale)</span>
                <span className="font-bold text-[#818CF8]">{student.cgpa ?? "—"}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">HSC (12th) %</span>
                <span className="text-[#F8FAFC]">{formatPercentage(student.hsc_percentage)}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">SSLC (10th) %</span>
                <span className="text-[#F8FAFC]">{formatPercentage(student.sslc_percentage)}</span>
              </div>
              <div className="flex justify-between border-b border-[#1E293B] pb-2">
                <span className="text-[#94A3B8]">PG Percentage</span>
                <span className="text-[#F8FAFC]">{student.pg_percentage ? `${student.pg_percentage}%` : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Standing Backlogs</span>
                <span className={`font-bold ${student.backlogs > 0 ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                  {student.backlogs}
                </span>
              </div>
            </div>
          </Card>

          {/* Resumes & Links */}
          <Card className="space-y-4">
            <CardHeader>
              <div className="flex items-center gap-2 text-[#3B82F6]">
                <FileText className="h-4 w-4" />
                <CardTitle>Documents & Portfolios</CardTitle>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {student.resume_url ? (
                <a
                  href={student.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 text-xs transition hover:border-[#6366F1]"
                >
                  <div className="flex items-center gap-2 text-[#818CF8]">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold text-[#F8FAFC]">Official Resume PDF</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
                </a>
              ) : (
                <div className="rounded-lg bg-[#0F172A] p-3 text-xs text-[#64748B]">No resume uploaded</div>
              )}

              {student.self_intro_url && (
                <a
                  href={student.self_intro_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 text-xs transition hover:border-[#6366F1]"
                >
                  <div className="flex items-center gap-2 text-[#EC4899]">
                    <Video className="h-4 w-4" />
                    <span className="font-semibold text-[#F8FAFC]">Self Introduction Video</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
                </a>
              )}

              <div className="flex items-center gap-2 pt-2">
                {student.linkedin_url && (
                  <a
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#0F172A] p-2 text-xs text-[#94A3B8] transition hover:text-[#818CF8]"
                  >
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
                {student.github_url && (
                  <a
                    href={student.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#0F172A] p-2 text-xs text-[#94A3B8] transition hover:text-[#818CF8]"
                  >
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {student.portfolio_url && (
                  <a
                    href={student.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#0F172A] p-2 text-xs text-[#94A3B8] transition hover:text-[#818CF8]"
                  >
                    <Globe className="h-3.5 w-3.5" /> Portfolio
                  </a>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Skills Tag Cloud */}
        {skills.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Extracted Technical & Domain Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-[#6366F1]/30 bg-[#6366F1]/10 px-3 py-1 text-xs font-semibold text-[#818CF8]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Offers & Placement Selections */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Job Offers & Selections ({student.offers.length})</CardTitle>
              <CardDescription>Verified placement offers extended to this candidate</CardDescription>
            </div>
          </CardHeader>

          {student.offers.length === 0 ? (
            <p className="py-4 text-center text-xs text-[#64748B]">No job offers recorded yet.</p>
          ) : (
            <div className="table-container">
              <table className="w-full text-left text-xs">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3">COMPANY</th>
                    <th className="px-4 py-3">JOB ROLE</th>
                    <th className="px-4 py-3">PACKAGE (CTC)</th>
                    <th className="px-4 py-3">OFFER DATE</th>
                    <th className="px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {student.offers.map((offer) => (
                    <tr key={offer.id} className="table-row">
                      <td className="px-4 py-3 font-semibold text-[#F8FAFC]">
                        {offer.company?.company_name}
                      </td>
                      <td className="px-4 py-3 text-[#94A3B8]">{offer.job_role}</td>
                      <td className="px-4 py-3 font-bold text-[#10B981]">{formatLPA(offer.ctc_lpa)}</td>
                      <td className="px-4 py-3 text-[#94A3B8]">{formatDate(offer.offer_date)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="success">{offer.offer_status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ATS Evaluation History */}
        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>ATS Evaluation & Candidate Matching History</CardTitle>
              <CardDescription>Drive-specific resume evaluation results and scores</CardDescription>
            </div>
          </CardHeader>

          {student.evaluations.length === 0 ? (
            <p className="py-4 text-center text-xs text-[#64748B]">
              No ATS evaluations generated yet for this student.
            </p>
          ) : (
            <div className="table-container">
              <table className="w-full text-left text-xs">
                <thead className="table-header">
                  <tr>
                    <th className="px-4 py-3">RECRUITMENT DRIVE</th>
                    <th className="px-4 py-3">COMPANY</th>
                    <th className="px-4 py-3">ATS SCORE</th>
                    <th className="px-4 py-3">SKILL MATCH</th>
                    <th className="px-4 py-3">ELIGIBILITY STATUS</th>
                    <th className="px-4 py-3 text-right">EVALUATED AT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {student.evaluations.map((ev) => (
                    <tr key={ev.id} className="table-row">
                      <td className="px-4 py-3 font-semibold text-[#F8FAFC]">
                        <Link href={`/drives/${ev.placement_drive_id}`} className="hover:text-[#818CF8]">
                          {ev.drive?.job_title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#94A3B8]">
                        {ev.drive?.company?.company_name}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#818CF8]">
                        {ev.ats_score} / 100
                      </td>
                      <td className="px-4 py-3 text-[#10B981] font-semibold">
                        {ev.skill_match_score} / 50
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-right text-[#94A3B8]">
                        {formatDate(ev.evaluated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}

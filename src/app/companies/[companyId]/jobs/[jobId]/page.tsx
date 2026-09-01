import { requireAuth } from "@/lib/rbac";
import { getPlacementDriveById } from "@/services/drive.service";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  FileText,
  Globe,
  Sparkles,
  Award,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { formatLPA, formatDate, parseJsonSafe } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: { companyId: string; jobId: string };
}) {
  const user = await requireAuth();
  const drive = await getPlacementDriveById(params.jobId);

  if (!drive) {
    notFound();
  }

  const eligibleDepts = parseJsonSafe<string[]>(drive.eligible_departments, []);
  const reqSkills = parseJsonSafe<string[]>(drive.required_skills, []);
  const prefSkills = parseJsonSafe<string[]>(drive.preferred_skills, []);

  return (
    <DashboardShell role={user.role as any} user={user}>
      <div className="space-y-6">
        {/* Back navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/companies/${params.companyId}`}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {drive.job_title}
                </h1>
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
              </div>
              <p className="text-xs text-slate-600">
                {drive.company?.company_name} • {drive.drive_location || "Campus / Virtual"}
              </p>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex flex-wrap items-center gap-2">
            {drive.jd_pdf_url && (
              <a href={drive.jd_pdf_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs">
                  <FileText className="h-3.5 w-3.5" /> View JD PDF
                </Button>
              </a>
            )}
            {drive.official_careers_url && (
              <a href={drive.official_careers_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs text-[#0284C7]">
                  <Globe className="h-3.5 w-3.5" /> Visit Official Careers
                </Button>
              </a>
            )}
            <Link href={`/drives/${drive.id}?tab=ats`}>
              <Button size="sm" className="text-xs">
                <Sparkles className="h-3.5 w-3.5" /> ATS Candidate Matching
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview & Compensation Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main JD Info */}
          <Card className="space-y-4 lg:col-span-2">
            <CardHeader>
              <CardTitle>Job Description & Responsibilities</CardTitle>
            </CardHeader>
            <p className="text-xs leading-relaxed text-slate-600">
              {drive.job_description_summary ||
                "No comprehensive job description text provided. Refer to the attached official recruitment PDF."}
            </p>

            {/* Required Skills */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Required Technical Competencies
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {reqSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1 text-xs font-semibold text-[#10B981]"
                  >
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            {prefSkills.length > 0 && (
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Preferred / Nice-to-Have Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {prefSkills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-[#0284C7]/30 bg-[#0284C7]/10 px-2.5 py-1 text-xs font-semibold text-[#0284C7]"
                    >
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Key Parameters Card */}
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Recruitment Parameters</CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Annual CTC Package</span>
                <span className="text-base font-extrabold text-[#10B981]">
                  {formatLPA(drive.ctc_lpa)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Drive Schedule Date</span>
                <span className="font-semibold text-slate-900">{formatDate(drive.drive_date)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Recruitment Format</span>
                <span className="font-semibold text-[#0284C7]">{drive.drive_type.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Opportunity Status</span>
                <span className="font-semibold text-[#10B981]">{drive.opportunity_status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Min UG Percentage</span>
                <span className="font-semibold text-slate-900">{drive.minimum_ug_percentage || 60}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Min ATS Resume Score</span>
                <span className="font-bold text-[#0284C7]">{drive.minimum_ats_score} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Max Backlogs Allowed</span>
                <span className="font-semibold text-slate-900">{drive.maximum_backlogs}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <Link href={`/drives/${drive.id}`}>
                <Button className="w-full text-xs">
                  Open Complete Placement Drive Hub
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

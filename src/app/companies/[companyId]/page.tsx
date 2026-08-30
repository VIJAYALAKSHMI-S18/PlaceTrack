import { requireAuth } from "@/lib/rbac";
import { getCompanyById } from "@/services/company.service";
import { DashboardShell } from "@/components/navigation/DashboardShell";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  User,
  ExternalLink,
  Briefcase,
  Calendar,
  Award,
} from "lucide-react";
import { formatLPA, formatDate, parseJsonSafe } from "@/lib/utils";
import { CompanyJdViewer } from "@/components/companies/CompanyJdViewer";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: { companyId: string };
}) {
  const user = await requireAuth();
  const company = await getCompanyById(params.companyId);

  if (!company) {
    notFound();
  }

  return (
    <DashboardShell role={user.role as any} user={user}>
      <div className="space-y-6">
        {/* Header & Back Navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${user.role.toLowerCase().replace("_", "-")}/companies`}
              className="rounded-lg border border-[#1E293B] bg-[#111827] p-2 text-[#94A3B8] transition hover:bg-[#1E293B] hover:text-[#F8FAFC]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/20 text-[#818CF8]">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
                    {company.company_name}
                  </h1>
                  <Badge
                    variant={
                      company.status === "APPROVED"
                        ? "success"
                        : company.status === "PENDING_APPROVAL"
                        ? "warning"
                        : "danger"
                    }
                    size="md"
                  >
                    {company.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  {company.location} • {company.industry || "Technology Enterprise"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Overview & Contact Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Company Details */}
          <Card className="space-y-4 lg:col-span-2">
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>

            <p className="text-xs leading-relaxed text-[#94A3B8]">
              {company.company_description ||
                "No detailed company description provided. Partner organization participating in institutional recruitment programs."}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-[#1E293B] pt-4 text-xs">
              <div>
                <span className="text-[#64748B]">Industry Domain</span>
                <p className="font-semibold text-[#F8FAFC]">{company.industry || "—"}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Company Size</span>
                <p className="font-semibold text-[#F8FAFC]">{company.company_size || "—"}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Founded Year</span>
                <p className="font-semibold text-[#F8FAFC]">{company.founded_year || "—"}</p>
              </div>
              <div>
                <span className="text-[#64748B]">Headquarters Location</span>
                <p className="font-semibold text-[#F8FAFC]">{company.location}</p>
              </div>
            </div>

            {/* Address & Google Maps fallback */}
            <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#818CF8]">
                <MapPin className="h-4 w-4" /> Office Address & Map Integration
              </div>
              <p className="text-[#94A3B8]">
                {company.company_address || company.formatted_address || company.location}
              </p>
              {company.google_maps_url ? (
                <a
                  href={company.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#818CF8] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> View Location on Google Maps
                </a>
              ) : (
                <span className="text-[10px] text-[#64748B]">
                  Coordinates: {company.latitude ?? "12.9716"}° N, {company.longitude ?? "77.5946"}° E
                </span>
              )}
            </div>
          </Card>

          {/* Contact & Links */}
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Recruitment Contact</CardTitle>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-[#64748B]" />
                <div>
                  <span className="text-[#64748B] block text-[10px]">Contact Person</span>
                  <span className="font-semibold text-[#F8FAFC]">
                    {company.contact_person_name || "HR Placement Desk"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#64748B]" />
                <div>
                  <span className="text-[#64748B] block text-[10px]">Contact Email</span>
                  <span className="font-semibold text-[#F8FAFC]">
                    {company.contact_person_email || "hr@company.com"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#64748B]" />
                <div>
                  <span className="text-[#64748B] block text-[10px]">Contact Phone</span>
                  <span className="font-semibold text-[#F8FAFC]">
                    {company.contact_person_phone || "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#1E293B] pt-4">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-[#1E293B] bg-[#0F172A] p-2.5 text-xs text-[#94A3B8] transition hover:text-[#F8FAFC]"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" /> Official Website
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {company.careers_url && (
                <a
                  href={company.careers_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-[#1E293B] bg-[#0F172A] p-2.5 text-xs text-[#818CF8] transition hover:text-[#818CF8]"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" /> Official Careers Portal
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </Card>
        </div>

        {/* Company-Specific Job Descriptions & Attached JD Documents */}
        <CompanyJdViewer company={company} />
      </div>
    </DashboardShell>
  );
}

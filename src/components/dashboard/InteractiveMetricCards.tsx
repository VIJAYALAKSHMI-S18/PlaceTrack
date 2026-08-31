"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Users,
  Building2,
  Briefcase,
  Award,
  Search,
  X,
  ExternalLink,
  CheckCircle2,
  Clock,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { formatLPA } from "@/lib/utils";
import Link from "next/link";

interface InteractiveMetricCardsProps {
  stats: {
    totalStudents: number;
    placementPercentage?: number;
    approvedCompanies: number;
    pendingCompanies: number;
    completedDrives: number;
    upcomingDrives: number;
    totalOffers: number;
    averagePackage?: number;
  };
  studentsList: any[];
  companiesList: any[];
  drivesList: any[];
  offersList: any[];
  role?: string;
}

type ModalType = "STUDENTS" | "COMPANIES" | "DRIVES" | "OFFERS" | null;

export function InteractiveMetricCards({
  stats,
  studentsList = [],
  companiesList = [],
  drivesList = [],
  offersList = [],
  role = "MANAGER",
}: InteractiveMetricCardsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Reset filters when modal changes
  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentsList.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.register_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === "PLACED") return s.placement_status === "PLACED" || s.placement_status === "MULTIPLE_OFFERS";
      if (statusFilter === "NOT_PLACED") return s.placement_status === "NOT_PLACED" || !s.placement_status;
      return true;
    });
  }, [studentsList, searchQuery, statusFilter]);

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    return companiesList.filter((c) => {
      const matchesSearch =
        c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [companiesList, searchQuery]);

  // Filtered Drives
  const filteredDrives = useMemo(() => {
    return drivesList.filter((d) => {
      const companyName = d.company?.company_name || "";
      const matchesSearch =
        companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.drive_location && d.drive_location.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [drivesList, searchQuery]);

  // Filtered Offers
  const filteredOffers = useMemo(() => {
    return offersList.filter((o) => {
      const studentName = o.student?.name || "";
      const regNo = o.student?.register_number || "";
      const compName = o.company?.company_name || "";
      const roleName = o.job_role || "";

      return (
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        compName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        roleName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [offersList, searchQuery]);

  return (
    <>
      {/* 4 Interactive Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Students Card */}
        <Card
          onClick={() => openModal("STUDENTS")}
          className="group relative cursor-pointer overflow-hidden p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#0284C7]/60 hover:bg-[#0284C7]/5 hover:shadow-lg hover:shadow-[#0284C7]/10"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium group-hover:text-[#0284C7]">Total Students</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0284C7]/10 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 group-hover:text-[#0284C7]">
            {stats.totalStudents}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#10B981]">
              {stats.placementPercentage ?? 70}% Placed
            </span>
            <span className="text-[10px] text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-0.5">
              View List <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </Card>

        {/* Active Companies Card */}
        <Card
          onClick={() => openModal("COMPANIES")}
          className="group relative cursor-pointer overflow-hidden p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#3B82F6]/60 hover:bg-[#3B82F6]/5 hover:shadow-lg hover:shadow-[#3B82F6]/10"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium group-hover:text-[#3B82F6]">Active Companies</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#3B82F6]">
            {stats.approvedCompanies}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#F59E0B]">
              {stats.pendingCompanies} in queue
            </span>
            <span className="text-[10px] text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-0.5">
              View List <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </Card>

        {/* Completed Drives Card */}
        <Card
          onClick={() => openModal("DRIVES")}
          className="group relative cursor-pointer overflow-hidden p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#EC4899]/60 hover:bg-[#EC4899]/5 hover:shadow-lg hover:shadow-[#EC4899]/10"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium group-hover:text-[#EC4899]">Completed Drives</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EC4899]/10 text-[#EC4899] group-hover:bg-[#EC4899] group-hover:text-white transition-colors">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#EC4899]">
            {stats.completedDrives}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">
              {stats.upcomingDrives} Upcoming
            </span>
            <span className="text-[10px] text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-0.5">
              View List <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </Card>

        {/* Total Offers Card */}
        <Card
          onClick={() => openModal("OFFERS")}
          className="group relative cursor-pointer overflow-hidden p-4 transition-all duration-300 hover:scale-[1.02] hover:border-[#10B981]/60 hover:bg-[#10B981]/5 hover:shadow-lg hover:shadow-[#10B981]/10"
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium group-hover:text-[#10B981]">Total Offers</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-colors">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#10B981]">
            {stats.totalOffers}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500">
              Avg: {formatLPA(stats.averagePackage || 11.49)}
            </span>
            <span className="text-[10px] text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-0.5">
              View List <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </Card>
      </div>

      {/* Interactive Modal Popup Drawer */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#0B0F19] shadow-2xl shadow-purple-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/80">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {activeModal === "STUDENTS" && <Users className="h-5 w-5 text-[#0284C7]" />}
                  {activeModal === "COMPANIES" && <Building2 className="h-5 w-5 text-[#3B82F6]" />}
                  {activeModal === "DRIVES" && <Briefcase className="h-5 w-5 text-[#EC4899]" />}
                  {activeModal === "OFFERS" && <Award className="h-5 w-5 text-[#10B981]" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {activeModal === "STUDENTS" && "Students Directory"}
                    {activeModal === "COMPANIES" && "Active Corporate Partners"}
                    {activeModal === "DRIVES" && "Completed Recruitment Drives"}
                    {activeModal === "OFFERS" && "Student Placement Offers"}
                    <Badge variant="primary" className="text-xs">
                      {activeModal === "STUDENTS" && `${filteredStudents.length} Students`}
                      {activeModal === "COMPANIES" && `${filteredCompanies.length} Companies`}
                      {activeModal === "DRIVES" && `${filteredDrives.length} Drives`}
                      {activeModal === "OFFERS" && `${filteredOffers.length} Offers`}
                    </Badge>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeModal === "STUDENTS" && "Browse institutional candidate roster with department and placement status"}
                    {activeModal === "COMPANIES" && "Active verified hiring partners conducting campus recruitment drives"}
                    {activeModal === "DRIVES" && "Finished placement drives, packages, and candidate participation"}
                    {activeModal === "OFFERS" && "Official employment offers granted to enrolled students"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-[#0B0F19] px-6 py-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${
                    activeModal === "STUDENTS"
                      ? "by name, roll no, department..."
                      : activeModal === "COMPANIES"
                      ? "by company name, location..."
                      : activeModal === "DRIVES"
                      ? "by company, job role..."
                      : "by student, company, role..."
                  }`}
                  className="w-full rounded-xl border border-white/10 bg-[#1E293B]/60 pl-9 pr-4 py-2 text-xs text-white placeholder-[#64748B] focus:border-purple-500 focus:outline-none"
                />
              </div>

              {activeModal === "STUDENTS" && (
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                      statusFilter === "ALL"
                        ? "bg-purple-600 text-white"
                        : "bg-white/5 text-slate-500 hover:text-white"
                    }`}
                  >
                    All ({studentsList.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("PLACED")}
                    className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                      statusFilter === "PLACED"
                        ? "bg-emerald-600 text-white"
                        : "bg-white/5 text-slate-500 hover:text-white"
                    }`}
                  >
                    Placed ({studentsList.filter((s) => s.placement_status === "PLACED").length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("NOT_PLACED")}
                    className={`rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                      statusFilter === "NOT_PLACED"
                        ? "bg-amber-600 text-white"
                        : "bg-white/5 text-slate-500 hover:text-white"
                    }`}
                  >
                    Unplaced ({studentsList.filter((s) => s.placement_status !== "PLACED").length})
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-white/5">
              {/* STUDENTS MODAL LIST */}
              {activeModal === "STUDENTS" && (
                <>
                  {filteredStudents.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No students matching your search criteria.
                    </div>
                  ) : (
                    filteredStudents.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between pt-3 first:pt-0 hover:bg-white/[0.02] p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 font-bold text-xs border border-purple-500/20">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{st.name}</span>
                              <span className="text-[11px] font-mono text-slate-500">
                                ({st.register_number})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span>{st.department}</span>
                              <span>•</span>
                              <span>UG: {st.ug_percentage}%</span>
                              <span>•</span>
                              <span>CGPA: {st.cgpa}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {st.placement_status === "PLACED" ? (
                            <Badge variant="success" className="text-[11px] py-0.5">
                              ✓ Placed
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-[11px] py-0.5">
                              Yet to be Placed
                            </Badge>
                          )}
                          <Link
                            href={`/students/${st.id}`}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* COMPANIES MODAL LIST */}
              {activeModal === "COMPANIES" && (
                <>
                  {filteredCompanies.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No companies matching your search criteria.
                    </div>
                  ) : (
                    filteredCompanies.map((c, idx) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between pt-3 first:pt-0 hover:bg-white/[0.02] p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 font-bold text-xs border border-blue-500/20">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {c.company_name}
                              </span>
                              <Badge variant="info" className="text-[10px]">
                                Approved Partner
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span>📍 {c.location || "India"}</span>
                              <span>•</span>
                              <span>{c.industry || "Information Technology"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            href={`/companies/${c.id}`}
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            View Company <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* DRIVES MODAL LIST */}
              {activeModal === "DRIVES" && (
                <>
                  {filteredDrives.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No completed drives matching your search criteria.
                    </div>
                  ) : (
                    filteredDrives.map((d, idx) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between pt-3 first:pt-0 hover:bg-white/[0.02] p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 font-bold text-xs border border-pink-500/20">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {d.company?.company_name}
                              </span>
                              <span className="text-xs text-[#EC4899] font-medium">
                                — {d.job_title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span className="text-emerald-400 font-medium">
                                💰 {d.ctc_lpa ? `${d.ctc_lpa} LPA` : "Standard"}
                              </span>
                              <span>•</span>
                              <span>📍 {d.drive_location || "Campus"}</span>
                              <span>•</span>
                              <Badge variant="success" className="text-[10px]">
                                Completed
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            href={`/drives/${d.id}`}
                            className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 font-medium bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Drive Portal <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* OFFERS MODAL LIST */}
              {activeModal === "OFFERS" && (
                <>
                  {filteredOffers.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No student offers matching your search criteria.
                    </div>
                  ) : (
                    filteredOffers.map((o, idx) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between pt-3 first:pt-0 hover:bg-white/[0.02] p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {o.student?.name}
                              </span>
                              <span className="text-xs text-slate-500">
                                ({o.student?.register_number})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span className="text-white font-medium">
                                🏢 {o.company?.company_name}
                              </span>
                              <span>•</span>
                              <span>{o.job_role}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">
                                {o.ctc_lpa} LPA
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="success" className="text-[11px] py-0.5">
                            ✓ {o.offer_status || "ACCEPTED"}
                          </Badge>
                          {o.student_id && (
                            <Link
                              href={`/students/${o.student_id}`}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 bg-white/80">
              <Button variant="ghost" size="sm" onClick={closeModal} className="text-xs text-slate-500">
                Close Window
              </Button>
              <Link
                href={
                  activeModal === "STUDENTS"
                    ? role === "ADMIN" ? "/admin/students" : role === "PLACEMENT_TEAM" ? "/placement-team/students" : "/manager/students"
                    : activeModal === "COMPANIES"
                    ? role === "ADMIN" ? "/admin/companies" : role === "PLACEMENT_TEAM" ? "/placement-team/companies" : "/manager/companies"
                    : activeModal === "DRIVES"
                    ? role === "ADMIN" ? "/admin/drives" : role === "PLACEMENT_TEAM" ? "/placement-team/drives" : "/manager/drives"
                    : role === "ADMIN" ? "/admin/offers" : role === "PLACEMENT_TEAM" ? "/placement-team/offers" : "/manager/offers"
                }
              >
                <Button size="sm" className="text-xs flex items-center gap-1.5">
                  Open Full Page <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

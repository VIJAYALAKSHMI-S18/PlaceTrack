"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Building2,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Role } from "@/types";
import { CompanyFormModal } from "./CompanyFormModal";

interface CompanyTableProps {
  role: Role;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({ role }) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [industry, setIndustry] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);

  const isAdmin = role === "ADMIN";

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search.trim()) params.append("search", search.trim());
      if (status !== "ALL") params.append("status", status);
      if (industry !== "ALL") params.append("industry", industry);

      const res = await fetch(`/api/companies?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.data || []);
        setTotalPages(json.meta?.totalPages || 1);
        setTotalCount(json.meta?.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCompanies();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, status, industry, page]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete company '${name}'?`)) return;
    try {
      const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCompanies();
      } else {
        const json = await res.json();
        alert(json.message || "Failed to delete company.");
      }
    } catch {
      alert("Error occurred while deleting company.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Companies Directory
          </h1>
          <p className="text-xs font-medium text-[#94A3B8]">
            RECRUITING PARTNERS & JOB OPPORTUNITIES
          </p>
        </div>

        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          {isAdmin ? "Add Company" : "Submit Company for Approval"}
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search Company Name, Location, Industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#6366F1] focus:outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved (Active)</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
          >
            <option value="ALL">All Industries</option>
            <option value="Information Technology & Cloud">IT & Cloud</option>
            <option value="Software & Technology">Software & Technology</option>
            <option value="Enterprise SaaS">Enterprise SaaS</option>
            <option value="Semiconductors & Telecommunications">Semiconductors</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
          </select>
        </div>
      </Card>

      {/* Main Table */}
      <div className="table-container">
        <table className="w-full text-left text-xs">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3.5">COMPANY</th>
              <th className="px-4 py-3.5">LOCATION</th>
              <th className="px-4 py-3.5">INDUSTRY</th>
              <th className="px-4 py-3.5">SIZE</th>
              <th className="px-4 py-3.5">DRIVES / JDS</th>
              <th className="px-4 py-3.5">STATUS</th>
              <th className="px-4 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                  Loading companies...
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                  No companies found.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="table-row">
                  <td className="px-4 py-3.5 font-semibold text-[#F8FAFC]">
                    <Link
                      href={`/companies/${company.id}`}
                      className="flex items-center gap-2 hover:text-[#818CF8]"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E293B] text-[#818CF8]">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span>{company.company_name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#64748B]" />
                      {company.location}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#94A3B8]">
                    {company.industry || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-[#94A3B8]">
                    {company.company_size || "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-[#1E293B] px-2 py-0.5 font-semibold text-[#818CF8]">
                      {company._count?.drives || 0} JDs
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        company.status === "APPROVED"
                          ? "success"
                          : company.status === "PENDING_APPROVAL"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {company.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <Link
                      href={`/companies/${company.id}`}
                      className="inline-flex items-center rounded p-1.5 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                      title="View Company & JDs"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(company.id, company.company_name)}
                        className="inline-flex items-center rounded p-1.5 text-[#94A3B8] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                        title="Delete Company"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-[#1E293B] px-4 py-3 text-xs text-[#94A3B8]">
          <span>
            Showing {companies.length} of {totalCount} companies
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <span className="font-semibold text-[#F8FAFC]">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {isAddOpen && (
        <CompanyFormModal
          isOpen={isAddOpen}
          role={role}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            fetchCompanies();
          }}
        />
      )}
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, Building2, User, Clock, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { formatDate } from "@/lib/utils";

export const CompanyApprovalQueue: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const [approvingSub, setApprovingSub] = useState<any | null>(null);
  const [rejectingSub, setRejectingSub] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/company-submissions?status=${statusFilter}`);
      if (res.ok) {
        const json = await res.json();
        setSubmissions(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!approvingSub) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/company-submissions/${approvingSub.id}/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setApprovingSub(null);
        fetchSubmissions();
      } else {
        alert(json.message || "Approval failed.");
      }
    } catch {
      alert("Error occurred while approving company.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingSub || !rejectionReason.trim()) {
      alert("Rejection reason is mandatory.");
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`/api/company-submissions/${rejectingSub.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });
      const json = await res.json();
      if (json.success) {
        setRejectingSub(null);
        setRejectionReason("");
        fetchSubmissions();
      } else {
        alert(json.message || "Rejection failed.");
      }
    } catch {
      alert("Error occurred while rejecting company.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Company Approval Requests
          </h1>
          <p className="text-xs font-medium text-[#94A3B8]">
            ADMIN REVIEW & VERIFICATION QUEUE
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-[#6366F1] text-white"
                  : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155] hover:text-[#F8FAFC]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="table-container">
        <table className="w-full text-left text-xs">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3.5">COMPANY</th>
              <th className="px-4 py-3.5">SUBMITTED BY</th>
              <th className="px-4 py-3.5">ROLE</th>
              <th className="px-4 py-3.5">SUBMITTED DATE</th>
              <th className="px-4 py-3.5">STATUS</th>
              <th className="px-4 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#94A3B8]">
                  Loading approval requests...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#94A3B8]">
                  No {statusFilter.toLowerCase()} company approval requests found.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id} className="table-row">
                  <td className="px-4 py-3.5 font-semibold text-[#F8FAFC]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E293B] text-[#818CF8]">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div>{sub.company?.company_name}</div>
                        <div className="text-[10px] text-[#64748B]">
                          {sub.company?.location} • {sub.company?.industry || "Tech"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-[#64748B]" />
                      {sub.submittedBy?.name || "Team Member"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="neutral" size="sm">
                      {sub.submittedBy?.role?.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                      {formatDate(sub.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        sub.status === "APPROVED"
                          ? "success"
                          : sub.status === "PENDING"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {sub.status}
                    </Badge>
                    {sub.status === "REJECTED" && sub.rejection_reason && (
                      <p className="mt-1 max-w-xs text-[10px] text-[#EF4444] italic">
                        Reason: {sub.rejection_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <Link
                      href={`/companies/${sub.company_id}`}
                      className="inline-flex items-center rounded p-1.5 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                      title="View Company Details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>

                    {sub.status === "PENDING" && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => setApprovingSub(sub)}
                          className="px-2.5 py-1 text-xs"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setRejectingSub(sub);
                            setRejectionReason("");
                          }}
                          className="px-2.5 py-1 text-xs"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Approve Confirmation Modal */}
      {approvingSub && (
        <Modal
          isOpen={!!approvingSub}
          onClose={() => setApprovingSub(null)}
          title="Approve Company?"
          description={`${approvingSub.company?.company_name} will become visible throughout the placement system.`}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#94A3B8]">
              Approving this company will authorize placement officers and coordinators to schedule drives, evaluate eligible candidate resumes, and record job offers.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setApprovingSub(null)} disabled={processing}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleApprove} isLoading={processing}>
                Approve Company
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal with Mandatory Reason */}
      {rejectingSub && (
        <Modal
          isOpen={!!rejectingSub}
          onClose={() => setRejectingSub(null)}
          title="Reject Company"
          description={`Provide a mandatory reason for rejecting ${rejectingSub.company?.company_name}.`}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#F8FAFC]">
                Rejection Reason *
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Unverified recruitment agency, invalid official domain, or non-compliant placement criteria..."
                className="w-full rounded-lg border border-[#EF4444]/40 bg-[#0F172A] p-3 text-xs text-[#F8FAFC] focus:border-[#EF4444] focus:outline-none"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={() => setRejectingSub(null)} disabled={processing}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processing}
                isLoading={processing}
              >
                Reject Company
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

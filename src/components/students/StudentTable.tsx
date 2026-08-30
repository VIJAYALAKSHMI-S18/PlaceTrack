"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit2,
  ExternalLink,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Role } from "@/types";
import { StudentExcelImportModal } from "./StudentExcelImportModal";
import { StudentFormModal } from "./StudentFormModal";

interface StudentTableProps {
  role: Role;
}

export const StudentTable: React.FC<StudentTableProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "TERMINATED">("ACTIVE");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [studentType, setStudentType] = useState("ALL");
  const [placementStatus, setPlacementStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  const isAdmin = role === "ADMIN";

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        isTerminated: (activeTab === "TERMINATED").toString(),
      });
      if (search.trim()) params.append("search", search.trim());
      if (department !== "ALL") params.append("department", department);
      if (studentType !== "ALL") params.append("studentType", studentType);
      if (placementStatus !== "ALL") params.append("placementStatus", placementStatus);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setStudents(json.data || []);
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
      fetchStudents();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, department, studentType, placementStatus, activeTab, page]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to terminate / soft-delete student '${name}'?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchStudents();
      } else {
        const json = await res.json();
        alert(json.message || "Failed to delete student.");
      }
    } catch {
      alert("Error occurred while deleting student.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            Students Repository
          </h1>
          <p className="text-xs font-medium text-[#94A3B8]">
            MANAGE ACADEMIC RECORDS AND FILES
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="border-[#6366F1]/40 text-[#818CF8] hover:bg-[#6366F1]/10"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Bulk Excel Import
            </Button>
            <Button size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add New Student
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1E293B]">
        <button
          onClick={() => {
            setActiveTab("ACTIVE");
            setPage(1);
          }}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "ACTIVE"
              ? "border-[#6366F1] text-[#818CF8]"
              : "border-transparent text-[#94A3B8] hover:text-[#F8FAFC]"
          }`}
        >
          ACTIVE STUDENTS
        </button>
        <button
          onClick={() => {
            setActiveTab("TERMINATED");
            setPage(1);
          }}
          className={`border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "TERMINATED"
              ? "border-[#EF4444] text-[#EF4444]"
              : "border-transparent text-[#94A3B8] hover:text-[#F8FAFC]"
          }`}
        >
          TERMINATED STUDENTS LIST
        </button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search Name, Reg No, Email, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] pl-9 pr-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#6366F1] focus:outline-none"
            />
          </div>

          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="IT">Information Tech (IT)</option>
            <option value="AIDS">AI & Data Science (AIDS)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="MECH">Mechanical (MECH)</option>
            <option value="EEE">Electrical (EEE)</option>
          </select>

          <select
            value={studentType}
            onChange={(e) => {
              setStudentType(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
          >
            <option value="ALL">All Student Types</option>
            <option value="Regular">Regular</option>
            <option value="Lateral Entry">Lateral Entry</option>
          </select>

          <select
            value={placementStatus}
            onChange={(e) => {
              setPlacementStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#1E293B] bg-[#0F172A] px-3 py-2 text-xs text-[#F8FAFC] focus:border-[#6366F1] focus:outline-none"
          >
            <option value="ALL">All Placement Statuses</option>
            <option value="NOT_PLACED">Not Placed</option>
            <option value="PLACED">Placed</option>
            <option value="MULTIPLE_OFFERS">Multiple Offers</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </Card>

      {/* Main Table */}
      <div className="table-container">
        <table className="w-full text-left text-xs">
          <thead className="table-header">
            <tr>
              <th className="px-4 py-3.5">NAME</th>
              <th className="px-4 py-3.5">REG. NUMBER</th>
              <th className="px-4 py-3.5">DEPARTMENT</th>
              <th className="px-4 py-3.5">EMAIL</th>
              <th className="px-4 py-3.5">PHONE</th>
              <th className="px-4 py-3.5">STATUS</th>
              <th className="px-4 py-3.5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                  Loading students records...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                  No student records found matching your filters.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="table-row">
                  <td className="px-4 py-3.5 font-medium text-[#F8FAFC]">
                    <Link
                      href={`/students/${student.id}`}
                      className="hover:text-[#818CF8] hover:underline"
                    >
                      {student.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#818CF8]">
                    {student.register_number}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-[#1E293B] px-2 py-0.5 font-semibold text-[#94A3B8]">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[#94A3B8]">{student.email}</td>
                  <td className="px-4 py-3.5 text-[#94A3B8]">{student.phone_number}</td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        student.placement_status === "PLACED"
                          ? "success"
                          : student.placement_status === "MULTIPLE_OFFERS"
                          ? "primary"
                          : student.placement_status === "WITHDRAWN"
                          ? "danger"
                          : "neutral"
                      }
                    >
                      {student.placement_status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <Link
                      href={`/students/${student.id}`}
                      className="inline-flex items-center rounded p-1.5 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                      title="View Profile"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    {isAdmin && activeTab === "ACTIVE" && (
                      <>
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="inline-flex items-center rounded p-1.5 text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#818CF8]"
                          title="Edit Student"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="inline-flex items-center rounded p-1.5 text-[#94A3B8] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                          title="Terminate Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
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
            Showing {students.length} of {totalCount} students
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

      {/* Modals */}
      {isImportOpen && (
        <StudentExcelImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={() => {
            setIsImportOpen(false);
            fetchStudents();
          }}
        />
      )}

      {(isAddOpen || editingStudent) && (
        <StudentFormModal
          isOpen={isAddOpen || !!editingStudent}
          student={editingStudent}
          onClose={() => {
            setIsAddOpen(false);
            setEditingStudent(null);
          }}
          onSuccess={() => {
            setIsAddOpen(false);
            setEditingStudent(null);
            fetchStudents();
          }}
        />
      )}
    </div>
  );
};

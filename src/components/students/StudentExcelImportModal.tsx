"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { FileSpreadsheet, Upload, AlertTriangle, CheckCircle2, XCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface StudentExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentExcelImportModal: React.FC<StudentExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setLoading(true);
    setPreview(null);
    setShowErrors(false);

    try {
      const formData = new FormData();
      formData.append("file", selected);

      const res = await fetch("/api/students/import", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setPreview(json.data);
      } else {
        alert(json.message || "Failed to validate Excel spreadsheet.");
      }
    } catch {
      alert("Error occurred while processing Excel file.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!preview?.validRows || preview.validRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit",
          validRows: preview.validRows,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert(json.message || "Successfully imported students.");
        onSuccess();
      } else {
        alert(json.message || "Failed to import students.");
      }
    } catch {
      alert("Error occurred during student import.");
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        name: "Aarav Kumar",
        register_number: "2021CS101",
        department: "CSE",
        student_type: "Regular",
        email: "aarav.kumar@college.edu",
        phone_number: "+91 9876543210",
        sslc_percentage: 92.5,
        hsc_percentage: 89.0,
        ug_percentage: 84.5,
        pg_percentage: "",
        resume_url: "https://example.com/resumes/aarav.pdf",
        self_intro_url: "https://example.com/videos/aarav.mp4",
        linkedin_url: "https://linkedin.com/in/aaravkumar",
        github_url: "https://github.com/aaravkumar",
        portfolio_url: "https://aaravkumar.dev",
      },
      {
        name: "Divya Sharma",
        register_number: "2021AI102",
        department: "AIDS",
        student_type: "Regular",
        email: "divya.sharma@college.edu",
        phone_number: "+91 9876543211",
        sslc_percentage: 95.0,
        hsc_percentage: 91.5,
        ug_percentage: 88.0,
        pg_percentage: "",
        resume_url: "https://example.com/resumes/divya.pdf",
        self_intro_url: "https://example.com/videos/divya.mp4",
        linkedin_url: "https://linkedin.com/in/divyasharma",
        github_url: "https://github.com/divyasharma",
        portfolio_url: "https://divyasharma.dev",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students_Template");
    XLSX.writeFile(wb, "PlaceTrack_Student_Import_Template.xlsx");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Student Excel Import"
      description="Upload an Excel spreadsheet (.xlsx, .xls) conforming to the required 15 columns."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Template download row */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <FileSpreadsheet className="h-4 w-4 text-[#10B981]" />
            <span>Need the official template?</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadSampleTemplate}
            className="text-xs text-[#0284C7]"
          >
            <Download className="h-3.5 w-3.5" /> Download Template
          </Button>
        </div>

        {/* Upload Box */}
        <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white/50 p-6 text-center transition hover:border-[#0284C7] cursor-pointer">
          <Upload className="h-8 w-8 text-[#0284C7]" />
          <span className="mt-2 text-xs font-semibold text-slate-900">
            {file ? file.name : "Click or drag & drop .xlsx or .xls file"}
          </span>
          <span className="text-[10px] text-[#64748B] mt-1">
            Max 5,000 student records per file
          </span>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {loading && (
          <div className="py-4 text-center text-xs text-[#0284C7] animate-pulse">
            Validating columns, checking duplicates and parsing student records...
          </div>
        )}

        {/* Validation Preview Card */}
        {preview && (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Pre-Import Verification Summary
            </h4>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                <div className="text-base font-bold text-slate-900">{preview.totalRows}</div>
                <div className="text-[10px] text-slate-600">Total Rows</div>
              </div>
              <div className="rounded-lg bg-[#10B981]/10 p-2.5 border border-[#10B981]/30">
                <div className="text-base font-bold text-[#10B981]">{preview.validCount}</div>
                <div className="text-[10px] text-[#10B981]">Valid Rows</div>
              </div>
              <div className="rounded-lg bg-[#EF4444]/10 p-2.5 border border-[#EF4444]/30">
                <div className="text-base font-bold text-[#EF4444]">{preview.invalidCount}</div>
                <div className="text-[10px] text-[#EF4444]">Invalid Rows</div>
              </div>
              <div className="rounded-lg bg-[#F59E0B]/10 p-2.5 border border-[#F59E0B]/30">
                <div className="text-base font-bold text-[#F59E0B]">{preview.duplicatesCount}</div>
                <div className="text-[10px] text-[#F59E0B]">Duplicates</div>
              </div>
            </div>

            {/* View Errors Toggle */}
            {preview.invalidRows.length > 0 && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowErrors(!showErrors)}
                  className="w-full border-[#EF4444]/30 text-[#EF4444] text-xs"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {showErrors ? "Hide Error Drill-Down" : `View Errors (${preview.invalidRows.length})`}
                </Button>

                {showErrors && (
                  <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-[#EF4444]/30 bg-white p-3 text-xs space-y-2">
                    {preview.invalidRows.map((inv: any, idx: number) => (
                      <div key={idx} className="border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="font-bold text-[#EF4444]">Row {inv.row} ({inv.data?.name || "Unnamed"}):</span>
                        <ul className="list-disc list-inside text-slate-600 text-[11px] mt-0.5">
                          {inv.errors.map((err: string, eIdx: number) => (
                            <li key={eIdx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={importing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCommit}
            disabled={!preview || preview.validCount === 0 || importing}
            isLoading={importing}
          >
            Import {preview?.validCount ? `${preview.validCount} Students` : "Students"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

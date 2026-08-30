"use client";

import React, { useState } from "react";
import { FileSpreadsheet, FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ExportButtonsProps {
  onExportExcel: () => Promise<void> | void;
  onExportPdf: () => Promise<void> | void;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPdf,
  label = "Export",
  size = "sm",
  className = "",
}) => {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleExcel = async () => {
    setLoadingExcel(true);
    try {
      await onExportExcel();
    } catch (e) {
      console.error(e);
      alert("Failed to export Excel spreadsheet.");
    } finally {
      setLoadingExcel(false);
    }
  };

  const handlePdf = async () => {
    setLoadingPdf(true);
    try {
      await onExportPdf();
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF document.");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleExcel}
        disabled={loadingExcel}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-50 shadow-sm"
        title="Download Excel Spreadsheet (.xlsx)"
      >
        {loadingExcel ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
        )}
        <span>Excel</span>
      </button>

      <button
        onClick={handlePdf}
        disabled={loadingPdf}
        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 hover:border-rose-500/50 disabled:opacity-50 shadow-sm"
        title="Download PDF Document (.pdf)"
      >
        {loadingPdf ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-rose-400" />
        )}
        <span>PDF</span>
      </button>
    </div>
  );
};

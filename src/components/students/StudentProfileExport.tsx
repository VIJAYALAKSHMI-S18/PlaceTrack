"use client";

import React from "react";
import { ExportButtons } from "@/components/common/ExportButtons";
import {
  exportCandidateFullDossierPdf,
  exportCandidateFullDossierExcel,
} from "@/lib/export-utils";

interface StudentProfileExportProps {
  student: any;
}

export const StudentProfileExport: React.FC<StudentProfileExportProps> = ({ student }) => {
  const handleExportExcel = () => {
    exportCandidateFullDossierExcel(student);
  };

  const handleExportPdf = () => {
    exportCandidateFullDossierPdf(student);
  };

  return (
    <div className="flex items-center gap-2">
      <ExportButtons onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
    </div>
  );
};

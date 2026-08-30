import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatLPA, formatDate, parseJsonSafe } from "./utils";

export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  headers: string[];
  data: (string | number)[][];
  orientation?: "portrait" | "landscape";
  columnWidths?: { [key: number]: number };
}

/**
 * Exports tabular data to an Excel (.xlsx) spreadsheet
 */
export function exportTableToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Auto-size columns based on maximum length
  const colWidths = headers.map((header, colIdx) => {
    let maxLen = header.length;
    for (const row of rows) {
      const val = row[colIdx];
      if (val !== undefined && val !== null) {
        maxLen = Math.max(maxLen, String(val).length);
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
  XLSX.writeFile(workbook, cleanFilename);
}

/**
 * Exports tabular data to a professionally formatted PDF document with Rathinam University branding
 */
export function exportTableToPdf({
  title,
  subtitle,
  filename,
  headers,
  data,
  orientation = "landscape",
}: PdfExportOptions) {
  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Rathinam Brand Top Header Banner
  doc.setFillColor(124, 45, 135); // #7C2D87 Royal Purple
  doc.rect(0, 0, pageWidth, 18, "F");

  doc.setFillColor(14, 165, 233); // #0EA5E9 Sky Blue accent line
  doc.rect(0, 18, pageWidth, 1.5, "F");

  // University Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("RATHINAM GLOBAL DEEMED TO BE UNIVERSITY", 14, 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 240, 255);
  doc.text("Placement & Career Development Cell • Enterprise Placement Management", 14, 14);

  // 2. Document Title & Timestamp
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // #0F172A
  doc.text(title, 14, 28);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // #64748B
    doc.text(subtitle, 14, 34);
  }

  const generatedDate = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${generatedDate} | Total Records: ${data.length}`, pageWidth - 14, 28, {
    align: "right",
  });

  // 3. Render Table
  autoTable(doc, {
    head: [headers],
    body: data as any,
    startY: subtitle ? 38 : 34,
    theme: "grid",
    headStyles: {
      fillColor: [124, 45, 135], // #7C2D87
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 18 },
    didDrawPage: (data) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Rathinam Global Deemed to be University — Confidential Institutional Placement Record",
        14,
        pageHeight - 8
      );
      doc.text(`Page ${data.pageNumber}`, pageWidth - 14, pageHeight - 8, {
        align: "right",
      });
    },
  });

  doc.save(cleanFilename);
}

/**
 * Exports a student's complete academic, personal, offers, and recruitment history as a comprehensive PDF dossier
 */
export function exportCandidateFullDossierPdf(student: any) {
  const cleanFilename = `${student.name.replace(/\s+/g, "_")}_Complete_Placement_Dossier.pdf`;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Top Rathinam Brand Banner
  doc.setFillColor(124, 45, 135); // #7C2D87 Royal Purple
  doc.rect(0, 0, pageWidth, 20, "F");

  doc.setFillColor(14, 165, 233); // #0EA5E9 Sky Blue
  doc.rect(0, 20, pageWidth, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("RATHINAM GLOBAL DEEMED TO BE UNIVERSITY", 14, 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 240, 255);
  doc.text("Placement & Career Development Cell • Official Student Placement Dossier", 14, 15);

  // 2. Candidate Header Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 26, pageWidth - 28, 24, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 26, pageWidth - 28, 24, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(student.name, 18, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Register Number: ${student.register_number} | Department: ${student.department} | Class of ${
      student.graduation_year || 2026
    }`,
    18,
    42
  );

  // Status Badge in Header
  const statusColor = student.placement_status === "PLACED" ? [132, 204, 22] : [100, 116, 139];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - 45, 30, 28, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(student.placement_status.replace("_", " "), pageWidth - 31, 35, { align: "center" });

  let currentY = 56;

  // 3. Section: Personal & Academic Records (Side-by-side Tables)
  const personalInfoData = [
    ["Full Name", student.name],
    ["Register Number", student.register_number],
    ["Department", student.department],
    ["Student Type", student.student_type || "Day Scholar"],
    ["Email Address", student.email],
    ["Phone Number", student.phone_number || "9876543210"],
  ];

  const academicInfoData = [
    ["UG Aggregate %", `${student.ug_percentage}%`],
    ["CGPA (10 pt scale)", `${student.cgpa || (student.ug_percentage / 10).toFixed(2)}`],
    ["HSC (12th) %", `${student.hsc_percentage || "N/A"}%`],
    ["SSLC (10th) %", `${student.sslc_percentage || "N/A"}%`],
    ["Standing Backlogs", `${student.backlogs || 0}`],
    ["Graduation Year", `${student.graduation_year || 2026}`],
  ];

  autoTable(doc, {
    head: [["PERSONAL INFORMATION", "DETAILS"]],
    body: personalInfoData,
    startY: currentY,
    tableWidth: 88,
    margin: { left: 14 },
    theme: "grid",
    headStyles: { fillColor: [124, 45, 135], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.8 },
  });

  autoTable(doc, {
    head: [["ACADEMIC RECORDS", "MARKS / SCORE"]],
    body: academicInfoData,
    startY: currentY,
    tableWidth: 88,
    margin: { left: 108 },
    theme: "grid",
    headStyles: { fillColor: [14, 165, 233], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 7.5, cellPadding: 1.8 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Section: Technical & Domain Skills
  const skills: string[] = parseJsonSafe<string[]>(student.skills, []);
  if (skills.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(124, 45, 135);
    doc.text("EXTRACTED TECHNICAL & DOMAIN SKILLS", 14, currentY);

    currentY += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, currentY, pageWidth - 28, 10, 2, 2, "F");
    doc.text(skills.join("  •  "), 18, currentY + 6.5);
    currentY += 15;
  }

  // 5. Section: Verified Job Offers
  const offers = student.offers || [];
  if (offers.length > 0) {
    const offerRows = offers.map((o: any) => [
      o.company?.company_name,
      o.job_role,
      `${o.ctc_lpa} LPA`,
      formatDate(o.offer_date),
      o.offer_status,
    ]);

    autoTable(doc, {
      head: [["HIRING COMPANY", "JOB ROLE", "PACKAGE (CTC)", "OFFER DATE", "STATUS"]],
      body: offerRows,
      startY: currentY,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 7.5, cellPadding: 2 },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 6. Section: Drives Attended History
  const completedEvaluations = (student.evaluations || []).filter(
    (e: any) => e.drive?.company?.status === "APPROVED" && e.drive?.drive_status === "COMPLETED"
  );

  const driveRows = completedEvaluations.map((ev: any, idx: number) => [
    `#${idx + 1}`,
    ev.drive?.company?.company_name,
    ev.drive?.job_title,
    `${ev.drive?.ctc_lpa} LPA`,
    `${ev.ats_score}/100`,
    `${ev.skill_match_score}/50`,
    ev.eligibility_status.replace("_", " "),
  ]);

  autoTable(doc, {
    head: [["#", "RECRUITMENT DRIVE", "JOB ROLE", "CTC", "ATS SCORE", "SKILL MATCH", "ELIGIBILITY"]],
    body: driveRows,
    startY: currentY,
    theme: "grid",
    headStyles: { fillColor: [124, 45, 135], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 7, cellPadding: 1.8 },
    margin: { left: 14, right: 14, bottom: 16 },
    didDrawPage: (data) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Rathinam Global Deemed to be University — Confidential Institutional Student Record",
        14,
        pageHeight - 8
      );
      doc.text(`Page ${data.pageNumber}`, pageWidth - 14, pageHeight - 8, {
        align: "right",
      });
    },
  });

  doc.save(cleanFilename);
}

/**
 * Exports a student's complete profile and drive evaluations to a multi-section Excel file
 */
export function exportCandidateFullDossierExcel(student: any) {
  const cleanFilename = `${student.name.replace(/\s+/g, "_")}_Complete_Placement_Profile.xlsx`;
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Personal & Academic Profile
  const profileData = [
    ["RATHINAM GLOBAL DEEMED TO BE UNIVERSITY - STUDENT PLACEMENT PROFILE"],
    [""],
    ["1. PERSONAL INFORMATION", ""],
    ["Full Name", student.name],
    ["Register Number", student.register_number],
    ["Department", student.department],
    ["Student Type", student.student_type || "Day Scholar"],
    ["Email", student.email],
    ["Phone", student.phone_number || "N/A"],
    ["Placement Status", student.placement_status],
    [""],
    ["2. ACADEMIC RECORDS", ""],
    ["UG Aggregate %", student.ug_percentage],
    ["CGPA (10 pt)", student.cgpa || (student.ug_percentage / 10).toFixed(2)],
    ["HSC (12th) %", student.hsc_percentage || "N/A"],
    ["SSLC (10th) %", student.sslc_percentage || "N/A"],
    ["Standing Backlogs", student.backlogs || 0],
    ["Graduation Year", student.graduation_year || 2026],
    [""],
    ["3. EXTRACTED TECHNICAL SKILLS", ""],
    ["Skills List", parseJsonSafe<string[]>(student.skills, []).join(", ")],
  ];

  const profileWs = XLSX.utils.aoa_to_sheet(profileData);
  profileWs["!cols"] = [{ wch: 28 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, profileWs, "Student Profile");

  // Sheet 2: Placement Offers
  const offers = student.offers || [];
  const offerHeaders = ["Company", "Job Role", "Package (CTC LPA)", "Offer Date", "Status"];
  const offerRows = offers.map((o: any) => [
    o.company?.company_name,
    o.job_role,
    o.ctc_lpa,
    formatDate(o.offer_date),
    o.offer_status,
  ]);
  const offersWs = XLSX.utils.aoa_to_sheet([offerHeaders, ...offerRows]);
  offersWs["!cols"] = [{ wch: 25 }, { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, offersWs, "Job Offers");

  // Sheet 3: Drives Attended History
  const completedEvaluations = (student.evaluations || []).filter(
    (e: any) => e.drive?.company?.status === "APPROVED" && e.drive?.drive_status === "COMPLETED"
  );
  const driveHeaders = [
    "Drive #",
    "Company",
    "Job Title",
    "Package (CTC LPA)",
    "ATS Match Score",
    "Skill Match (/50)",
    "Eligibility Status",
    "Evaluated Date",
  ];
  const driveRows = completedEvaluations.map((ev: any, idx: number) => [
    idx + 1,
    ev.drive?.company?.company_name,
    ev.drive?.job_title,
    ev.drive?.ctc_lpa,
    ev.ats_score,
    ev.skill_match_score,
    ev.eligibility_status,
    formatDate(ev.evaluated_at),
  ]);
  const drivesWs = XLSX.utils.aoa_to_sheet([driveHeaders, ...driveRows]);
  drivesWs["!cols"] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 30 },
    { wch: 18 },
    { wch: 15 },
    { wch: 16 },
    { wch: 22 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, drivesWs, "Drives Attended");

  XLSX.writeFile(workbook, cleanFilename);
}

import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function generateStudentReportData() {
  const students = await prisma.student.findMany({
    where: { deleted_at: null },
    include: {
      offers: {
        include: { company: true },
      },
    },
    orderBy: { register_number: "asc" },
  });

  return students.map((s) => ({
    "Name": s.name,
    "Register Number": s.register_number,
    "Department": s.department,
    "Student Type": s.student_type,
    "Email": s.email,
    "Phone Number": s.phone_number,
    "SSLC %": s.sslc_percentage,
    "HSC %": s.hsc_percentage,
    "UG %": s.ug_percentage,
    "PG %": s.pg_percentage ?? "N/A",
    "CGPA": s.cgpa ?? "N/A",
    "Backlogs": s.backlogs,
    "Placement Status": s.placement_status,
    "Total Offers": s.offers.length,
    "Placed Companies": s.offers.map((o) => o.company.company_name).join(", ") || "None",
    "Highest Offer (LPA)": s.offers.length > 0 ? Math.max(...s.offers.map((o) => o.ctc_lpa)) : "N/A",
  }));
}

export async function generateCompanyReportData() {
  const companies = await prisma.company.findMany({
    where: { deleted_at: null },
    include: {
      _count: {
        select: { drives: true, offers: true },
      },
    },
    orderBy: { company_name: "asc" },
  });

  return companies.map((c) => ({
    "Company Name": c.company_name,
    "Location": c.location,
    "Industry": c.industry || "N/A",
    "Company Size": c.company_size || "N/A",
    "Status": c.status,
    "Contact Person": c.contact_person_name || "N/A",
    "Contact Email": c.contact_person_email || "N/A",
    "Contact Phone": c.contact_person_phone || "N/A",
    "Total Drives": c._count.drives,
    "Total Offers Made": c._count.offers,
  }));
}

export async function generatePlacementReportData() {
  const drives = await prisma.placementDrive.findMany({
    where: { deleted_at: null },
    include: {
      company: true,
      offers: {
        include: { student: true },
      },
      _count: {
        select: { students: true },
      },
    },
    orderBy: { drive_date: "desc" },
  });

  return drives.map((d) => {
    const ctcs = d.offers.map((o) => o.ctc_lpa);
    const highest = ctcs.length > 0 ? Math.max(...ctcs) : 0;
    const avg = ctcs.length > 0 ? Math.round((ctcs.reduce((a, b) => a + b, 0) / ctcs.length) * 100) / 100 : 0;

    return {
      "Drive Title": d.job_title,
      "Company": d.company.company_name,
      "Drive Date": d.drive_date ? d.drive_date.toISOString().split("T")[0] : "N/A",
      "Location": d.drive_location || "N/A",
      "Type": d.drive_type,
      "Status": d.drive_status,
      "Base CTC (LPA)": d.ctc_lpa ?? "N/A",
      "Candidates Participated": d._count.students,
      "Total Offers Given": d.offers.length,
      "Highest CTC (LPA)": highest || "N/A",
      "Average CTC (LPA)": avg || "N/A",
    };
  });
}

export function exportToExcelBuffer(data: any[], sheetName: string = "Report"): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function exportToCsvString(data: any[]): string {
  const worksheet = XLSX.utils.json_to_sheet(data);
  return XLSX.utils.sheet_to_csv(worksheet);
}

import { NextRequest, NextResponse } from "next/server";
import { requireApiRole, handleAuthError } from "@/lib/rbac";
import { validateExcelImport, commitExcelImport } from "@/services/student.service";
import * as XLSX from "xlsx";
import { logAudit } from "@/lib/audit";

function normalizeColumnName(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean.includes("rollno") || clean.includes("regno") || clean.includes("registernumber") || clean === "roll" || clean === "reg") {
    return "register_number";
  }
  if (clean === "name" || clean.includes("studentname") || clean.includes("fullname")) {
    return "name";
  }
  if (clean.includes("dept") || clean.includes("department") || clean.includes("branch")) {
    return "department";
  }
  if (clean.includes("studenttype") || clean.includes("type")) {
    return "student_type";
  }
  if (clean.includes("collegeemail") || clean.includes("personalemail") || clean === "email" || clean.includes("emailid")) {
    return "email";
  }
  if (clean.includes("mobile") || clean.includes("phone") || clean.includes("contact")) {
    return "phone_number";
  }
  if (clean.includes("sslc") || clean.includes("10th")) {
    return "sslc_percentage";
  }
  if (clean.includes("hsc") || clean.includes("12th") || clean.includes("puc") || clean.includes("diploma")) {
    return "hsc_percentage";
  }
  if (clean.includes("ug") || clean.includes("degree") || clean.includes("btech") || clean.includes("be") || clean.includes("graduationpercentage")) {
    return "ug_percentage";
  }
  if (clean.includes("pg") || clean.includes("master") || clean.includes("mtech") || clean.includes("mba")) {
    return "pg_percentage";
  }
  if (clean.includes("resume") || clean.includes("cv")) {
    return "resume_url";
  }
  if (clean.includes("selfintro") || clean.includes("video")) {
    return "self_intro_url";
  }
  if (clean.includes("linkedin")) {
    return "linkedin_url";
  }
  if (clean.includes("github") || clean.includes("git")) {
    return "github_url";
  }
  if (clean.includes("portfolio") || clean.includes("website")) {
    return "portfolio_url";
  }
  if (clean.includes("photo") || clean.includes("image") || clean.includes("picture") || clean.includes("avatar")) {
    return "photo_url";
  }
  if (clean.includes("placementstatus") || clean.includes("status")) {
    return "placement_status";
  }
  return clean;
}

export async function POST(req: NextRequest) {
  try {
    // Critical RBAC: Admin only
    const user = await requireApiRole(["ADMIN"]);

    const contentType = req.headers.get("content-type") || "";

    // Case 1: JSON body (commit action or pre-parsed rows)
    if (contentType.includes("application/json")) {
      const body = await req.json();

      if (body.action === "commit" && Array.isArray(body.validRows)) {
        const imported = await commitExcelImport(body.validRows);

        await logAudit({
          userId: user.id,
          userEmail: user.email,
          role: user.role,
          action: "IMPORTED_STUDENTS",
          entity: "Student",
          newValue: { importedCount: imported.length },
        });

        return NextResponse.json({
          success: true,
          message: `Successfully imported ${imported.length} student records.`,
          data: { importedCount: imported.length },
        });
      }

      if (Array.isArray(body.rows)) {
        const preview = await validateExcelImport(body.rows);
        return NextResponse.json({
          success: true,
          data: preview,
        });
      }
    }

    // Case 2: Multipart Form Data (.xlsx / .xls file upload)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!rawData || rawData.length === 0) {
      return NextResponse.json(
        { success: false, message: "The uploaded spreadsheet is empty." },
        { status: 400 }
      );
    }

    // Step 1: Detect Header Row Automatically (looks within first 10 rows)
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(rawData.length, 10); i++) {
      const row = rawData[i];
      if (Array.isArray(row) && row.some((cell) => {
        const str = String(cell || "").toLowerCase();
        return (
          str.includes("name") ||
          str.includes("roll") ||
          str.includes("register") ||
          str.includes("department")
        );
      })) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Could not locate a valid header row containing 'Name' or 'Roll No / Register Number'.",
        },
        { status: 422 }
      );
    }

    const rawHeaders = rawData[headerRowIdx] || [];
    const normalizedHeaders = rawHeaders.map((h) => normalizeColumnName(String(h || "")));

    // Convert raw tabular data to normalized objects
    const parsedRows: any[] = [];
    for (let r = headerRowIdx + 1; r < rawData.length; r++) {
      const row = rawData[r];
      if (!row || !Array.isArray(row) || row.length === 0) continue;

      const rowObj: Record<string, any> = {};
      let hasData = false;

      normalizedHeaders.forEach((normKey, colIdx) => {
        const val = row[colIdx];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          rowObj[normKey] = val;
          hasData = true;
        }
      });

      // Default fallbacks if omitted
      if (hasData) {
        if (!rowObj.student_type) rowObj.student_type = "Regular";
        if (rowObj.sslc_percentage) rowObj.sslc_percentage = parseFloat(String(rowObj.sslc_percentage));
        if (rowObj.hsc_percentage) rowObj.hsc_percentage = parseFloat(String(rowObj.hsc_percentage));
        if (rowObj.ug_percentage) rowObj.ug_percentage = parseFloat(String(rowObj.ug_percentage));
        if (rowObj.pg_percentage) rowObj.pg_percentage = parseFloat(String(rowObj.pg_percentage));

        parsedRows.push(rowObj);
      }
    }

    if (parsedRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data rows found below the header." },
        { status: 422 }
      );
    }

    // Step 2: Validate through Excel import engine
    const preview = await validateExcelImport(parsedRows);

    return NextResponse.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

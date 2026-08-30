import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/rbac";
import { validateExcelImport, commitExcelImport } from "@/services/student.service";
import * as XLSX from "xlsx";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    // Critical RBAC: Admin only
    const user = await requireRole(["ADMIN"]);

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
    const rawRows = XLSX.utils.sheet_to_json(sheet);

    if (!rawRows || rawRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "The uploaded spreadsheet is empty." },
        { status: 400 }
      );
    }

    // Validate expected columns
    const firstRow = rawRows[0] as Record<string, any>;
    const requiredKeys = [
      "name",
      "register_number",
      "department",
      "student_type",
      "email",
      "phone_number",
      "sslc_percentage",
      "hsc_percentage",
      "ug_percentage",
    ];

    const missingColumns = requiredKeys.filter((key) => !(key in firstRow));
    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required Excel columns: ${missingColumns.join(", ")}`,
        },
        { status: 422 }
      );
    }

    const preview = await validateExcelImport(rawRows);

    return NextResponse.json({
      success: true,
      data: preview,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

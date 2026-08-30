import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { generateStudentReportData, exportToExcelBuffer, exportToCsvString } from "@/services/report.service";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const format = req.nextUrl.searchParams.get("format") || "json";
    const data = await generateStudentReportData();

    if (format === "xlsx") {
      const buffer = exportToExcelBuffer(data, "Students");
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="students_report_${Date.now()}.xlsx"`,
        },
      });
    }

    if (format === "csv") {
      const csv = exportToCsvString(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="students_report_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

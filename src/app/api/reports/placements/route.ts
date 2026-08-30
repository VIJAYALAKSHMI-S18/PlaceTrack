import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { generatePlacementReportData, exportToExcelBuffer, exportToCsvString } from "@/services/report.service";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const format = req.nextUrl.searchParams.get("format") || "json";
    const data = await generatePlacementReportData();

    if (format === "xlsx") {
      const buffer = exportToExcelBuffer(data, "Placements");
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="placements_report_${Date.now()}.xlsx"`,
        },
      });
    }

    if (format === "csv") {
      const csv = exportToCsvString(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="placements_report_${Date.now()}.csv"`,
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

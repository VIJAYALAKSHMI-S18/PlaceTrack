import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/rbac";
import { getCompanySubmissions } from "@/services/company.service";

export async function GET(req: NextRequest) {
  try {
    // Admin only view for company approval queue
    await requireRole(["ADMIN"]);
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const submissions = await getCompanySubmissions(status);

    return NextResponse.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

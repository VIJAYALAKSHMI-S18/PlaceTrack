import { NextResponse } from "next/server";
import { requireApiRole, handleAuthError } from "@/lib/rbac";
import { getAdminDashboardStats } from "@/services/dashboard.service";

export async function GET() {
  try {
    await requireApiRole(["ADMIN"]);
    const stats = await getAdminDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

import { NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/rbac";
import { getManagerDashboardStats } from "@/services/dashboard.service";

export async function GET() {
  try {
    await requireRole(["MANAGER", "ADMIN"]);
    const stats = await getManagerDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

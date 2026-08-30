import { NextResponse } from "next/server";
import { requireApiRole, handleAuthError } from "@/lib/rbac";
import { getManagerDashboardStats } from "@/services/dashboard.service";

export async function GET() {
  try {
    await requireApiRole(["MANAGER", "ADMIN"]);
    const stats = await getManagerDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

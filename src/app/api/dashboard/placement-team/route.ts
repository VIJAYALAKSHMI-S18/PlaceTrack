import { NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { getPlacementTeamDashboardStats } from "@/services/dashboard.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const stats = await getPlacementTeamDashboardStats(user.id);
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

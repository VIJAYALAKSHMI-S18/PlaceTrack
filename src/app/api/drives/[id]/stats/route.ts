import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { calculateDriveStatistics } from "@/services/drive.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
    const stats = await calculateDriveStatistics(params.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

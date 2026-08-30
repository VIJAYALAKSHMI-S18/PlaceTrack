import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import { evaluateAllStudentsForDrive } from "@/services/drive.service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin or Placement team can trigger bulk evaluation
    await requireAuth();
    const result = await evaluateAllStudentsForDrive(params.id);

    return NextResponse.json({
      success: true,
      message: `Evaluated ${result.totalEvaluated} students against this placement drive.`,
      data: result,
    });
  } catch (error: any) {
    return handleAuthError(error);
  }
}

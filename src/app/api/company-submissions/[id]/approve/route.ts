import { NextRequest, NextResponse } from "next/server";
import { requireApiRole, handleAuthError } from "@/lib/rbac";
import { approveCompanySubmission } from "@/services/company.service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Critical RBAC: Only Admin can approve companies
    const user = await requireApiRole(["ADMIN"]);
    const result = await approveCompanySubmission(params.id, user);

    return NextResponse.json({
      success: true,
      message: `Company '${result.company.company_name}' has been approved and is now active.`,
      data: result,
    });
  } catch (error: any) {
    return handleAuthError(error);
  }
}

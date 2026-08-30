import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/rbac";
import { rejectCompanySubmission } from "@/services/company.service";
import { companyRejectSchema } from "@/validators/company.validator";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Critical RBAC: Only Admin can reject companies
    const user = await requireRole(["ADMIN"]);
    const body = await req.json();

    const validated = companyRejectSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Rejection reason is mandatory.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await rejectCompanySubmission(params.id, validated.data.rejection_reason, user);

    return NextResponse.json({
      success: true,
      message: `Company '${result.company.company_name}' has been rejected.`,
      data: result,
    });
  } catch (error: any) {
    return handleAuthError(error);
  }
}

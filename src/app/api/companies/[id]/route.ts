import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireApiRole, handleAuthError, ForbiddenError } from "@/lib/rbac";
import { getCompanyById, updateCompany, softDeleteCompany } from "@/services/company.service";
import { companyUpdateSchema } from "@/validators/company.validator";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireApiAuth();
    const company = await getCompanyById(params.id);
    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireApiAuth();
    const existing = await getCompanyById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Company not found." },
        { status: 404 }
      );
    }

    // Critical RBAC: Manager cannot edit approved companies
    if (user.role === "MANAGER") {
      throw new ForbiddenError("Managers do not have permission to edit companies.");
    }

    const body = await req.json();
    const validated = companyUpdateSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await updateCompany(params.id, validated.data, user);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Company updated successfully.",
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Critical RBAC: Only ADMIN can delete companies. Manager and Placement Team receive 403.
    const user = await requireApiRole(["ADMIN"]);
    const deleted = await softDeleteCompany(params.id, user);

    return NextResponse.json({
      success: true,
      data: deleted,
      message: "Company deleted successfully.",
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

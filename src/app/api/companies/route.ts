import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireApiRole, handleAuthError } from "@/lib/rbac";
import { getCompanies, createCompany } from "@/services/company.service";
import { companyCreateSchema } from "@/validators/company.validator";

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiAuth();
    const searchParams = req.nextUrl.searchParams;

    const filters = {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      industry: searchParams.get("industry") || undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "10", 10),
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      onlyApproved: searchParams.get("onlyApproved") === "true",
    };

    const result = await getCompanies(filters);
    return NextResponse.json({
      success: true,
      data: result.companies,
      meta: result.meta,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only Admin and Placement Team can create/submit a company (Manager has view-only access)
    const user = await requireApiRole(["ADMIN", "PLACEMENT_TEAM"]);
    const body = await req.json();

    const validated = companyCreateSchema.safeParse(body);
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

    const company = await createCompany(validated.data, user);

    const message =
      user.role === "ADMIN"
        ? "Company created and approved successfully."
        : "Company submitted for Admin approval.";

    return NextResponse.json(
      {
        success: true,
        data: company,
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}

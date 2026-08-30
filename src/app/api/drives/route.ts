import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole, handleAuthError } from "@/lib/rbac";
import { getPlacementDrives, createPlacementDrive } from "@/services/drive.service";
import { driveCreateSchema } from "@/validators/drive.validator";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const searchParams = req.nextUrl.searchParams;

    const filters = {
      search: searchParams.get("search") || undefined,
      companyId: searchParams.get("companyId") || undefined,
      driveStatus: searchParams.get("driveStatus") || undefined,
      opportunityStatus: searchParams.get("opportunityStatus") || undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "10", 10),
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const result = await getPlacementDrives(filters);
    return NextResponse.json({
      success: true,
      data: result.drives,
      meta: result.meta,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin or Placement Team can create drives
    const user = await requireRole(["ADMIN", "PLACEMENT_TEAM"]);
    const body = await req.json();

    const validated = driveCreateSchema.safeParse(body);
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

    const drive = await createPlacementDrive(validated.data, user.id);

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "CREATED_DRIVE",
      entity: "PlacementDrive",
      entityId: drive.id,
      newValue: { job_title: drive.job_title, company_id: drive.company_id },
    });

    return NextResponse.json(
      {
        success: true,
        data: drive,
        message: "Placement drive created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}

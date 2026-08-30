import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireApiRole, handleAuthError, ForbiddenError } from "@/lib/rbac";
import { getPlacementDriveById, updatePlacementDrive } from "@/services/drive.service";
import { driveUpdateSchema } from "@/validators/drive.validator";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireApiAuth();
    const drive = await getPlacementDriveById(params.id);
    if (!drive) {
      return NextResponse.json(
        { success: false, message: "Placement drive not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: drive,
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

    // Critical RBAC: Manager cannot edit placement drives
    if (user.role === "MANAGER") {
      throw new ForbiddenError("Managers do not have permission to edit placement drives.");
    }

    const body = await req.json();
    const validated = driveUpdateSchema.safeParse(body);
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

    const updated = await updatePlacementDrive(params.id, validated.data);

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "UPDATED_DRIVE",
      entity: "PlacementDrive",
      entityId: params.id,
      newValue: validated.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Placement drive updated successfully.",
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
    // Critical RBAC: Only Admin can delete placement drives
    const user = await requireApiRole(["ADMIN"]);

    const deleted = await prisma.placementDrive.update({
      where: { id: params.id },
      data: { deleted_at: new Date() },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "DELETED_DRIVE",
      entity: "PlacementDrive",
      entityId: params.id,
    });

    return NextResponse.json({
      success: true,
      data: deleted,
      message: "Placement drive deleted/archived successfully.",
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

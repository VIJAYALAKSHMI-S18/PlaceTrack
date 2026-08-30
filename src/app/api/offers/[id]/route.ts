import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireApiRole, handleAuthError, ForbiddenError } from "@/lib/rbac";
import { updateOffer, syncStudentPlacementStatus } from "@/services/offer.service";
import { offerUpdateSchema } from "@/validators/offer.validator";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireApiAuth();

    // Critical RBAC: Manager cannot edit offers
    if (user.role === "MANAGER") {
      throw new ForbiddenError("Managers do not have permission to modify offer records.");
    }

    const body = await req.json();
    const validated = offerUpdateSchema.safeParse(body);
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

    const updated = await updateOffer(params.id, validated.data, user);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Offer updated successfully.",
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
    // Only Admin can delete offers
    const user = await requireApiRole(["ADMIN"]);
    const offer = await prisma.offer.findUnique({ where: { id: params.id } });
    if (!offer) {
      return NextResponse.json({ success: false, message: "Offer not found." }, { status: 404 });
    }

    await prisma.offer.delete({ where: { id: params.id } });
    await syncStudentPlacementStatus(offer.student_id);

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "DELETED_OFFER",
      entity: "Offer",
      entityId: params.id,
    });

    return NextResponse.json({
      success: true,
      message: "Offer deleted and student placement status synchronized.",
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

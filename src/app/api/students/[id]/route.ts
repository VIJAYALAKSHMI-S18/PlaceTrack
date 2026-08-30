import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireApiRole, handleAuthError } from "@/lib/rbac";
import { getStudentById, updateStudent, softDeleteStudent } from "@/services/student.service";
import { studentUpdateSchema } from "@/validators/student.validator";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireApiAuth();
    const student = await getStudentById(params.id);
    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: student,
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
    // Critical RBAC: Only ADMIN can edit students. Managers and Placement Team receive 403.
    const user = await requireApiRole(["ADMIN"]);
    const body = await req.json();

    const validated = studentUpdateSchema.safeParse(body);
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

    const updated = await updateStudent(params.id, validated.data);

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "UPDATED_STUDENT",
      entity: "Student",
      entityId: params.id,
      newValue: validated.data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Student updated successfully.",
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
    // Critical RBAC: Only ADMIN can delete students
    const user = await requireApiRole(["ADMIN"]);
    const deleted = await softDeleteStudent(params.id);

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "DELETED_STUDENT",
      entity: "Student",
      entityId: params.id,
    });

    return NextResponse.json({
      success: true,
      data: deleted,
      message: "Student marked as terminated / soft-deleted.",
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

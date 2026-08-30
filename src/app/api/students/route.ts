import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireApiRole, handleAuthError } from "@/lib/rbac";
import { getStudents, createStudent } from "@/services/student.service";
import { studentCreateSchema } from "@/validators/student.validator";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiAuth();
    const searchParams = req.nextUrl.searchParams;

    const filters = {
      search: searchParams.get("search") || undefined,
      department: searchParams.get("department") || undefined,
      studentType: searchParams.get("studentType") || undefined,
      placementStatus: searchParams.get("placementStatus") || undefined,
      isTerminated: searchParams.get("isTerminated") === "true",
      page: parseInt(searchParams.get("page") || "1", 10),
      limit: parseInt(searchParams.get("limit") || "10", 10),
      sortBy: searchParams.get("sortBy") || "created_at",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const result = await getStudents(filters);
    return NextResponse.json({
      success: true,
      data: result.students,
      meta: result.meta,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only Admin can create individual student records
    const user = await requireApiRole(["ADMIN"]);
    const body = await req.json();

    const validated = studentCreateSchema.safeParse(body);
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

    const student = await createStudent(validated.data);

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "CREATED_STUDENT",
      entity: "Student",
      entityId: student.id,
      newValue: { name: student.name, register_number: student.register_number },
    });

    return NextResponse.json(
      {
        success: true,
        data: student,
        message: "Student created successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "A student with this register number or email already exists.",
        },
        { status: 409 }
      );
    }
    return handleAuthError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/validators/auth.validator";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input fields.",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: validated.data.email.toLowerCase() },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(validated.data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      departmentId: user.departmentId,
      phone: user.phone,
    };

    await setSessionCookie(sessionPayload);

    // Determine role redirect path
    const redirectUrl =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.role === "MANAGER"
        ? "/manager/dashboard"
        : "/placement-team/dashboard";

    try {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        role: user.role,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
      });
    } catch (auditErr) {
      console.warn("Non-fatal audit log warning on login:", auditErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        user: sessionPayload,
        redirectUrl,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "An unexpected error occurred during login.",
      },
      { status: 500 }
    );
  }
}

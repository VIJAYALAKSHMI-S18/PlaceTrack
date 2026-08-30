import { NextRequest, NextResponse } from "next/server";
import { requireRole, handleAuthError } from "@/lib/rbac";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: "default",
          ats_skill_weight: 50,
          ats_semantic_weight: 20,
          ats_education_weight: 10,
          ats_experience_weight: 10,
          ats_project_weight: 10,
          default_ats_threshold: 70,
          conditional_tolerance: 5,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Critical RBAC: Only Admin can modify settings
    const user = await requireRole(["ADMIN"]);
    const body = await req.json();

    const updated = await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: {
        ats_skill_weight: body.ats_skill_weight !== undefined ? Number(body.ats_skill_weight) : undefined,
        ats_semantic_weight: body.ats_semantic_weight !== undefined ? Number(body.ats_semantic_weight) : undefined,
        ats_education_weight: body.ats_education_weight !== undefined ? Number(body.ats_education_weight) : undefined,
        ats_experience_weight: body.ats_experience_weight !== undefined ? Number(body.ats_experience_weight) : undefined,
        ats_project_weight: body.ats_project_weight !== undefined ? Number(body.ats_project_weight) : undefined,
        default_ats_threshold: body.default_ats_threshold !== undefined ? Number(body.default_ats_threshold) : undefined,
        conditional_tolerance: body.conditional_tolerance !== undefined ? Number(body.conditional_tolerance) : undefined,
      },
      create: {
        id: "default",
        ats_skill_weight: Number(body.ats_skill_weight || 50),
        ats_semantic_weight: Number(body.ats_semantic_weight || 20),
        ats_education_weight: Number(body.ats_education_weight || 10),
        ats_experience_weight: Number(body.ats_experience_weight || 10),
        ats_project_weight: Number(body.ats_project_weight || 10),
        default_ats_threshold: Number(body.default_ats_threshold || 70),
        conditional_tolerance: Number(body.conditional_tolerance || 5),
      },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      action: "UPDATED_SETTINGS",
      entity: "SystemSettings",
      newValue: body,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "System settings updated successfully.",
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

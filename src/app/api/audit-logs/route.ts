import { NextRequest, NextResponse } from "next/server";
import { requireApiRole, handleAuthError } from "@/lib/rbac";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Critical RBAC: Only Admin can view audit logs
    await requireApiRole(["ADMIN"]);

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const action = searchParams.get("action") || undefined;
    const entity = searchParams.get("entity") || undefined;

    const where: any = {};
    if (action && action !== "ALL") where.action = action;
    if (entity && entity !== "ALL") where.entity = entity;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

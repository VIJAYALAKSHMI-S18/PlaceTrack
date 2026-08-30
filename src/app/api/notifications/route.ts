import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleAuthError } from "@/lib/rbac";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { target_role: user.role },
          { target_user_id: user.id },
          { target_role: null, target_user_id: null },
        ],
      },
      orderBy: { created_at: "desc" },
      take: 20,
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { target_role: user.role },
            { target_user_id: user.id },
            { target_role: null, target_user_id: null },
          ],
        },
        data: { is_read: true },
      });
    } else if (body.id) {
      await prisma.notification.update({
        where: { id: body.id },
        data: { is_read: true },
      });
    }

    return NextResponse.json({ success: true, message: "Notifications updated." });
  } catch (error) {
    return handleAuthError(error);
  }
}

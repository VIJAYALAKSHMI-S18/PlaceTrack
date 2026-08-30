import prisma from "@/lib/prisma";
import { Role } from "@/types";

export interface CreateNotificationParams {
  title: string;
  message: string;
  type: string;
  targetRole?: Role | string | null;
  targetUserId?: string | null;
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        title: params.title,
        message: params.message,
        type: params.type,
        target_role: params.targetRole || null,
        target_user_id: params.targetUserId || null,
      },
    });
  } catch (error) {
    console.error("Notification creation error:", error);
  }
}

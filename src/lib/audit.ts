import prisma from "@/lib/prisma";
import { Role } from "@/types";

export interface LogAuditParams {
  userId?: string | null;
  userEmail?: string | null;
  role?: Role | string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  ipAddress?: string | null;
  oldValue?: any;
  newValue?: any;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: params.userId || null,
        user_email: params.userEmail || null,
        role: params.role || null,
        action: params.action,
        entity: params.entity,
        entity_id: params.entityId || null,
        ip_address: params.ipAddress || null,
        old_value: params.oldValue ? JSON.stringify(params.oldValue) : null,
        new_value: params.newValue ? JSON.stringify(params.newValue) : null,
      },
    });
  } catch (error) {
    // Non-blocking for primary transaction, log to console
    console.error("Audit log creation error:", error);
  }
}

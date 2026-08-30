import { NextResponse } from "next/server";
import { removeSessionCookie, getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (user) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        role: user.role,
        action: "LOGOUT",
        entity: "User",
        entityId: user.id,
      });
    }
    await removeSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to logout.",
      },
      { status: 500 }
    );
  }
}

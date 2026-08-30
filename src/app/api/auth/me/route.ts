import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: user,
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    let unreadNotificationsCount = 0;
    try {
      unreadNotificationsCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false },
      });
    } catch {
      unreadNotificationsCount = 0;
    }

    return NextResponse.json({
      user,
      unreadNotificationsCount,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to report content" }, { status: 401 });
    }

    const { targetType, targetId, reason, details } = await request.json();

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: "Target type, target ID, and reason are required." },
        { status: 400 }
      );
    }

    const report = await prisma.contentReport.create({
      data: {
        reporterId: user.id,
        targetType,
        targetId,
        reason,
        details: details || null,
        status: "PENDING",
      },
    });

    // Notify moderators
    const moderators = await prisma.user.findMany({
      where: { role: { in: ["MODERATOR", "ADMIN"] } },
    });
    for (const mod of moderators) {
      await prisma.notification.create({
        data: {
          userId: mod.id,
          title: "New Content Report Flagged",
          message: `${user.name} reported a ${targetType.toLowerCase()} for: "${reason}".`,
          link: "/moderator",
          type: "INFO",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted. Thank you for helping keep NIT Andhra Pradesh safe.",
      report,
    });
  } catch (error) {
    console.error("Submit report error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

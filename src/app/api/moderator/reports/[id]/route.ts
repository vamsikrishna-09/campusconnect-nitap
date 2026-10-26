import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MODERATOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Moderator or Administrator access required" }, { status: 403 });
    }

    const report = await prisma.contentReport.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const { action, resolutionNotes, removeContent } = await request.json();

    if (!action || !["DISMISS", "ACTION_TAKEN"].includes(action)) {
      return NextResponse.json({ error: "Action must be DISMISS or ACTION_TAKEN" }, { status: 400 });
    }

    const updatedReport = await prisma.contentReport.update({
      where: { id: params.id },
      data: {
        status: action === "DISMISS" ? "DISMISSED" : "ACTION_TAKEN",
        reviewedById: user.id,
        resolutionNotes: resolutionNotes || (action === "DISMISS" ? "Report dismissed after review." : "Content flagged and moderation action executed."),
      },
    });

    // If removeContent requested and target is post
    if (action === "ACTION_TAKEN" && removeContent) {
      if (report.targetType === "POST") {
        await prisma.communityPost.updateMany({
          where: { id: report.targetId },
          data: { status: "REMOVED" },
        });
      } else if (report.targetType === "COMMENT") {
        await prisma.comment.deleteMany({
          where: { id: report.targetId },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Report marked as ${updatedReport.status}`,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Resolve report error:", error);
    return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 });
  }
}

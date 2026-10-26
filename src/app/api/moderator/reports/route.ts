import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MODERATOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Moderator or Administrator access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL"; // ALL, PENDING, DISMISSED, ACTION_TAKEN

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    const reports = await prisma.contentReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, department: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Fetch moderator reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

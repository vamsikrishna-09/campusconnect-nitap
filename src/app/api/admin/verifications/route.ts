import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status !== "ALL") {
      where.verificationStatus = status;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        department: true,
        graduationYear: true,
        role: true,
        verificationStatus: true,
        idCardUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch verifications error:", error);
    return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
  }
}

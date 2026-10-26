import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
    }

    const { status } = await request.json(); // VERIFIED or REJECTED
    if (!status || !["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status must be VERIFIED or REJECTED" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { verificationStatus: status },
      select: { id: true, name: true, email: true, verificationStatus: true },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        title: status === "VERIFIED" ? "Campus Verification Approved! 🎉" : "Verification Rejected",
        message:
          status === "VERIFIED"
            ? "Your student identity has been verified by the institute administrator. You now have full community access."
            : "Your student verification was not approved. Please visit the student affairs office with your physical ID card.",
        link: "/profile",
        type: "VERIFICATION",
      },
    });

    return NextResponse.json({
      success: true,
      message: `User marked as ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update verification error:", error);
    return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 });
  }
}

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
      return NextResponse.json({ error: "Unauthorized. Administrator access required." }, { status: 403 });
    }

    const { action, verificationNotes } = await request.json();

    if (!action || !["VERIFY", "REJECT", "SUSPEND"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be VERIFY, REJECT, or SUSPEND." },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    let nextStatus = "VERIFIED";
    if (action === "REJECT") nextStatus = "REJECTED";
    if (action === "SUSPEND") nextStatus = "SUSPENDED";

    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        status: nextStatus,
        verificationNotes: verificationNotes || null,
        verifiedByAdminId: user.id,
        verifiedAt: new Date(),
      },
    });

    // Notify the campaign creator
    const message =
      action === "VERIFY"
        ? `Your campaign "${campaign.title}" has been verified by Administration and is now live for fundraising!`
        : action === "REJECT"
        ? `Your campaign "${campaign.title}" was not approved. Notes: ${verificationNotes || "Contact administration."}`
        : `Your campaign "${campaign.title}" has been suspended pending review.`;

    await prisma.notification.create({
      data: {
        userId: campaign.userId,
        title: `Campaign ${nextStatus}`,
        message,
        link: `/philanthropy/${campaign.id}`,
        type: "PHILANTHROPY",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Campaign successfully marked as ${nextStatus}`,
      campaign: updated,
    });
  } catch (error) {
    console.error("Verify campaign error:", error);
    return NextResponse.json({ error: "Failed to verify campaign" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true, department: true, email: true },
        },
        verifiedBy: {
          select: { id: true, name: true, department: true },
        },
        donations: {
          where: { status: "SUCCESS" },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            donorName: true,
            amount: true,
            isAnonymous: true,
            message: true,
            createdAt: true,
            transactionRef: true,
            paymentMethod: true,
          },
        },
        updates: {
          orderBy: { postedAt: "desc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const isOrganizer = user?.id === campaign.userId;

    // Mask sensitive donor information
    const sanitizedDonations = campaign.donations.map((d) => ({
      ...d,
      donorName: d.isAnonymous && !isAdmin && !isOrganizer ? "Anonymous Supporter" : d.donorName,
    }));

    const percentage = Math.min(Math.round((campaign.raisedAmount / campaign.targetAmount) * 100), 100);

    return NextResponse.json({
      campaign: {
        ...campaign,
        donations: sanitizedDonations,
        percentage,
        isOrganizer,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("Fetch campaign details error:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

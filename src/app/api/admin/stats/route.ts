import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      pendingVerifications,
      totalEvents,
      totalRegistrations,
      openLostFound,
      resolvedLostFound,
      totalPosts,
      verifiedCampaigns,
      pendingCampaigns,
      donationsAgg,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { verificationStatus: "PENDING" } }),
      prisma.event.count(),
      prisma.eventRegistration.count({ where: { status: "CONFIRMED" } }),
      prisma.lostAndFoundItem.count({ where: { status: "OPEN" } }),
      prisma.lostAndFoundItem.count({ where: { status: "RESOLVED" } }),
      prisma.communityPost.count({ where: { status: "ACTIVE" } }),
      prisma.campaign.count({ where: { status: "VERIFIED" } }),
      prisma.campaign.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.donation.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.contentReport.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        pendingVerifications,
        totalEvents,
        totalRegistrations,
        openLostFound,
        resolvedLostFound,
        totalPosts,
        verifiedCampaigns,
        pendingCampaigns,
        totalDonationsCount: donationsAgg._count,
        totalRaised: donationsAgg._sum.amount || 0,
        pendingReports,
      },
    });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

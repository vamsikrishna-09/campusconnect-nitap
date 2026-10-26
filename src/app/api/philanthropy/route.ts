import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "ALL";
    const status = searchParams.get("status") || "ALL"; // ALL, VERIFIED, PENDING_REVIEW, etc.
    const myCampaigns = searchParams.get("myCampaigns") === "true";

    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Non-admins only see VERIFIED or COMPLETED campaigns unless filtering own campaigns
    if (!isAdmin && !myCampaigns) {
      where.status = { in: ["VERIFIED", "COMPLETED", "ACTIVE"] };
    } else if (status !== "ALL") {
      where.status = status;
    }

    if (category !== "ALL") {
      where.category = category;
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { shortSummary: { contains: search } },
        { story: { contains: search } },
        { beneficiaryInfo: { contains: search } },
      ];
    }

    if (myCampaigns && user) {
      where.userId = user.id;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true, department: true },
        },
        verifiedBy: {
          select: { id: true, name: true },
        },
        _count: {
          select: { donations: { where: { status: "SUCCESS" } } },
        },
      },
    });

    const formattedCampaigns = campaigns.map((c) => ({
      ...c,
      donorCount: c._count.donations,
      percentage: Math.min(Math.round((c.raisedAmount / c.targetAmount) * 100), 100),
      isOrganizer: user?.id === c.userId,
    }));

    return NextResponse.json({ campaigns: formattedCampaigns });
  } catch (error) {
    console.error("Fetch philanthropy campaigns error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a campaign" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      shortSummary,
      story,
      category,
      coverImage,
      targetAmount,
      beneficiaryInfo,
      fundUsagePlan,
      supportingDocsUrl,
      deadline,
    } = body;

    if (!title || !shortSummary || !story || !category || !targetAmount || !fundUsagePlan) {
      return NextResponse.json(
        { error: "Please provide title, short summary, story, category, target amount, and fund usage plan." },
        { status: 400 }
      );
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;

    // Note: All student-submitted campaigns strictly enter PENDING_REVIEW status.
    // The verification badge is NEVER automatically granted.
    const campaign = await prisma.campaign.create({
      data: {
        title,
        slug,
        shortSummary,
        story,
        category,
        coverImage: coverImage || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb4?auto=format&fit=crop&q=80&w=800",
        targetAmount: parseFloat(targetAmount),
        raisedAmount: 0,
        beneficiaryInfo: beneficiaryInfo || null,
        fundUsagePlan,
        supportingDocsUrl: supportingDocsUrl || null,
        status: "PENDING_REVIEW",
        userId: user.id,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    // Notify administrators of pending campaign review
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Campaign Awaiting Verification",
          message: `Campaign "${campaign.title}" submitted by ${user.name} requires verification review.`,
          link: "/admin",
          type: "VERIFICATION",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Campaign submitted for administrative review.",
      campaign,
    }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Failed to submit campaign" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile, registeredEvents, lostFoundReports, communityPosts, donations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        include: {
          campus: true,
        },
      }),
      prisma.eventRegistration.findMany({
        where: { userId: user.id, status: "CONFIRMED" },
        include: {
          event: true,
        },
        orderBy: { registeredAt: "desc" },
      }),
      prisma.lostAndFoundItem.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.communityPost.findMany({
        where: { userId: user.id },
        include: {
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.donation.findMany({
        where: { donorId: user.id, status: "SUCCESS" },
        include: {
          campaign: {
            select: { id: true, title: true, coverImage: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      profile,
      registeredEvents: registeredEvents.map((r) => r.event),
      lostFoundReports,
      communityPosts,
      donations,
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, bio, avatar } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: phone !== undefined ? phone : undefined,
        bio: bio !== undefined ? bio : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        avatar: true,
        department: true,
        role: true,
        verificationStatus: true,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

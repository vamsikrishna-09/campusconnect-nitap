import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only the campaign organizer or admin can post updates" }, { status: 403 });
    }

    const { title, content, imageUrl } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const update = await prisma.campaignUpdate.create({
      data: {
        campaignId: campaign.id,
        title,
        content,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json({ success: true, update }, { status: 201 });
  } catch (error) {
    console.error("Create campaign update error:", error);
    return NextResponse.json({ error: "Failed to post update" }, { status: 500 });
  }
}

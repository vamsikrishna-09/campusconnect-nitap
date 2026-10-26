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
      return NextResponse.json({ error: "Please log in to submit a claim" }, { status: 401 });
    }

    const item = await prisma.lostAndFoundItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const body = await request.json();
    const { message, proofDetails, contactInfo } = body;

    if (!message) {
      return NextResponse.json({ error: "Please provide a message or proof description" }, { status: 400 });
    }

    const claim = await prisma.lostAndFoundClaim.create({
      data: {
        itemId: item.id,
        claimantId: user.id,
        message,
        proofDetails: proofDetails || null,
        contactInfo: contactInfo || user.email,
        status: "PENDING",
      },
    });

    // Notify the item reporter
    await prisma.notification.create({
      data: {
        userId: item.userId,
        title: "New Claim on Your Report",
        message: `${user.name} submitted a claim/inquiry regarding "${item.title}".`,
        link: `/lost-found/${item.id}`,
        type: "LOST_FOUND",
      },
    });

    return NextResponse.json({ success: true, claim }, { status: 201 });
  } catch (error) {
    console.error("Submit claim error:", error);
    return NextResponse.json({ error: "Failed to submit claim" }, { status: 500 });
  }
}

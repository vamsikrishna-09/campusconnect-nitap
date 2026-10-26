import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const item = await prisma.lostAndFoundItem.findUnique({
      where: { id: params.id },
      include: {
        reporter: {
          select: { id: true, name: true, avatar: true, department: true, email: true },
        },
        claims: {
          include: {
            claimant: {
              select: { id: true, name: true, avatar: true, department: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const isOwner = user?.id === item.userId || user?.role === "ADMIN" || user?.role === "MODERATOR";

    // Privacy protection: if not owner or claimant, redact sensitive contact details if contactMethod != IN_APP
    const sanitizedContactDetails = isOwner ? item.contactDetails : (item.contactMethod === "IN_APP" ? "Direct CampusConnect Message" : "Available to verified claimant");

    return NextResponse.json({
      item: {
        ...item,
        contactDetails: sanitizedContactDetails,
        isOwner,
        claims: isOwner ? item.claims : item.claims.filter((c) => c.claimantId === user?.id),
      },
    });
  } catch (error) {
    console.error("Fetch lost/found details error:", error);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const item = await prisma.lostAndFoundItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.userId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return NextResponse.json({ error: "Unauthorized to modify this report" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await prisma.lostAndFoundItem.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        status: body.status !== undefined ? body.status : undefined,
        resolvedAt: body.status === "RESOLVED" ? new Date() : undefined,
        campusLocation: body.campusLocation !== undefined ? body.campusLocation : undefined,
        category: body.category !== undefined ? body.category : undefined,
        contactMethod: body.contactMethod !== undefined ? body.contactMethod : undefined,
        contactDetails: body.contactDetails !== undefined ? body.contactDetails : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Update lost/found error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const item = await prisma.lostAndFoundItem.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.userId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return NextResponse.json({ error: "Unauthorized to delete this report" }, { status: 403 });
    }

    await prisma.lostAndFoundItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Delete lost/found error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

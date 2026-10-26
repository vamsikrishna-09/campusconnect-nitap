import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, department: true, email: true },
        },
        registrations: {
          where: { status: "CONFIRMED" },
          include: {
            user: {
              select: { id: true, name: true, avatar: true, department: true, rollNumber: true },
            },
          },
          orderBy: { registeredAt: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isRegistered = user
      ? event.registrations.some((r) => r.userId === user.id)
      : false;
    const isCreator = user?.id === event.userId || user?.role === "ADMIN";

    return NextResponse.json({
      event: {
        ...event,
        attendeeCount: event.registrations.length,
        isRegistered,
        isCreator,
      },
    });
  } catch (error) {
    console.error("Fetch event details error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
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

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized to edit this event" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        category: body.category !== undefined ? body.category : undefined,
        venue: body.venue !== undefined ? body.venue : undefined,
        date: body.date ? new Date(body.date) : undefined,
        startTime: body.startTime !== undefined ? body.startTime : undefined,
        endTime: body.endTime !== undefined ? body.endTime : undefined,
        capacity: body.capacity !== undefined ? parseInt(body.capacity) : undefined,
        coverImage: body.coverImage !== undefined ? body.coverImage : undefined,
        organizerName: body.organizerName !== undefined ? body.organizerName : undefined,
        organizerContact: body.organizerContact !== undefined ? body.organizerContact : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
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

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized to delete this event" }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Event cancelled successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

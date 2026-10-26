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
      return NextResponse.json({ error: "Please log in to register for events" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { registrations: { where: { status: "CONFIRMED" } } },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status === "CANCELLED") {
      return NextResponse.json({ error: "This event has been cancelled" }, { status: 400 });
    }

    // Check existing registration
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
    });

    if (existingRegistration && existingRegistration.status === "CONFIRMED") {
      return NextResponse.json(
        { error: "You are already registered for this event." },
        { status: 409 }
      );
    }

    // Enforce capacity check
    if (event._count.registrations >= event.capacity) {
      return NextResponse.json(
        { error: "This event has reached full capacity. Registration is closed." },
        { status: 400 }
      );
    }

    // Upsert registration
    const registration = await prisma.eventRegistration.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
      update: {
        status: "CONFIRMED",
        registeredAt: new Date(),
      },
      create: {
        eventId: event.id,
        userId: user.id,
        status: "CONFIRMED",
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Event Registration Confirmed",
        message: `You are registered for "${event.title}". Venue: ${event.venue}`,
        link: `/events/${event.id}`,
        type: "EVENT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully registered for event",
      registration,
    });
  } catch (error) {
    console.error("Register event error:", error);
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to manage registration" }, { status: 401 });
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: user.id,
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    await prisma.eventRegistration.update({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: user.id,
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event registration cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel registration error:", error);
    return NextResponse.json({ error: "Failed to cancel registration" }, { status: 500 });
  }
}

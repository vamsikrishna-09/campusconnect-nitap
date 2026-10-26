import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const myEvents = searchParams.get("myEvents") === "true";
    const registeredOnly = searchParams.get("registeredOnly") === "true";

    const user = await getCurrentUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (category !== "ALL") {
      where.category = category;
    }

    if (status !== "ALL") {
      where.status = status;
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { venue: { contains: search } },
        { organizerName: { contains: search } },
      ];
    }

    if (myEvents && user) {
      where.userId = user.id;
    }

    if (registeredOnly && user) {
      where.registrations = {
        some: {
          userId: user.id,
          status: "CONFIRMED",
        },
      };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, department: true },
        },
        _count: {
          select: { registrations: { where: { status: "CONFIRMED" } } },
        },
        ...(user
          ? {
              registrations: {
                where: { userId: user.id },
                select: { id: true, status: true },
              },
            }
          : {}),
      },
    });

    const formattedEvents = events.map((ev) => ({
      ...ev,
      attendeeCount: ev._count.registrations,
      isRegistered: user ? ev.registrations?.some((r) => r.status === "CONFIRMED") : false,
      isCreator: user?.id === ev.userId,
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error("Fetch events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      venue,
      date,
      startTime,
      endTime,
      registrationDeadline,
      capacity,
      coverImage,
      organizerName,
      organizerContact,
    } = body;

    if (!title || !description || !category || !venue || !date || !startTime || !endTime || !capacity) {
      return NextResponse.json({ error: "Please fill in all required event fields" }, { status: 400 });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        category,
        venue,
        date: new Date(date),
        startTime,
        endTime,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : new Date(date),
        capacity: parseInt(capacity),
        coverImage: coverImage || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800",
        organizerName: organizerName || user.name,
        organizerContact: organizerContact || user.email,
        status: "UPCOMING",
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

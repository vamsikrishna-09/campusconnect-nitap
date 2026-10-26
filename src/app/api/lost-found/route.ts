import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "ALL"; // LOST, FOUND, ALL
    const category = searchParams.get("category") || "ALL";
    const status = searchParams.get("status") || "ALL"; // OPEN, RESOLVED, ALL
    const myItems = searchParams.get("myItems") === "true";

    const user = await getCurrentUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (type !== "ALL") where.type = type;
    if (category !== "ALL") where.category = category;
    if (status !== "ALL") where.status = status;

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { campusLocation: { contains: search } },
      ];
    }

    if (myItems && user) {
      where.userId = user.id;
    }

    const items = await prisma.lostAndFoundItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { id: true, name: true, avatar: true, department: true },
        },
        _count: {
          select: { claims: true },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Fetch lost and found error:", error);
    return NextResponse.json({ error: "Failed to fetch lost and found items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to report an item" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      category,
      campusLocation,
      itemDate,
      contactMethod,
      contactDetails,
      imageUrl,
    } = body;

    if (!title || !description || !type || !category || !campusLocation) {
      return NextResponse.json(
        { error: "Please provide item title, description, type, category, and campus location." },
        { status: 400 }
      );
    }

    const item = await prisma.lostAndFoundItem.create({
      data: {
        title,
        description,
        type,
        category,
        campusLocation,
        itemDate: itemDate ? new Date(itemDate) : new Date(),
        contactMethod: contactMethod || "IN_APP",
        contactDetails: contactDetails || user.email,
        imageUrl: imageUrl || null,
        status: "OPEN",
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("Create lost/found report error:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

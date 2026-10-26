import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "ALL";
    const myPosts = searchParams.get("myPosts") === "true";

    const user = await getCurrentUser();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: { not: "REMOVED" },
    };

    if (category !== "ALL") {
      where.category = category;
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (myPosts && user) {
      where.userId = user.id;
    }

    const posts = await prisma.communityPost.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: { id: true, name: true, avatar: true, department: true, role: true },
        },
        _count: {
          select: { comments: true, reactions: true },
        },
        reactions: user
          ? {
              where: { userId: user.id },
              select: { type: true },
            }
          : false,
      },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      commentCount: post._count.comments,
      reactionCount: post._count.reactions,
      userReaction: user && post.reactions && post.reactions.length > 0 ? post.reactions[0].type : null,
      isAuthor: user?.id === post.userId,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Fetch community posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to create a post" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category, tags, imageUrl } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    const post = await prisma.communityPost.create({
      data: {
        title,
        content,
        category,
        tags: tags || "",
        imageUrl: imageUrl || null,
        userId: user.id,
        status: "ACTIVE",
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, department: true },
        },
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("Create community post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

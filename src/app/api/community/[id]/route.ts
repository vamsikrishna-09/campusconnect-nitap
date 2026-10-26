import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const post = await prisma.communityPost.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, department: true, role: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true, department: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        reactions: true,
      },
    });

    if (!post || post.status === "REMOVED") {
      return NextResponse.json({ error: "Post not found or removed" }, { status: 404 });
    }

    const userReaction = user
      ? post.reactions.find((r) => r.userId === user.id)?.type || null
      : null;

    const isAuthor = user?.id === post.userId || user?.role === "ADMIN" || user?.role === "MODERATOR";

    return NextResponse.json({
      post: {
        ...post,
        reactionCount: post.reactions.length,
        userReaction,
        isAuthor,
      },
    });
  } catch (error) {
    console.error("Fetch community post details error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
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

    const post = await prisma.communityPost.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return NextResponse.json({ error: "Unauthorized to edit this post" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await prisma.communityPost.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        content: body.content !== undefined ? body.content : undefined,
        category: body.category !== undefined ? body.category : undefined,
        tags: body.tags !== undefined ? body.tags : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        isPinned: (user.role === "ADMIN" || user.role === "MODERATOR") && body.isPinned !== undefined ? body.isPinned : undefined,
        status: body.status !== undefined ? body.status : undefined,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error("Update community post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
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

    const post = await prisma.communityPost.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return NextResponse.json({ error: "Unauthorized to delete this post" }, { status: 403 });
    }

    await prisma.communityPost.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete community post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

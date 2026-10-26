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
      return NextResponse.json({ error: "Please log in to comment" }, { status: 401 });
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const { content } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: params.id,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, department: true, role: true },
        },
      },
    });

    // Notify author if comment is from someone else
    if (post.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          title: "New Comment on Your Post",
          message: `${user.name} commented: "${content.slice(0, 50)}..."`,
          link: `/community/${post.id}`,
          type: "COMMUNITY",
        },
      });
    }

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

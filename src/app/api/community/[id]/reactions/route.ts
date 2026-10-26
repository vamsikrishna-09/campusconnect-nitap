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
      return NextResponse.json({ error: "Please log in to react" }, { status: 401 });
    }

    const { type = "LIKE" } = await request.json();

    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId: params.id,
          userId: user.id,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Toggle off
        await prisma.reaction.delete({
          where: {
            postId_userId: {
              postId: params.id,
              userId: user.id,
            },
          },
        });
        const count = await prisma.reaction.count({ where: { postId: params.id } });
        return NextResponse.json({ success: true, reacted: false, count, type: null });
      } else {
        // Update type
        const updated = await prisma.reaction.update({
          where: {
            postId_userId: {
              postId: params.id,
              userId: user.id,
            },
          },
          data: { type },
        });
        const count = await prisma.reaction.count({ where: { postId: params.id } });
        return NextResponse.json({ success: true, reacted: true, count, type: updated.type });
      }
    } else {
      // Create new
      const created = await prisma.reaction.create({
        data: {
          postId: params.id,
          userId: user.id,
          type,
        },
      });
      const count = await prisma.reaction.count({ where: { postId: params.id } });
      return NextResponse.json({ success: true, reacted: true, count, type: created.type });
    }
  } catch (error) {
    console.error("Reaction toggle error:", error);
    return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    const emailMap: Record<string, string> = {
      STUDENT: "arun.cse@nitandhra.ac.in",
      MODERATOR: "priya.ece@nitandhra.ac.in",
      ADMIN: "admin@nitandhra.ac.in",
      UNVERIFIED: "rahul.eee@nitandhra.ac.in",
    };

    const targetEmail = emailMap[role] || emailMap.STUDENT;

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Demo user not found. Please run seed script." },
        { status: 404 }
      );
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      verificationStatus: user.verificationStatus,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        verificationStatus: user.verificationStatus,
      },
    });

    response.cookies.set("cc_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Demo login failed" },
      { status: 500 }
    );
  }
}

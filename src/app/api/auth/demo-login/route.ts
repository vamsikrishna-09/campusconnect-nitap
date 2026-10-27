import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken, hashPassword } from "@/lib/auth";

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

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    // Auto-create demo persona on the fly if database was not pre-seeded
    if (!user) {
      const defaultPwdHash = await hashPassword("Password123!");
      const demoProfiles: Record<string, any> = {
        "arun.cse@nitandhra.ac.in": {
          name: "Arun Kumar",
          email: "arun.cse@nitandhra.ac.in",
          passwordHash: defaultPwdHash,
          rollNumber: "421101",
          department: "Computer Science & Engineering",
          graduationYear: 2026,
          phone: "+91 98765 43210",
          role: "STUDENT",
          verificationStatus: "VERIFIED",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
          bio: "Final year CSE student at NIT-AP.",
        },
        "priya.ece@nitandhra.ac.in": {
          name: "Priya Sharma",
          email: "priya.ece@nitandhra.ac.in",
          passwordHash: defaultPwdHash,
          rollNumber: "422215",
          department: "Electronics & Communication Engineering",
          graduationYear: 2026,
          phone: "+91 98765 43211",
          role: "MODERATOR",
          verificationStatus: "VERIFIED",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
          bio: "Pre-final year ECE student & Student Council Representative.",
        },
        "admin@nitandhra.ac.in": {
          name: "Prof. K. Ramesh",
          email: "admin@nitandhra.ac.in",
          passwordHash: defaultPwdHash,
          rollNumber: "FAC-084",
          department: "Dean of Student Affairs / Administration",
          graduationYear: 2012,
          phone: "+91 98765 43212",
          role: "ADMIN",
          verificationStatus: "VERIFIED",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
          bio: "Faculty In-Charge & Dean of Student Welfare, NIT Andhra Pradesh.",
        },
        "rahul.eee@nitandhra.ac.in": {
          name: "Rahul Varma",
          email: "rahul.eee@nitandhra.ac.in",
          passwordHash: defaultPwdHash,
          rollNumber: "423340",
          department: "Electrical & Electronics Engineering",
          graduationYear: 2027,
          phone: "+91 98765 43213",
          role: "STUDENT",
          verificationStatus: "PENDING",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
          bio: "Sophomore EEE student at NIT-AP.",
        },
      };

      const fallbackData = demoProfiles[targetEmail];
      if (fallbackData) {
        user = await prisma.user.create({
          data: fallbackData,
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Demo user not found and could not be provisioned." },
        { status: 404 }
      );
    }

    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      verificationStatus: user.verificationStatus,
      department: user.department,
      rollNumber: user.rollNumber || undefined,
      avatar: user.avatar || undefined,
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

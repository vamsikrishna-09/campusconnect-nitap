import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";
import { isCampusEmail } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      department,
      graduationYear,
      phone,
      bio,
    } = await request.json();

    if (!name || !email || !password || !rollNumber || !department) {
      return NextResponse.json(
        { error: "Name, email, password, roll number, and department are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // Determine verification status: if ending in nitandhra.ac.in (e.g. @student.nitandhra.ac.in), mark verified, else pending
    const isVerifiedDomain = isCampusEmail(cleanEmail);
    const verificationStatus = isVerifiedDomain ? "VERIFIED" : "PENDING";

    const passwordHash = await hashPassword(password);

    // Get default campus
    const campus = await prisma.campus.findFirst();

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        rollNumber: rollNumber.trim().toUpperCase(),
        department,
        graduationYear: graduationYear ? parseInt(graduationYear) : 2026,
        phone: phone || null,
        bio: bio || null,
        role: "STUDENT",
        verificationStatus,
        campusId: campus?.id,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1e3a8a,3b82f6`,
      },
    });

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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

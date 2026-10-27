import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "campus-connect-nitap-secret-key-2026-secure";
const COOKIE_NAME = "cc_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  verificationStatus: string;
  department?: string | null;
  rollNumber?: string | null;
  avatar?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    let user: any = null;

    try {
      const cleanEmail = payload.email.toLowerCase().trim();
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: payload.userId },
            { email: cleanEmail },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          rollNumber: true,
          department: true,
          graduationYear: true,
          phone: true,
          avatar: true,
          bio: true,
          role: true,
          verificationStatus: true,
          campusId: true,
          createdAt: true,
        },
      });

      // Self-heal: If this serverless container's /tmp/dev.db does not have the user yet
      // (e.g. user registered or switched role in another serverless container), auto-provision them.
      if (!user) {
        const campus = await prisma.campus.findFirst();
        try {
          user = await prisma.user.create({
            data: {
              id: payload.userId,
              name: payload.name || "Student",
              email: cleanEmail,
              passwordHash: "jwt-session-authenticated",
              rollNumber: payload.rollNumber || null,
              department: payload.department || "Computer Science & Engineering",
              role: (payload.role as any) || "STUDENT",
              verificationStatus: (payload.verificationStatus as any) || "VERIFIED",
              campusId: campus?.id,
              avatar:
                payload.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  payload.name || "User"
                )}&backgroundColor=1e3a8a,3b82f6`,
            },
            select: {
              id: true,
              name: true,
              email: true,
              rollNumber: true,
              department: true,
              graduationYear: true,
              phone: true,
              avatar: true,
              bio: true,
              role: true,
              verificationStatus: true,
              campusId: true,
              createdAt: true,
            },
          });
        } catch {
          // In case another concurrent query created it
          user = await prisma.user.findFirst({
            where: { email: cleanEmail },
            select: {
              id: true,
              name: true,
              email: true,
              rollNumber: true,
              department: true,
              graduationYear: true,
              phone: true,
              avatar: true,
              bio: true,
              role: true,
              verificationStatus: true,
              campusId: true,
              createdAt: true,
            },
          });
        }
      }
    } catch (dbErr) {
      console.error("Database query error in getCurrentUser:", dbErr);
    }

    // Resilient fallback: If database is temporarily busy or unreachable,
    // construct complete user profile directly from verified JWT cryptographic payload
    if (!user && payload) {
      user = {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        rollNumber: payload.rollNumber || null,
        department: payload.department || "Computer Science & Engineering",
        graduationYear: 2030,
        phone: null,
        avatar:
          payload.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            payload.name || "User"
          )}&backgroundColor=1e3a8a,3b82f6`,
        bio: null,
        role: payload.role || "STUDENT",
        verificationStatus: payload.verificationStatus || "VERIFIED",
        campusId: null,
        createdAt: new Date(),
      };
    }

    return user;
  } catch (err) {
    console.error("Unexpected error in getCurrentUser:", err);
    return null;
  }
}

export const DEMO_PERSONAS = [
  {
    role: "STUDENT",
    name: "Arun Kumar (Student)",
    email: "arun.cse@nitandhra.ac.in",
    department: "Computer Science & Engineering",
    description: "Browse & register for events, search lost & found, post community threads, make donations.",
    badge: "Verified Student",
  },
  {
    role: "MODERATOR",
    name: "Priya Sharma (Moderator)",
    email: "priya.ece@nitandhra.ac.in",
    department: "Electronics & Communication Engg",
    description: "Inspect reported posts/comments, dismiss or take moderation actions with audit log.",
    badge: "Campus Moderator",
  },
  {
    role: "ADMIN",
    name: "Prof. K. Ramesh (Administrator)",
    email: "admin@nitandhra.ac.in",
    department: "Dean of Student Affairs",
    description: "Verify pending student IDs, approve/reject student campaigns, inspect campus analytics.",
    badge: "Institute Admin",
  },
];

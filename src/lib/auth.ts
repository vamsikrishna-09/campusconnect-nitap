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

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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

    return user;
  } catch {
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

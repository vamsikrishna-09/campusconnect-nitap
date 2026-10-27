import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function setupDatabaseUrl(): string {
  // If user configured a cloud database (PostgreSQL, Neon, Supabase, etc.)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  // Detect serverless environment (Vercel, AWS Lambda)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const dir = path.dirname(tmpDbPath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        console.error("Failed to create /tmp directory:", e);
      }
    }

    // Copy pre-seeded SQLite database to writable /tmp on cold start if not present or empty
    if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.join(__dirname, "..", "..", "prisma", "dev.db"),
        path.join(__dirname, "..", "prisma", "dev.db"),
        "/var/task/prisma/dev.db",
        "/var/task/dev.db",
      ];

      for (const src of candidates) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDbPath);
            break;
          } catch (e) {
            console.error("Failed to copy SQLite database to /tmp:", e);
          }
        }
      }
    }

    const url = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = url;
    return url;
  }

  // Local development fallback
  if (!process.env.DATABASE_URL) {
    const prismaDevDb = path.join(process.cwd(), "prisma", "dev.db");
    const rootDevDb = path.join(process.cwd(), "dev.db");
    if (fs.existsSync(prismaDevDb)) {
      process.env.DATABASE_URL = `file:${prismaDevDb}`;
    } else if (fs.existsSync(rootDevDb)) {
      process.env.DATABASE_URL = `file:${rootDevDb}`;
    } else {
      process.env.DATABASE_URL = "file:./dev.db";
    }
  }

  return process.env.DATABASE_URL;
}

const targetDbUrl = setupDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: targetDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

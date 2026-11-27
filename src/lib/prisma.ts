import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Next.js builds every route as its own serverless function, so each one
// gets its own module scope and therefore its own PrismaClient — dozens of
// independent connection pools against the same Supabase pooler. Without a
// cap, Prisma defaults each pool to `num_cpus * 2 + 1` connections; across
// that many functions it can exceed the pooler's connection limit, which
// shows up as requests queuing for a free connection (fast when idle,
// multi-second when other functions are also mid-request). Capping each
// function to a single pooled connection keeps the aggregate well within
// limits. Appended here instead of on the DATABASE_URL secret itself,
// since that secret is write-only on Vercel (type "Secret") and can't be
// read back to safely edit.
function withConnectionLimit(url: string | undefined) {
  if (!url) return url;
  if (/\bconnection_limit=/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connection_limit=1`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    datasources: { db: { url: withConnectionLimit(process.env.DATABASE_URL) } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

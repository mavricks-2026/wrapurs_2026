import { PrismaClient } from "@prisma/client";

/**
 * prisma.ts — a single, shared Prisma Client for the whole app.
 *
 * Reusing one client across hot reloads in development prevents Next.js from
 * opening a new database connection pool on every file change (which can
 * exhaust Neon's connection limit).
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

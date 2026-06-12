import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // In Prisma 7, the URL is passed via adapter or direct connection, 
    // but SQLite doesn't need an adapter usually, or it's read from config.
    // If it's SQLite, new PrismaClient() will automatically read it.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

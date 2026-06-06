import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getRuntimeDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

function sanitizeConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("sslaccept");
    return url.toString();
  } catch {
    return connectionString;
  }
}

function createPool(connectionString: string): pg.Pool {
  const sanitized = sanitizeConnectionString(connectionString);
  const isSupabase = sanitized.includes("supabase.com");

  return new pg.Pool({
    connectionString: sanitized,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 5,
  });
}

function createPrismaClient() {
  const connectionString = getRuntimeDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "Database URL is not configured. Set DATABASE_URL or connect Supabase via Vercel integration.",
    );
  }

  const pool = createPool(connectionString);
  const adapter = new PrismaPg(pool);

  globalForPrisma.pool = pool;

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getPrisma(), property, receiver);
  },
});

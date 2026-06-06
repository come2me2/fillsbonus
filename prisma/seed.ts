import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getMigrationDatabaseUrl } from "../src/lib/database-url";
import { SEED_DEFAULT_PASSWORD, seedMockData } from "../src/lib/seed-mock";

async function main() {
  const connectionString = getMigrationDatabaseUrl();

  if (!connectionString) {
    throw new Error("Database URL is not configured for seeding");
  }

  let sanitized = connectionString;

  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("sslaccept");
    sanitized = url.toString();
  } catch {
    // keep original string
  }

  const pool = new pg.Pool({
    connectionString: sanitized,
    ssl: sanitized.includes("supabase.com") ? { rejectUnauthorized: false } : undefined,
  });

  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const result = await seedMockData(prisma, process.env.SEED_PASSWORD ?? SEED_DEFAULT_PASSWORD);
    console.log("Mock data seeded successfully.");
    console.log(`Admin login: ${result.adminEmail}`);
    console.log(`Password: ${result.password}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

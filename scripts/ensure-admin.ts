import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_DEFAULT_PASSWORD } from "../src/lib/seed-mock";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { getMigrationDatabaseUrl } from "../src/lib/database-url";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "info@filsdesign.ru").trim().toLowerCase();
const password = process.env.SEED_PASSWORD ?? SEED_DEFAULT_PASSWORD;

async function main() {
  const connectionString = getMigrationDatabaseUrl();

  if (!connectionString) {
    throw new Error("Database URL is not configured");
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
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        isAdmin: true,
        passwordHash,
      },
      create: {
        name: "Администратор FILLS",
        email: ADMIN_EMAIL,
        phone: "70000000000",
        passwordHash,
        refCode: "FILLSADM",
        isAdmin: true,
      },
    });

    console.log(`Admin ready: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log(`isAdmin: ${user.isAdmin}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

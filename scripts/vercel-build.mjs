import { execSync } from "node:child_process";

const MIGRATION_DATABASE_KEYS = [
  "FILLSBONUS_POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "FILLSBONUS_POSTGRES_URL",
  "POSTGRES_URL",
  "FILLSBONUS_POSTGRES_PRISMA_URL",
  "POSTGRES_PRISMA_URL",
];

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function readFirstEnv(keys) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

run("npx prisma generate");

const migrationDatabaseUrl = readFirstEnv(MIGRATION_DATABASE_KEYS);

if (migrationDatabaseUrl) {
  console.log("Running prisma migrate deploy...");
  run("npx prisma migrate deploy");
} else {
  console.warn("");
  console.warn("WARNING: Database URL is not set. Skipping prisma migrate deploy.");
  console.warn("Connect Supabase in Vercel or add DATABASE_URL, then redeploy.");
  console.warn("");
}

run("npx next build");

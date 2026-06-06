import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function getMigrationDatabaseUrl() {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL
  );
}

run("npx prisma generate");

const migrationDatabaseUrl = getMigrationDatabaseUrl();

if (migrationDatabaseUrl) {
  run("npx prisma migrate deploy");
} else {
  console.warn("");
  console.warn("WARNING: Database URL is not set. Skipping prisma migrate deploy.");
  console.warn("Connect Supabase in Vercel or add DATABASE_URL, then redeploy.");
  console.warn("");
}

run("npx next build");

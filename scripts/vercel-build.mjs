import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function readEnv(name) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getMigrationDatabaseUrl() {
  return (
    readEnv("POSTGRES_URL_NON_POOLING") ??
    readEnv("DATABASE_URL") ??
    readEnv("POSTGRES_URL") ??
    readEnv("POSTGRES_PRISMA_URL")
  );
}

run("npx prisma generate");

const migrationDatabaseUrl = getMigrationDatabaseUrl();

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

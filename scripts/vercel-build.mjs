import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

run("npx prisma generate");

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (databaseUrl) {
  run("npx prisma migrate deploy");
} else {
  console.warn("");
  console.warn("WARNING: DATABASE_URL is not set. Skipping prisma migrate deploy.");
  console.warn("Add DATABASE_URL in Vercel -> Settings -> Environment Variables.");
  console.warn("Enable it for Production, Preview, and Development, then redeploy.");
  console.warn("");
}

run("npx next build");

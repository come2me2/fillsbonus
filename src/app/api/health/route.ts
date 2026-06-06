import { NextResponse } from "next/server";
import { getRuntimeDatabaseUrl, getMigrationDatabaseUrl } from "@/lib/database-url";
import { getPrisma } from "@/lib/prisma";

function hasEnv(name: string) {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  const runtimeUrl = getRuntimeDatabaseUrl();
  const migrationUrl = getMigrationDatabaseUrl();

  const envStatus = {
    POSTGRES_PRISMA_URL: hasEnv("POSTGRES_PRISMA_URL"),
    POSTGRES_URL_NON_POOLING: hasEnv("POSTGRES_URL_NON_POOLING"),
    POSTGRES_URL: hasEnv("POSTGRES_URL"),
    DATABASE_URL: hasEnv("DATABASE_URL"),
    AUTH_SECRET: hasEnv("AUTH_SECRET"),
  };

  if (!runtimeUrl) {
    return NextResponse.json({
      ok: false,
      error: "Database URL is not configured",
      envStatus,
    });
  }

  try {
    await getPrisma().$queryRaw`SELECT 1`;

    const tables = await getPrisma().$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User'
    `;

    return NextResponse.json({
      ok: true,
      envStatus,
      hasUserTable: tables.length > 0,
      runtimeUrlConfigured: Boolean(runtimeUrl),
      migrationUrlConfigured: Boolean(migrationUrl),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        error: message,
        envStatus,
        runtimeUrlConfigured: Boolean(runtimeUrl),
        migrationUrlConfigured: Boolean(migrationUrl),
      },
      { status: 500 },
    );
  }
}

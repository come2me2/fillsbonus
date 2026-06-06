import { NextResponse } from "next/server";
import { getRuntimeDatabaseUrl, getMigrationDatabaseUrl } from "@/lib/database-url";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const runtimeUrl = getRuntimeDatabaseUrl();
  const migrationUrl = getMigrationDatabaseUrl();

  if (!runtimeUrl) {
    return NextResponse.json({
      ok: false,
      error: "Database URL is not configured",
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    });
  }

  try {
    await getPrisma().$queryRaw`SELECT 1`;

    const tables = await getPrisma().$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User'
    `;

    return NextResponse.json({
      ok: true,
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
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
        hasAuthSecret: Boolean(process.env.AUTH_SECRET),
        runtimeUrlConfigured: Boolean(runtimeUrl),
        migrationUrlConfigured: Boolean(migrationUrl),
      },
      { status: 500 },
    );
  }
}

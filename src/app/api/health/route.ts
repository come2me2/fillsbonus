import { NextResponse } from "next/server";
import {
  getDatabaseEnvStatus,
  getMigrationDatabaseUrl,
  getRuntimeDatabaseUrl,
} from "@/lib/database-url";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const runtimeUrl = getRuntimeDatabaseUrl();
  const migrationUrl = getMigrationDatabaseUrl();
  const envStatus = getDatabaseEnvStatus();

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

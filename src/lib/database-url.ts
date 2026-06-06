function appendPgBouncerParams(url: string): string {
  if (url.includes("pgbouncer=true")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}pgbouncer=true&connection_limit=1`;
}

export function getRuntimeDatabaseUrl(): string | undefined {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL;

  if (!url) {
    return undefined;
  }

  const usesPooler =
    url.includes("pooler.supabase.com") ||
    url.includes(":6543") ||
    url.includes("pgbouncer=true");

  return usesPooler ? appendPgBouncerParams(url) : url;
}

export function getMigrationDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL
  );
}

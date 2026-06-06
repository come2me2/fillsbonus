const RUNTIME_DATABASE_KEYS = [
  "FILLSBONUS_POSTGRES_PRISMA_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL",
  "FILLSBONUS_POSTGRES_URL",
  "POSTGRES_URL",
] as const;

const MIGRATION_DATABASE_KEYS = [
  "FILLSBONUS_POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "FILLSBONUS_POSTGRES_URL",
  "POSTGRES_URL",
  "FILLSBONUS_POSTGRES_PRISMA_URL",
  "POSTGRES_PRISMA_URL",
] as const;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function readFirstEnv(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = readEnv(key);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function appendPgBouncerParams(url: string): string {
  if (url.includes("pgbouncer=true")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}pgbouncer=true&connection_limit=1`;
}

function appendSslModeIfNeeded(url: string): string {
  return url;
}

export function getRuntimeDatabaseUrl(): string | undefined {
  const url = readFirstEnv(RUNTIME_DATABASE_KEYS);

  if (!url) {
    return undefined;
  }

  const withSsl = appendSslModeIfNeeded(url);
  const usesPooler =
    withSsl.includes("pooler.supabase.com") ||
    withSsl.includes(":6543") ||
    withSsl.includes("pgbouncer=true");

  return usesPooler ? appendPgBouncerParams(withSsl) : withSsl;
}

export function getMigrationDatabaseUrl(): string | undefined {
  const url = readFirstEnv(MIGRATION_DATABASE_KEYS);

  if (!url) {
    return undefined;
  }

  return appendSslModeIfNeeded(url);
}

export function hasDatabaseEnv(): boolean {
  return Boolean(getRuntimeDatabaseUrl());
}

export function getDatabaseEnvStatus(): Record<string, boolean> {
  return Object.fromEntries(
    [...RUNTIME_DATABASE_KEYS, ...MIGRATION_DATABASE_KEYS, "AUTH_SECRET"].map((key) => [
      key,
      Boolean(readEnv(key)),
    ]),
  );
}

function getRegisterErrorMessage(error: unknown): { message: string; status: number } {
  if (
    error instanceof Error &&
    (error.message.includes("Database URL is not configured") ||
      error.message.includes("connect Supabase"))
  ) {
    return {
      message:
        "База данных не подключена. Проверьте интеграцию Supabase в Vercel и сделайте redeploy.",
      status: 500,
    };
  }

  if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
    return {
      message: "AUTH_SECRET не настроен на сервере",
      status: 500,
    };
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    if (error.code === "P2002") {
      return {
        message: "Пользователь с таким email или телефоном уже существует",
        status: 409,
      };
    }

    if (error.code === "P2021") {
      return {
        message: "Таблицы в базе не созданы. Запустите redeploy на Vercel.",
        status: 500,
      };
    }

    if (error.code === "P1001" || error.code === "P1000") {
      return {
        message: "Не удалось подключиться к базе данных",
        status: 500,
      };
    }
  }

  return {
    message: "Не удалось зарегистрироваться",
    status: 500,
  };
}

export { getRegisterErrorMessage, RUNTIME_DATABASE_KEYS, MIGRATION_DATABASE_KEYS };

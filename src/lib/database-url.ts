function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function appendPgBouncerParams(url: string): string {
  if (url.includes("pgbouncer=true")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}pgbouncer=true&connection_limit=1`;
}

function appendSslModeIfNeeded(url: string): string {
  if (url.includes("sslmode=") || !url.includes("supabase.com")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}sslmode=require`;
}

export function getRuntimeDatabaseUrl(): string | undefined {
  const url =
    readEnv("POSTGRES_PRISMA_URL") ??
    readEnv("DATABASE_URL") ??
    readEnv("POSTGRES_URL");

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
  const url =
    readEnv("POSTGRES_URL_NON_POOLING") ??
    readEnv("DATABASE_URL") ??
    readEnv("POSTGRES_URL") ??
    readEnv("POSTGRES_PRISMA_URL");

  if (!url) {
    return undefined;
  }

  return appendSslModeIfNeeded(url);
}

function getRegisterErrorMessage(error: unknown): { message: string; status: number } {
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

export { getRegisterErrorMessage };

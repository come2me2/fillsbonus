import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { hasDatabaseEnv } from "@/lib/database-url";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "filsbonus_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  refCode: string;
  isAdmin: boolean;
  bonusBalance: number;
  successfulOrders: number;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!hasDatabaseEnv() || !process.env.AUTH_SECRET?.trim()) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = payload.userId;

    if (typeof userId !== "string") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        refCode: true,
        isAdmin: true,
        bonusBalance: true,
        successfulOrders: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      bonusBalance: Number(user.bonusBalance),
    };
  } catch {
    return null;
  }
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireSessionUser();

  if (!user.isAdmin) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

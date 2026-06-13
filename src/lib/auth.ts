import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createRefCode } from "@/lib/ref-code";
import { normalizePhone } from "@/lib/phone";
import { registerSchema, loginSchema } from "@/lib/validation";
import { setSessionCookie } from "@/lib/session";

async function generateUniqueRefCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const refCode = createRefCode();
    const existing = await prisma.user.findUnique({ where: { refCode } });

    if (!existing) {
      return refCode;
    }
  }

  throw new Error("Failed to generate unique referral code");
}

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);
  const phone = normalizePhone(data.phone);
  const passwordHash = await bcrypt.hash(data.password.trim(), 12);
  const refCode = await generateUniqueRefCode();

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = adminEmails.includes(data.email.toLowerCase());

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone,
      passwordHash,
      refCode,
      isAdmin,
    },
  });

  await setSessionCookie(user.id);

  return user;
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);
  const email = data.email.trim().toLowerCase();
  const password = data.password.trim();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await setSessionCookie(user.id);

  return user;
}

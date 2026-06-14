import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z, ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const refCodeSchema = z.object({
  refCode: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(20, "Максимум 20 символов")
    .regex(/^[A-ZА-ЯЁ0-9._-]+$/i, "Допустимы буквы, цифры, дефис и точка")
    .transform((v) => v.trim().toUpperCase()),
});

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await request.json();

    const { refCode } = refCodeSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { refCode, NOT: { id } },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Этот промокод уже занят другим участником" },
        { status: 409 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { refCode },
    });

    return NextResponse.json({ ok: true, user: { id: updated.id, refCode: updated.refCode } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? "Ошибка валидации" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { registerUser } from "@/lib/auth";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerUser(body);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        refCode: user.refCode,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 },
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { ok: false, error: "Пользователь с таким email или телефоном уже существует" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Не удалось зарегистрироваться" },
      { status: 500 },
    );
  }
}

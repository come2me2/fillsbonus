import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await loginUser(body);

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

    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return NextResponse.json(
        { ok: false, error: "Неверный email или пароль" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Не удалось войти" },
      { status: 500 },
    );
  }
}

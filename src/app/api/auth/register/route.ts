import { NextResponse } from "next/server";
import { getRegisterErrorMessage } from "@/lib/database-url";
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
    console.error("[register]", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 },
      );
    }

    const { message, status } = getRegisterErrorMessage(error);

    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { spendSchema } from "@/lib/validation";
import { notifySpendRequest } from "@/lib/email";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = spendSchema.parse(await request.json());
    const amount = body.amount;

    if (amount > user.bonusBalance) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно средств на балансе" },
        { status: 400 },
      );
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          bonusBalance: { decrement: amount },
        },
      });

      if (Number(updatedUser.bonusBalance) < 0) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      return tx.transaction.create({
        data: {
          userId: user.id,
          type: "SPEND",
          amount,
          status: "PENDING",
          details: body.details,
        },
      });
    });

    await notifySpendRequest({
      userName: user.name,
      amount,
      details: body.details,
    });

    return NextResponse.json({ ok: true, transaction });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { ok: false, error: "Недостаточно средств на балансе" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

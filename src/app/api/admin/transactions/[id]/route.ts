import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await request.json();
    const action = body.action as string;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({ ok: false, error: "Transaction not found" }, { status: 404 });
    }

    if (action === "approve") {
      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          status: "COMPLETED",
          type:
            transaction.type === "WITHDRAWAL_REQUEST"
              ? "WITHDRAWAL_PAID"
              : transaction.type,
        },
      });

      return NextResponse.json({ ok: true, transaction: updated });
    }

    if (action === "reject") {
      const updated = await prisma.$transaction(async (tx) => {
        if (
          transaction.status === "PENDING" &&
          (transaction.type === "WITHDRAWAL_REQUEST" || transaction.type === "SPEND")
        ) {
          await tx.user.update({
            where: { id: transaction.userId },
            data: {
              bonusBalance: { increment: Number(transaction.amount) },
            },
          });
        }

        return tx.transaction.update({
          where: { id },
          data: { status: "REJECTED" },
        });
      });

      return NextResponse.json({ ok: true, transaction: updated });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

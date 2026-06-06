import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminUser();

    const [referrals, referrers, pendingTransactions] = await Promise.all([
      prisma.referral.findMany({
        include: {
          referrer: true,
          order: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { referrals: true },
          },
        },
      }),
      prisma.transaction.findMany({
        where: {
          status: "PENDING",
          type: { in: ["WITHDRAWAL_REQUEST", "SPEND"] },
        },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      referrals,
      referrers,
      pendingTransactions,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

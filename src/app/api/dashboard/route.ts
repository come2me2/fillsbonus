import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getReferralLink } from "@/lib/ref-code";
import { getNextTierInfo } from "@/lib/bonus";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const tier = getNextTierInfo(user.successfulOrders);

    const [referrals, transactions] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerId: user.id },
        include: { order: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      user: {
        ...user,
        referralLink: getReferralLink(user.refCode),
        tier,
      },
      referrals,
      transactions,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

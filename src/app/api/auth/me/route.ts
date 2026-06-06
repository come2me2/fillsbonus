import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getReferralLink } from "@/lib/ref-code";
import { getNextTierInfo } from "@/lib/bonus";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const tier = getNextTierInfo(user.successfulOrders);

  return NextResponse.json({
    ok: true,
    user: {
      ...user,
      referralLink: getReferralLink(user.refCode),
      tier,
    },
  });
}

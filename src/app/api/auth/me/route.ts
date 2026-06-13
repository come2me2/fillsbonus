import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getReferralLink } from "@/lib/ref-code";
import { CLIENT_DISCOUNT_PERCENT, REFERRER_BONUS_PERCENT } from "@/lib/bonus";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      ...user,
      referralLink: getReferralLink(user.refCode),
      referrerBonusPercent: REFERRER_BONUS_PERCENT,
      clientDiscountPercent: CLIENT_DISCOUNT_PERCENT,
    },
  });
}

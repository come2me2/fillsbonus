import { NextResponse } from "next/server";
import { ReferralStatus } from "@/generated/prisma/client";
import { requireAdminUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { accrueBonusForReferral } from "@/lib/referrals";
import { calculateClientDiscount } from "@/lib/bonus";
import { quoteAmountSchema } from "@/lib/validation";
import { notifyBonusAccrued } from "@/lib/email";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = await request.json();
    const action = body.action as string;

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: { order: true, referrer: true },
    });

    if (!referral || !referral.order) {
      return NextResponse.json({ ok: false, error: "Referral not found" }, { status: 404 });
    }

    if (action === "set_amount") {
      const { quoteAmount } = quoteAmountSchema.parse(body);
      const { percent, discount, finalAmount } = calculateClientDiscount(quoteAmount);

      const updated = await prisma.order.update({
        where: { id: referral.order.id },
        data: {
          quoteAmount,
          clientDiscountPercent: percent,
          clientDiscountAmount: discount,
          amount: finalAmount,
        },
      });

      return NextResponse.json({ ok: true, order: updated });
    }

    if (action === "set_status") {
      const status = body.status as ReferralStatus;

      if (!Object.values(ReferralStatus).includes(status)) {
        return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
      }

      const updatedReferral = await prisma.referral.update({
        where: { id },
        data: {
          status,
          notes: body.notes ?? referral.notes,
        },
        include: { order: true, referrer: true },
      });

      if (status === ReferralStatus.PAID) {
        await prisma.order.update({
          where: { id: referral.order.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });
      }

      if (status === ReferralStatus.DELIVERED) {
        await prisma.order.update({
          where: { id: referral.order.id },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
          },
        });

        const accrued = await accrueBonusForReferral(id);

        if (accrued?.order?.bonusAmount && accrued.order.bonusPercent) {
          await notifyBonusAccrued({
            email: accrued.referrer.email,
            name: accrued.referrer.name,
            amount: Number(accrued.order.bonusAmount),
            percent: Number(accrued.order.bonusPercent),
          });
        }

        return NextResponse.json({ ok: true, referral: accrued });
      }

      return NextResponse.json({ ok: true, referral: updatedReferral });
    }

    if (action === "reject") {
      const updated = await prisma.referral.update({
        where: { id },
        data: {
          status: ReferralStatus.REJECTED,
          notes: body.notes ?? referral.notes,
        },
      });

      return NextResponse.json({ ok: true, referral: updated });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}

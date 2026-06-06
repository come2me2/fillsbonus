import { ReferralSource, ReferralStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateBonusAmount } from "@/lib/bonus";
import { normalizePhone } from "@/lib/phone";

const ACTIVE_STATUSES: ReferralStatus[] = [
  ReferralStatus.LEAD,
  ReferralStatus.IN_PROGRESS,
  ReferralStatus.PAID,
  ReferralStatus.DELIVERED,
  ReferralStatus.BONUS_ACCRUED,
];

export async function findReferrerByCode(refCode: string) {
  return prisma.user.findUnique({
    where: { refCode: refCode.trim().toUpperCase() },
  });
}

export async function validateReferralCreation(params: {
  referrerId: string;
  clientPhone: string;
}) {
  const clientPhone = normalizePhone(params.clientPhone);
  const referrer = await prisma.user.findUnique({ where: { id: params.referrerId } });

  if (!referrer) {
    return { ok: false as const, error: "Referrer not found" };
  }

  if (referrer.phone === clientPhone) {
    return { ok: false as const, error: "Self-referral is not allowed" };
  }

  const existing = await prisma.referral.findFirst({
    where: {
      clientPhone,
      status: { in: ACTIVE_STATUSES },
    },
  });

  if (existing) {
    return { ok: false as const, error: "Client already attributed" };
  }

  return { ok: true as const, clientPhone };
}

export async function createReferralLead(params: {
  referrerId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  source: ReferralSource;
  notes?: string;
}) {
  const validation = await validateReferralCreation({
    referrerId: params.referrerId,
    clientPhone: params.clientPhone,
  });

  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  const referral = await prisma.referral.create({
    data: {
      referrerId: params.referrerId,
      clientName: params.clientName.trim(),
      clientPhone: validation.clientPhone,
      clientEmail: params.clientEmail?.trim().toLowerCase(),
      source: params.source,
      notes: params.notes,
      order: {
        create: {},
      },
    },
    include: {
      referrer: true,
      order: true,
    },
  });

  return { ok: true as const, referral };
}

export async function accrueBonusForReferral(referralId: string) {
  return prisma.$transaction(async (tx) => {
    const referral = await tx.referral.findUnique({
      where: { id: referralId },
      include: {
        order: true,
        referrer: true,
      },
    });

    if (!referral || !referral.order) {
      throw new Error("Referral not found");
    }

    if (referral.status === ReferralStatus.BONUS_ACCRUED) {
      return referral;
    }

    if (referral.status !== ReferralStatus.DELIVERED) {
      throw new Error("Referral must be delivered before bonus accrual");
    }

    const amount = Number(referral.order.amount);

    if (amount <= 0) {
      throw new Error("Order amount is required");
    }

    const { percent, bonus } = calculateBonusAmount(
      amount,
      referral.referrer.successfulOrders,
    );

    await tx.order.update({
      where: { id: referral.order.id },
      data: {
        status: "BONUS_ACCRUED",
        bonusPercent: percent,
        bonusAmount: bonus,
        bonusAccruedAt: new Date(),
      },
    });

    await tx.referral.update({
      where: { id: referral.id },
      data: { status: ReferralStatus.BONUS_ACCRUED },
    });

    await tx.user.update({
      where: { id: referral.referrerId },
      data: {
        successfulOrders: { increment: 1 },
        bonusBalance: { increment: bonus },
      },
    });

    await tx.transaction.create({
      data: {
        userId: referral.referrerId,
        orderId: referral.order.id,
        type: "ACCRUAL",
        amount: bonus,
        status: "COMPLETED",
        details: `Бонус ${percent}% за заказ клиента ${referral.clientName}`,
      },
    });

    return tx.referral.findUnique({
      where: { id: referralId },
      include: { order: true, referrer: true },
    });
  });
}

export const TIER_PERCENTS = [5, 7, 10] as const;
export const CLIENT_DISCOUNT_PERCENT = 5;

export function getBonusPercent(successfulOrders: number): number {
  if (successfulOrders <= 0) return TIER_PERCENTS[0];
  if (successfulOrders === 1) return TIER_PERCENTS[1];
  return TIER_PERCENTS[2];
}

export function getNextTierInfo(successfulOrders: number): {
  currentPercent: number;
  nextPercent: number | null;
  referralsUntilNext: number;
} {
  const currentPercent = getBonusPercent(successfulOrders);

  if (successfulOrders <= 0) {
    return {
      currentPercent,
      nextPercent: TIER_PERCENTS[1],
      referralsUntilNext: 1,
    };
  }

  if (successfulOrders === 1) {
    return {
      currentPercent,
      nextPercent: TIER_PERCENTS[2],
      referralsUntilNext: 1,
    };
  }

  return {
    currentPercent,
    nextPercent: null,
    referralsUntilNext: 0,
  };
}

export function calculateBonusAmount(amount: number, successfulOrders: number): {
  percent: number;
  bonus: number;
} {
  const percent = getBonusPercent(successfulOrders);
  const bonus = Math.round((amount * percent) / 100);

  return { percent, bonus };
}

export function calculateClientDiscount(quoteAmount: number): {
  percent: number;
  discount: number;
  finalAmount: number;
} {
  const percent = CLIENT_DISCOUNT_PERCENT;
  const discount = Math.round((quoteAmount * percent) / 100);
  const finalAmount = quoteAmount - discount;

  return { percent, discount, finalAmount };
}

export function formatMoney(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

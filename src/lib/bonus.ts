export const REFERRER_BONUS_PERCENT = 5;
export const CLIENT_DISCOUNT_PERCENT = 5;

/** Индивидуальная скидка покупателю по промокоду реферера */
const CLIENT_DISCOUNT_OVERRIDES: Record<string, number> = {
  PUSHMAN: 10,
};

export function getClientDiscountPercent(refCode?: string | null): number {
  if (!refCode) {
    return CLIENT_DISCOUNT_PERCENT;
  }

  const key = refCode.trim().toUpperCase();
  return CLIENT_DISCOUNT_OVERRIDES[key] ?? CLIENT_DISCOUNT_PERCENT;
}

export function calculateBonusAmount(amount: number): {
  percent: number;
  bonus: number;
} {
  const percent = REFERRER_BONUS_PERCENT;
  const bonus = Math.round((amount * percent) / 100);

  return { percent, bonus };
}

export function calculateClientDiscount(
  quoteAmount: number,
  refCode?: string | null,
): {
  percent: number;
  discount: number;
  finalAmount: number;
} {
  const percent = getClientDiscountPercent(refCode);
  const discount = Math.round((quoteAmount * percent) / 100);
  const finalAmount = quoteAmount - discount;

  return { percent, discount, finalAmount };
}

export function formatMoneyAmount(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMoney(amount: number | string): string {
  return `${formatMoneyAmount(amount)}\u202fруб.`;
}

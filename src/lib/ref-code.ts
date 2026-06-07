import { customAlphabet } from "nanoid";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export function createRefCode(): string {
  return generateCode();
}

export function getReferralLink(refCode: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fillsdesign.ru";
  return `${siteUrl}/?ref=${refCode}`;
}

export function getClientDiscountLink(refCode: string): string {
  const bonusUrl = process.env.NEXT_PUBLIC_BONUS_URL ?? "https://fillsbonus.vercel.app";
  return `${bonusUrl}/ref/${refCode}`;
}

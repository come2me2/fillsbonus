import { customAlphabet } from "nanoid";
import { getBonusSiteUrl, getMainSiteUrl } from "@/lib/site-urls";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export function createRefCode(): string {
  return generateCode();
}

export function getReferralLink(refCode: string): string {
  return `${getMainSiteUrl()}/?ref=${refCode}`;
}

export function getClientDiscountLink(refCode: string): string {
  return `${getBonusSiteUrl()}/ref/${refCode}`;
}

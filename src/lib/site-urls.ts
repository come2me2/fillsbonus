/** Production bonus app URL. Prefer env; fallback to Vercel until bonus.fillsdesign.ru DNS is live. */
export function getBonusSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BONUS_URL?.trim() ||
    process.env.BONUS_SITE_URL?.trim() ||
    "https://www.fillsbonus.ru"
  );
}

export function getMainSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://fillsdesign.ru";
}

export function getTildaTrackerUrl(): string {
  return `${getBonusSiteUrl()}/tilda-ref-tracker.js`;
}

export function getTildaWebhookUrl(): string {
  return `${getBonusSiteUrl()}/api/webhooks/tilda`;
}

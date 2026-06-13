#!/usr/bin/env node

const BONUS_URL = process.env.BONUS_SITE_URL || "https://fillsbonus.vercel.app";
const refCode = (process.argv[2] || "FILSADMN").toUpperCase();
const phone = `7999${String(Date.now()).slice(-7)}`;

async function main() {
  console.log(`Tilda webhook E2E test → ${BONUS_URL}`);
  console.log(`ref_code=${refCode}, phone=${phone}\n`);

  const webhookResponse = await fetch(`${BONUS_URL}/api/webhooks/tilda`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Tilda E2E Test",
      Phone: `+${phone}`,
      ref_code: refCode,
    }),
  });

  const webhookBody = await webhookResponse.json();
  console.log("Webhook:", webhookResponse.status, webhookBody);

  if (!webhookResponse.ok || !webhookBody.ok) {
    process.exit(1);
  }

  if (webhookBody.skipped) {
    console.log("Skipped (no ref) — expected only without ref_code");
    process.exit(0);
  }

  const referralId = webhookBody.referralId;
  console.log("\n✓ Lead created:", referralId);
  console.log("\nДальше вручную в /admin:");
  console.log("  1. Ввести смету");
  console.log("  2. Оплачен → Доставлен");
  console.log("  3. Проверить баланс реферера в /dashboard");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

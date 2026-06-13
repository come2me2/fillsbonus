#!/usr/bin/env node

const BONUS_URL = process.env.BONUS_SITE_URL || "https://fillsbonus.vercel.app";
const BONUS_DOMAIN_URL = "https://bonus.fillsdesign.ru";

async function checkUrl(label, url, expectOk = true) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    const ok = expectOk ? response.ok : true;
    const status = `${response.status} ${response.statusText}`;
    console.log(`${ok ? "✓" : "✗"} ${label}: ${url} → ${status}`);
    return { ok: response.ok, status: response.status };
  } catch (error) {
    console.log(`✗ ${label}: ${url} → ${error instanceof Error ? error.message : error}`);
    return { ok: false, status: 0 };
  }
}

async function main() {
  console.log("Fills Bonus — проверка инфраструктуры\n");

  const health = await checkUrl("Health (Vercel)", `${BONUS_URL}/api/health`);
  if (health.ok) {
    const data = await fetch(`${BONUS_URL}/api/health`).then((r) => r.json());
    console.log(`  hasUserTable: ${data.hasUserTable}`);
    console.log(`  AUTH_SECRET: ${data.envStatus?.AUTH_SECRET ? "set" : "missing"}`);
    console.log(`  DB runtime: ${data.runtimeUrlConfigured ? "ok" : "missing"}`);
  }

  await checkUrl("Tracker JS", `${BONUS_URL}/tilda-ref-tracker.js`);
  await checkUrl("Webhook endpoint (OPTIONS/POST)", `${BONUS_URL}/api/webhooks/tilda`, false);

  const domainHealth = await checkUrl("Health (bonus.fillsdesign.ru)", `${BONUS_DOMAIN_URL}/api/health`);
  if (!domainHealth.ok) {
    console.log("\n⚠ bonus.fillsdesign.ru недоступен — используйте fillsbonus.vercel.app в Tilda.");
    console.log("  DNS: CNAME bonus → cname.vercel-dns.com + домен в Vercel → Settings → Domains");
  }

  console.log("\nEnv для Vercel (добавить вручную):");
  console.log("  AUTH_SECRET, ADMIN_EMAILS=info@filsdesign.ru");
  console.log("  NEXT_PUBLIC_SITE_URL=https://fillsdesign.ru");
  console.log("  NEXT_PUBLIC_BONUS_URL=https://bonus.fillsdesign.ru (или fillsbonus.vercel.app)");
  console.log("  TILDA_WEBHOOK_SECRET=(опционально)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

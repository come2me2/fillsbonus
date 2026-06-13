import { sendTelegram } from "@/lib/telegram";

export async function sendAdminNotification(subject: string, body: string) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.info("[email:admin]", subject, body);
  } else {
    console.info("[email:admin]", adminEmail, subject, body);
  }

  await sendTelegram(`<b>${subject}</b>\n\n${body}`);
}

export async function sendReferrerNotification(
  email: string,
  subject: string,
  body: string,
) {
  console.info("[email:referrer]", email, subject, body);
}

export async function notifyNewLead(params: {
  clientName: string;
  clientPhone: string;
  referrerName: string;
  refCode: string;
}) {
  await sendAdminNotification(
    "Новая реферальная заявка Fils",
    `Клиент: ${params.clientName}, ${params.clientPhone}\nРеферер: ${params.referrerName} (${params.refCode})`,
  );
}

export async function notifyBonusAccrued(params: {
  email: string;
  name: string;
  amount: number;
  percent: number;
}) {
  await sendReferrerNotification(
    params.email,
    "Начислен бонус Fils",
    `${params.name}, на ваш баланс начислено ${params.amount} ₽ (${params.percent}%).`,
  );

  await sendAdminNotification(
    "Начислен бонус Fils",
    `${params.name}: ${params.amount.toLocaleString("ru-RU")} ₽ (${params.percent}%)`,
  );
}

export async function notifyWithdrawalRequest(params: {
  userName: string;
  amount: number;
  details: string;
}) {
  await sendAdminNotification(
    "Запрос на вывод бонуса Fils",
    `${params.userName} запросил вывод ${params.amount} ₽.\nРеквизиты: ${params.details}`,
  );
}

export async function notifySpendRequest(params: {
  userName: string;
  amount: number;
  details: string;
}) {
  await sendAdminNotification(
    "Заявка на использование бонуса Fils",
    `${params.userName} хочет использовать ${params.amount} ₽ на заказ.\nКомментарий: ${params.details}`,
  );
}

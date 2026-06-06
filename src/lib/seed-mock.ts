import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "info@filsdesign.ru";
const MOCK_REFERRER_EMAILS = ["elena.mock@fillsdesign.ru", "alex.mock@fillsdesign.ru"] as const;

export const SEED_DEFAULT_PASSWORD = "Fils2024!";

async function clearMockData(client: PrismaClient) {
  const mockUsers = await client.user.findMany({
    where: {
      OR: [{ email: ADMIN_EMAIL }, { email: { in: [...MOCK_REFERRER_EMAILS] } }],
    },
    select: { id: true },
  });

  const userIds = mockUsers.map((user) => user.id);

  if (userIds.length === 0) {
    return;
  }

  await client.transaction.deleteMany({ where: { userId: { in: userIds } } });
  await client.referral.deleteMany({ where: { referrerId: { in: userIds } } });
}

export async function seedMockData(
  client: PrismaClient = prisma,
  password = process.env.SEED_PASSWORD ?? SEED_DEFAULT_PASSWORD,
) {
  const passwordHash = await bcrypt.hash(password, 12);

  await clearMockData(client);

  const admin = await client.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Ирина Fils",
      phone: "79603303919",
      passwordHash,
      refCode: "FILSADMN",
      isAdmin: true,
      successfulOrders: 2,
      bonusBalance: 47600,
    },
    create: {
      name: "Ирина Fils",
      email: ADMIN_EMAIL,
      phone: "79603303919",
      passwordHash,
      refCode: "FILSADMN",
      isAdmin: true,
      successfulOrders: 2,
      bonusBalance: 47600,
    },
  });

  const elena = await client.user.upsert({
    where: { email: MOCK_REFERRER_EMAILS[0] },
    update: {
      name: "Елена Петрова",
      phone: "79990002001",
      passwordHash,
      refCode: "ELENA001",
      successfulOrders: 1,
      bonusBalance: 18500,
    },
    create: {
      name: "Елена Петрова",
      email: MOCK_REFERRER_EMAILS[0],
      phone: "79990002001",
      passwordHash,
      refCode: "ELENA001",
      successfulOrders: 1,
      bonusBalance: 18500,
    },
  });

  const alex = await client.user.upsert({
    where: { email: MOCK_REFERRER_EMAILS[1] },
    update: {
      name: "Алексей Дизайнер",
      phone: "79990002002",
      passwordHash,
      refCode: "ALEX0001",
      successfulOrders: 0,
      bonusBalance: 0,
    },
    create: {
      name: "Алексей Дизайнер",
      email: MOCK_REFERRER_EMAILS[1],
      phone: "79990002002",
      passwordHash,
      refCode: "ALEX0001",
    },
  });

  const mariaReferral = await client.referral.create({
    data: {
      referrerId: admin.id,
      clientName: "Мария Соколова",
      clientPhone: "79990001001",
      clientEmail: "maria@example.com",
      source: "LINK",
      status: "BONUS_ACCRUED",
      notes: "MOCK: первый успешный заказ",
      order: {
        create: {
          amount: 500000,
          status: "BONUS_ACCRUED",
          bonusPercent: 5,
          bonusAmount: 25000,
          paidAt: new Date("2026-03-10T12:00:00.000Z"),
          deliveredAt: new Date("2026-03-25T16:00:00.000Z"),
          bonusAccruedAt: new Date("2026-03-26T10:00:00.000Z"),
        },
      },
    },
    include: { order: true },
  });

  const sergeyReferral = await client.referral.create({
    data: {
      referrerId: admin.id,
      clientName: "Сергей Волков",
      clientPhone: "79990001002",
      clientEmail: "sergey@example.com",
      source: "CODE",
      status: "BONUS_ACCRUED",
      notes: "MOCK: второй успешный заказ",
      order: {
        create: {
          amount: 680000,
          status: "BONUS_ACCRUED",
          bonusPercent: 7,
          bonusAmount: 47600,
          paidAt: new Date("2026-04-05T12:00:00.000Z"),
          deliveredAt: new Date("2026-04-20T14:00:00.000Z"),
          bonusAccruedAt: new Date("2026-04-21T09:00:00.000Z"),
        },
      },
    },
    include: { order: true },
  });

  await client.referral.createMany({
    data: [
      {
        referrerId: admin.id,
        clientName: "Анна Кузнецова",
        clientPhone: "79990001003",
        source: "LINK",
        status: "LEAD",
        notes: "MOCK: новая заявка с Tilda",
      },
      {
        referrerId: admin.id,
        clientName: "Дмитрий Орлов",
        clientPhone: "79990001004",
        source: "LINK",
        status: "IN_PROGRESS",
        notes: "MOCK: менеджер ведёт сделку",
      },
      {
        referrerId: admin.id,
        clientName: "Елена Морозова",
        clientPhone: "79990001005",
        source: "CODE",
        status: "PAID",
        notes: "MOCK: заказ оплачен, ждёт доставку",
      },
      {
        referrerId: elena.id,
        clientName: "Ольга Иванова",
        clientPhone: "79990001006",
        source: "LINK",
        status: "DELIVERED",
        notes: "MOCK: готово к начислению бонуса",
      },
      {
        referrerId: alex.id,
        clientName: "Павел Новиков",
        clientPhone: "79990001007",
        source: "LINK",
        status: "LEAD",
        notes: "MOCK: заявка другого реферера",
      },
    ],
  });

  const referralsNeedingOrders = await client.referral.findMany({
    where: {
      clientPhone: {
        in: ["79990001003", "79990001004", "79990001005", "79990001006", "79990001007"],
      },
    },
  });

  for (const referral of referralsNeedingOrders) {
    if (referral.clientPhone === "79990001004") {
      await client.order.create({
        data: { referralId: referral.id, amount: 420000, status: "PENDING" },
      });
    } else if (referral.clientPhone === "79990001005") {
      await client.order.create({
        data: {
          referralId: referral.id,
          amount: 390000,
          status: "PAID",
          paidAt: new Date("2026-05-28T11:00:00.000Z"),
        },
      });
    } else if (referral.clientPhone === "79990001006") {
      await client.order.create({
        data: {
          referralId: referral.id,
          amount: 370000,
          status: "DELIVERED",
          paidAt: new Date("2026-05-10T10:00:00.000Z"),
          deliveredAt: new Date("2026-05-24T15:00:00.000Z"),
        },
      });
    } else {
      await client.order.create({
        data: { referralId: referral.id },
      });
    }
  }

  await client.transaction.createMany({
    data: [
      {
        userId: admin.id,
        orderId: mariaReferral.order!.id,
        type: "ACCRUAL",
        amount: 25000,
        status: "COMPLETED",
        details: "Бонус 5% за заказ клиента Мария Соколова",
      },
      {
        userId: admin.id,
        orderId: sergeyReferral.order!.id,
        type: "ACCRUAL",
        amount: 47600,
        status: "COMPLETED",
        details: "Бонус 7% за заказ клиента Сергей Волков",
      },
      {
        userId: admin.id,
        type: "WITHDRAWAL_REQUEST",
        amount: 10000,
        status: "PENDING",
        details: "Сбербанк •••• 4521, Ирина Ф.",
      },
      {
        userId: admin.id,
        type: "SPEND",
        amount: 15000,
        status: "PENDING",
        details: "Списать на заказ дивана Fils, модель Loft",
      },
      {
        userId: elena.id,
        type: "ACCRUAL",
        amount: 18500,
        status: "COMPLETED",
        details: "Бонус 5% за заказ клиента (mock)",
      },
      {
        userId: elena.id,
        type: "WITHDRAWAL_REQUEST",
        amount: 5000,
        status: "PENDING",
        details: "Тинькофф •••• 7788",
      },
    ],
  });

  return {
    adminEmail: ADMIN_EMAIL,
    password,
    referrers: 3,
    referrals: 7,
  };
}

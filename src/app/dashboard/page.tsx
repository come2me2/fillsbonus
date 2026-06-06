import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getReferralLink } from "@/lib/ref-code";
import { formatMoney, getNextTierInfo } from "@/lib/bonus";
import { CopyButton } from "@/components/CopyButton";
import { StatusBadge } from "@/components/StatusBadge";
import { BalanceActions } from "@/components/BalanceActions";
import { formatPhone } from "@/lib/phone";

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const tier = getNextTierInfo(user.successfulOrders);
  const referralLink = getReferralLink(user.refCode);

  const [referrals, transactions] = await Promise.all([
    prisma.referral.findMany({
      where: { referrerId: user.id },
      include: { order: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent">Личный кабинет</p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-dark">Здравствуйте, {user.name}</h1>
        </div>
        <div className="rounded-3xl border border-border bg-card px-6 py-4">
          <p className="text-sm text-muted">Бонусный баланс</p>
          <p className="text-3xl font-semibold text-brand">{formatMoney(user.bonusBalance)}</p>
        </div>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium">Ваша реферальная ссылка</h2>
          <p className="mt-3 break-all rounded-2xl bg-white px-4 py-3 text-sm">{referralLink}</p>
          <div className="mt-4">
            <CopyButton value={referralLink} label="Копировать ссылку" />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium">Ваш промокод</h2>
          <p className="mt-3 text-3xl font-semibold tracking-[0.2em] text-brand">{user.refCode}</p>
          <div className="mt-4">
            <CopyButton value={user.refCode} label="Копировать код" />
          </div>
          <p className="mt-4 text-sm text-muted">
            Текущий уровень: {tier.currentPercent}%.
            {tier.nextPercent
              ? ` Ещё ${tier.referralsUntilNext} успешный заказ до ${tier.nextPercent}%.`
              : " Вы достигли максимального уровня 10%."}
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-medium">Приведённые клиенты</h2>
        <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-white/70">
              <tr>
                <th className="px-4 py-3">Клиент</th>
                <th className="px-4 py-3">Телефон</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Бонус</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-muted">
                    Пока нет приведённых клиентов. Поделитесь ссылкой или промокодом.
                  </td>
                </tr>
              ) : (
                referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-border last:border-none">
                    <td className="px-4 py-3">{referral.clientName}</td>
                    <td className="px-4 py-3">{formatPhone(referral.clientPhone)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={referral.status} />
                    </td>
                    <td className="px-4 py-3">
                      {Number(referral.order?.amount ?? 0) > 0
                        ? formatMoney(Number(referral.order?.amount))
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {referral.order?.bonusAmount
                        ? formatMoney(Number(referral.order.bonusAmount))
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-medium">История операций</h2>
        <div className="mt-4 space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted">Операций пока нет</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <StatusBadge status={transaction.type} />
                  <p className="mt-1 text-sm text-muted">{transaction.details}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatMoney(Number(transaction.amount))}</p>
                  <StatusBadge status={transaction.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-medium">Использовать баланс</h2>
        <div className="mt-4">
          <BalanceActions balance={user.bonusBalance} />
        </div>
      </section>
    </div>
  );
}

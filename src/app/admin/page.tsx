import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/AdminPanel";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const [referrals, pendingTransactions, referrers] = await Promise.all([
    prisma.referral.findMany({
      include: { referrer: true, order: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.transaction.findMany({
      where: {
        status: "PENDING",
        type: { in: ["WITHDRAWAL_REQUEST", "SPEND"] },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { referrals: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-brand-dark">Админка Fils Bonus</h1>
      <p className="mt-2 text-muted">
        Подтверждайте статусы заказов, начисляйте бонусы и обрабатывайте заявки на вывод.
      </p>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Рефереры</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-white/70">
              <tr>
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3">Код</th>
                <th className="px-4 py-3">Успешных заказов</th>
                <th className="px-4 py-3">Баланс</th>
                <th className="px-4 py-3">Заявок</th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((referrer) => (
                <tr key={referrer.id} className="border-b border-border last:border-none">
                  <td className="px-4 py-3">{referrer.name}</td>
                  <td className="px-4 py-3">{referrer.refCode}</td>
                  <td className="px-4 py-3">{referrer.successfulOrders}</td>
                  <td className="px-4 py-3">
                    {Number(referrer.bonusBalance).toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="px-4 py-3">{referrer._count.referrals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10">
        <AdminPanel
          initialReferrals={JSON.parse(JSON.stringify(referrals))}
          initialTransactions={JSON.parse(JSON.stringify(pendingTransactions))}
        />
      </div>
    </div>
  );
}

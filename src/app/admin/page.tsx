import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminStats } from "@/components/AdminStats";
import { ReferrerTable } from "@/components/ReferrerTable";
import { SeedMockButton } from "@/components/SeedMockButton";

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
      <h1 className="text-3xl font-semibold text-brand-dark">Админка FILLS Bonus</h1>
      <p className="mt-2 text-muted">
        Подтверждайте статусы заказов, начисляйте бонусы и обрабатывайте заявки на вывод.
      </p>

      <SeedMockButton />

      <AdminStats referrals={JSON.parse(JSON.stringify(referrals))} />

      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Рефереры</h2>
        <p className="mt-1 text-sm text-muted">
          Нажмите «Изменить» рядом с промокодом, чтобы задать красивый код участнику.
        </p>
        <ReferrerTable initialReferrers={JSON.parse(JSON.stringify(referrers))} />
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

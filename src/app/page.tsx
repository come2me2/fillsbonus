import { ReferralStatus } from "@/generated/prisma/client";
import { HomeHero } from "@/components/HomeHero";
import { BonusCalculator } from "@/components/BonusCalculator";
import { HomeStats } from "@/components/HomeStats";
import { HomeFAQ } from "@/components/HomeFAQ";
import { StickyRegisterBar } from "@/components/StickyRegisterBar";
import { CLIENT_DISCOUNT_PERCENT, REFERRER_BONUS_PERCENT } from "@/lib/bonus";
import { getDisplayHomeStats } from "@/lib/home-stats-display";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const steps = [
  "Зарегистрируйтесь и получите персональную ссылку и промокод",
  `Поделитесь ими с друзьями — они получат скидку ${CLIENT_DISCOUNT_PERCENT}% на заказ мебели FILLS`,
  `После оплаты и доставки заказа вам начисляется ${REFERRER_BONUS_PERCENT}% на бонусный баланс`,
];

export default async function HomePage() {
  const user = await getSessionUser();

  const [participants, bonusAggregate, successfulOrders] = await Promise.all([
    prisma.user.count(),
    prisma.order.aggregate({
      _sum: { bonusAmount: true },
    }),
    prisma.referral.count({
      where: { status: ReferralStatus.BONUS_ACCRUED },
    }),
  ]);

  const totalBonuses = Number(bonusAggregate._sum.bonusAmount ?? 0);
  const displayStats = getDisplayHomeStats({
    participants,
    totalBonuses,
    successfulOrders,
  });

  return (
    <div
      className={`mx-auto max-w-6xl px-6 py-16 ${user ? "pb-8" : "pb-20 sm:pb-16"}`}
    >
      <HomeHero />

      <div className="mt-20">
        <BonusCalculator />
      </div>

      <div className="mt-20">
        <HomeStats
          participants={displayStats.participants}
          totalBonuses={displayStats.totalBonuses}
          successfulOrders={displayStats.successfulOrders}
        />
      </div>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step} className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-accent">Шаг {index + 1}</p>
            <p className="mt-4 text-lg leading-relaxed">{step}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 rounded-[2rem] bg-muted/20 px-8 py-10">
        <h2 className="text-2xl font-medium text-brand-dark">Как работает бонусный баланс</h2>
        <p className="mt-4 max-w-3xl text-muted">
          Бонус {REFERRER_BONUS_PERCENT}% начисляется только после того, как заказ полностью оплачен
          и доставлен. Дальше вы сами решаете: использовать баланс на следующий заказ FILLS или
          отправить запрос на вывод средств.
        </p>
      </section>

      <div className="mt-12">
        <HomeFAQ />
      </div>

      {!user ? (
        <div className="mt-12">
          <StickyRegisterBar />
        </div>
      ) : null}
    </div>
  );
}

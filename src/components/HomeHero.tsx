import Link from "next/link";
import { Money } from "@/components/Money";
import {
  CLIENT_DISCOUNT_PERCENT,
  REFERRER_BONUS_PERCENT,
  calculateBonusAmount,
  calculateClientDiscount,
} from "@/lib/bonus";

const EXAMPLE_ORDER = 200_000;

export function HomeHero() {
  const { finalAmount } = calculateClientDiscount(EXAMPLE_ORDER);
  const { bonus } = calculateBonusAmount(finalAmount);

  return (
    <section className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-start">
      <div className="min-w-0">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">FILLS Referral Program</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-brand-dark md:text-5xl">
          Рекомендуйте мебель FILLS —{" "}
          <span className="text-accent">зарабатывайте на каждом заказе</span>
        </h1>
        <p className="mt-4 text-xl text-brand-dark">
          {REFERRER_BONUS_PERCENT}% вам на баланс · {CLIENT_DISCOUNT_PERCENT}% скидка другу
        </p>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Бесплатная регистрация, персональная ссылка и промокод. Бонус начисляется после оплаты и
          доставки — его можно потратить на мебель или вывести.
        </p>
        <p className="mt-4 inline-flex flex-wrap items-center gap-1 rounded-full bg-accent/10 px-4 py-2 text-sm text-accent">
          Пример: заказ друга на <Money amount={EXAMPLE_ORDER} /> → ваш бонус{" "}
          <Money amount={bonus} />
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="btn-pill rounded-full bg-brand px-6 py-3.5 text-center font-medium text-white hover:bg-brand-dark"
          >
            Получить ссылку и промокод
          </Link>
          <Link href="/login" className="text-sm font-medium text-muted underline-offset-4 hover:text-brand-dark hover:underline">
            Уже есть аккаунт? Войти
          </Link>
        </div>
      </div>

      <div className="min-w-0">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium">Условия программы</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span className="text-sm text-muted">Вступление</span>
              <span className="text-lg font-semibold text-brand">
                <Money amount={0} />
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span className="text-sm text-muted">Скидка другу</span>
              <span className="text-2xl font-semibold text-brand">{CLIENT_DISCOUNT_PERCENT}%</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span className="text-sm text-muted">Ваш бонус</span>
              <span className="text-2xl font-semibold text-brand">{REFERRER_BONUS_PERCENT}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

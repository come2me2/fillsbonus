import Link from "next/link";
import { CLIENT_DISCOUNT_PERCENT, REFERRER_BONUS_PERCENT } from "@/lib/bonus";

const steps = [
  "Зарегистрируйтесь и получите персональную ссылку и промокод",
  `Поделитесь ими с друзьями — они получат скидку ${CLIENT_DISCOUNT_PERCENT}% на заказ мебели FILLS`,
  `После оплаты и доставки заказа вам начисляется ${REFERRER_BONUS_PERCENT}% на бонусный баланс`,
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent">FILLS Referral Program</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-brand-dark md:text-5xl">
            Приводите друзей — получайте {REFERRER_BONUS_PERCENT}% от оплаченного заказа
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Реферальная программа FILLS для клиентов и партнёров. Делитесь ссылкой или
            промокодом — ваш друг получит скидку {CLIENT_DISCOUNT_PERCENT}%, а вы получите{" "}
            {REFERRER_BONUS_PERCENT}% на баланс после доставки заказа. Бонус можно потратить на
            мебель или запросить вывод.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="btn-pill rounded-full bg-brand px-5 py-3 text-center font-medium text-white hover:bg-brand-dark sm:px-6"
            >
              Стать участником
            </Link>
            <Link
              href="/login"
              className="btn-pill rounded-full border border-border px-5 py-3 text-center font-medium text-brand sm:px-6"
            >
              Войти в кабинет
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <h2 className="text-xl font-medium">Условия программы</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span className="text-sm text-muted">Скидка приглашённому другу</span>
              <span className="text-2xl font-semibold text-brand">{CLIENT_DISCOUNT_PERCENT}%</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
              <span className="text-sm text-muted">Бонус пригласившему</span>
              <span className="text-2xl font-semibold text-brand">{REFERRER_BONUS_PERCENT}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step} className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-accent">Шаг {index + 1}</p>
            <p className="mt-4 text-lg leading-relaxed">{step}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 rounded-[2rem] bg-brand px-8 py-10 text-white">
        <h2 className="text-2xl font-medium">Как работает бонусный баланс</h2>
        <p className="mt-4 max-w-3xl text-white/80">
          Бонус {REFERRER_BONUS_PERCENT}% начисляется только после того, как заказ полностью оплачен
          и доставлен. Дальше вы сами решаете: использовать баланс на следующий заказ FILLS или
          отправить запрос на вывод средств.
        </p>
      </section>
    </div>
  );
}

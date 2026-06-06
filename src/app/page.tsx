import Link from "next/link";

const steps = [
  "Зарегистрируйтесь и получите персональную ссылку и промокод",
  "Поделитесь ими с друзьями, которые планируют заказать мебель Fils",
  "После оплаты и доставки заказа бонус начисляется на ваш баланс",
];

const tiers = [
  { label: "1-й успешный заказ", value: "5%" },
  { label: "2-й успешный заказ", value: "7%" },
  { label: "3-й и следующие", value: "10%" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Fils Referral Program</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-brand-dark md:text-5xl">
            Приводите друзей — получайте до 10% от оплаченного заказа
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Реферальная программа Fils для клиентов и партнёров. Делитесь ссылкой или
            промокодом, а после доставки заказа бонус поступает на ваш баланс. Его можно
            потратить на мебель или запросить вывод.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark"
            >
              Стать участником
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-border px-6 py-3 font-medium text-brand"
            >
              Войти в кабинет
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <h2 className="text-xl font-medium">Ступени вознаграждения</h2>
          <div className="mt-6 space-y-4">
            {tiers.map((tier) => (
              <div
                key={tier.label}
                className="flex items-center justify-between rounded-2xl border border-border px-4 py-3"
              >
                <span className="text-sm text-muted">{tier.label}</span>
                <span className="text-2xl font-semibold text-brand">{tier.value}</span>
              </div>
            ))}
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
          Бонус начисляется только после того, как заказ полностью оплачен и доставлен.
          Дальше вы сами решаете: использовать баланс на следующий заказ Fils или
          отправить запрос на вывод средств.
        </p>
      </section>
    </div>
  );
}

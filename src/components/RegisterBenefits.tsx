import { CLIENT_DISCOUNT_PERCENT, REFERRER_BONUS_PERCENT } from "@/lib/bonus";

const steps = [
  "Зарегистрируйтесь — получите ссылку и промокод",
  `Поделитесь с другом — он получит скидку ${CLIENT_DISCOUNT_PERCENT}%`,
  `После доставки заказа вам начисляется ${REFERRER_BONUS_PERCENT}% на баланс`,
];

export function RegisterBenefits() {
  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <h2 className="text-xl font-medium text-brand-dark">Что вы получите сразу</h2>
      <ul className="mt-6 space-y-4">
        <li className="flex gap-3">
          <span className="mt-0.5 text-accent">✓</span>
          <span className="text-sm text-muted">
            Персональная реферальная ссылка для друзей
          </span>
        </li>
        <li className="flex gap-3">
          <span className="mt-0.5 text-accent">✓</span>
          <span className="text-sm text-muted">Уникальный промокод для заявок на сайте FILLS</span>
        </li>
        <li className="flex gap-3">
          <span className="mt-0.5 text-accent">✓</span>
          <span className="text-sm text-muted">
            Скидка {CLIENT_DISCOUNT_PERCENT}% другу и бонус {REFERRER_BONUS_PERCENT}% вам с каждого
            заказа
          </span>
        </li>
        <li className="flex gap-3">
          <span className="mt-0.5 text-accent">✓</span>
          <span className="text-sm text-muted">Личный кабинет с балансом и историей операций</span>
        </li>
      </ul>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm uppercase tracking-[0.2em] text-accent">Как это работает</p>
        <ol className="mt-4 space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-muted">
              <span className="font-medium text-brand-dark">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

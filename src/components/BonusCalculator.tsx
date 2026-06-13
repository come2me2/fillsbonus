"use client";

import Link from "next/link";
import { useState } from "react";
import {
  calculateBonusAmount,
  calculateClientDiscount,
  formatMoney,
  REFERRER_BONUS_PERCENT,
  CLIENT_DISCOUNT_PERCENT,
} from "@/lib/bonus";

const MIN_AMOUNT = 50_000;
const MAX_AMOUNT = 2_000_000;
const DEFAULT_AMOUNT = 200_000;

export function BonusCalculator() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);

  const { discount, finalAmount } = calculateClientDiscount(amount);
  const { bonus } = calculateBonusAmount(finalAmount);

  return (
    <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
      <h2 className="text-2xl font-medium text-brand-dark">Сколько вы заработаете?</h2>
      <p className="mt-2 text-muted">
        Укажите примерную сумму заказа друга — мы покажем скидку и ваш бонус.
      </p>

      <div className="mt-8">
        <label className="mb-2 block text-sm text-muted">Сумма заказа друга (смета до скидки)</label>
        <input
          type="range"
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          step={10_000}
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value))}
          className="w-full accent-brand"
        />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">{formatMoney(MIN_AMOUNT)}</span>
          <span className="text-xl font-semibold text-brand-dark">{formatMoney(amount)}</span>
          <span className="text-muted">{formatMoney(MAX_AMOUNT)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-muted/20 p-4">
          <p className="text-sm text-muted">Скидка другу ({CLIENT_DISCOUNT_PERCENT}%)</p>
          <p className="mt-1 text-xl font-semibold text-green-700">−{formatMoney(discount)}</p>
        </div>
        <div className="rounded-2xl bg-muted/20 p-4">
          <p className="text-sm text-muted">Друг заплатит</p>
          <p className="mt-1 text-xl font-semibold">{formatMoney(finalAmount)}</p>
        </div>
        <div className="rounded-2xl bg-accent/10 p-4">
          <p className="text-sm text-muted">Ваш бонус ({REFERRER_BONUS_PERCENT}%)</p>
          <p className="mt-1 text-xl font-semibold text-accent">{formatMoney(bonus)}</p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/register"
          className="btn-pill inline-flex rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark"
        >
          Зарегистрироваться и начать зарабатывать
        </Link>
      </div>
    </section>
  );
}

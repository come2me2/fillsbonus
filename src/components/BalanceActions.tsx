"use client";

import { FormEvent, useState } from "react";

export function BalanceActions({ balance }: { balance: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function submit(endpoint: string, formData: FormData) {
    setLoading(endpoint);
    setMessage(null);
    setError(null);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });

    const data = await response.json();
    setLoading(null);

    if (!response.ok || !data.ok) {
      setError(data.error ?? "Не удалось отправить заявку");
      return;
    }

    setMessage("Заявка отправлена. Менеджер свяжется с вами.");
    window.location.reload();
  }

  function handleWithdraw(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit("/api/transactions/withdraw", new FormData(event.currentTarget));
  }

  function handleSpend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit("/api/transactions/spend", new FormData(event.currentTarget));
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={handleWithdraw} className="rounded-3xl border border-border bg-card p-6">
        <h3 className="text-lg font-medium">Запросить вывод</h3>
        <p className="mt-2 text-sm text-muted">Доступно: {balance.toLocaleString("ru-RU")} руб.</p>
        <input
          name="amount"
          type="number"
          min={1}
          max={balance}
          required
          placeholder="Сумма"
          className="mt-4 w-full rounded-2xl border border-border bg-white px-4 py-3"
        />
        <textarea
          name="details"
          required
          placeholder="Реквизиты для перевода"
          className="mt-3 w-full rounded-2xl border border-border bg-white px-4 py-3"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading !== null || balance <= 0}
          className="btn-pill mt-4 rounded-full bg-brand px-5 py-2 text-center text-white disabled:opacity-50"
        >
          Отправить запрос
        </button>
      </form>

      <form onSubmit={handleSpend} className="rounded-3xl border border-border bg-card p-6">
        <h3 className="text-lg font-medium">Использовать на заказ</h3>
        <p className="mt-2 text-sm text-muted">Списать баланс на покупку мебели FILLS</p>
        <input
          name="amount"
          type="number"
          min={1}
          max={balance}
          required
          placeholder="Сумма"
          className="mt-4 w-full rounded-2xl border border-border bg-white px-4 py-3"
        />
        <textarea
          name="details"
          required
          placeholder="Опишите заказ или пожелания"
          className="mt-3 w-full rounded-2xl border border-border bg-white px-4 py-3"
          rows={3}
        />
        <button
          type="submit"
          disabled={loading !== null || balance <= 0}
          className="btn-pill mt-4 rounded-full bg-brand px-5 py-2 text-center text-white disabled:opacity-50"
        >
          Отправить заявку
        </button>
      </form>

      {message ? <p className="text-sm text-green-700 md:col-span-2">{message}</p> : null}
      {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
    </div>
  );
}

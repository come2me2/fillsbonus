"use client";

import { FormEvent, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

type Referral = {
  id: string;
  clientName: string;
  clientPhone: string;
  status: string;
  createdAt: string;
  referrer: { name: string; refCode: string };
  order: { amount: string | number; bonusAmount?: string | number | null } | null;
};

export function AdminPanel({
  initialReferrals,
  initialTransactions,
}: {
  initialReferrals: Referral[];
  initialTransactions: Array<{
    id: string;
    type: string;
    status: string;
    amount: string | number;
    details?: string | null;
    user: { name: string };
  }>;
}) {
  const [referrals, setReferrals] = useState(initialReferrals);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [message, setMessage] = useState<string | null>(null);

  async function updateReferral(id: string, payload: Record<string, unknown>) {
    const response = await fetch(`/api/admin/referrals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Ошибка обновления");
      return;
    }

    setReferrals((current) =>
      current.map((item) => (item.id === id ? { ...item, ...data.referral } : item)),
    );
    setMessage("Статус обновлён");
    window.location.reload();
  }

  async function updateTransaction(id: string, action: "approve" | "reject") {
    const response = await fetch(`/api/admin/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Ошибка обновления");
      return;
    }

    setTransactions((current) => current.filter((item) => item.id !== id));
    setMessage("Транзакция обновлена");
    window.location.reload();
  }

  function handleAmountSubmit(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void updateReferral(id, {
      action: "set_amount",
      amount: formData.get("amount"),
    });
  }

  return (
    <div className="space-y-8">
      {message ? <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p> : null}

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Заявки и заказы</h2>
        <div className="mt-6 space-y-4">
          {referrals.map((referral) => (
            <div key={referral.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{referral.clientName}</p>
                  <p className="text-sm text-muted">{referral.clientPhone}</p>
                  <p className="text-sm text-muted">
                    Реферер: {referral.referrer.name} ({referral.referrer.refCode})
                  </p>
                </div>
                <StatusBadge status={referral.status} />
              </div>

              <form
                onSubmit={(event) => handleAmountSubmit(referral.id, event)}
                className="mt-4 flex flex-wrap items-end gap-3"
              >
                <div>
                  <label className="mb-1 block text-xs text-muted">Сумма сметы, ₽</label>
                  <input
                    name="amount"
                    type="number"
                    min={1}
                    defaultValue={Number(referral.order?.amount ?? 0) || undefined}
                    className="rounded-xl border border-border px-3 py-2"
                  />
                </div>
                <button type="submit" className="rounded-full bg-brand px-4 py-2 text-sm text-white">
                  Сохранить сумму
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateReferral(referral.id, { action: "set_status", status: "IN_PROGRESS" })}
                  className="rounded-full border border-border px-4 py-2 text-sm"
                >
                  В работе
                </button>
                <button
                  type="button"
                  onClick={() => updateReferral(referral.id, { action: "set_status", status: "PAID" })}
                  className="rounded-full border border-border px-4 py-2 text-sm"
                >
                  Оплачен
                </button>
                <button
                  type="button"
                  onClick={() => updateReferral(referral.id, { action: "set_status", status: "DELIVERED" })}
                  className="rounded-full bg-brand px-4 py-2 text-sm text-white"
                >
                  Доставлен → начислить бонус
                </button>
                <button
                  type="button"
                  onClick={() => updateReferral(referral.id, { action: "reject" })}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Запросы на вывод и списание</h2>
        <div className="mt-6 space-y-4">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted">Нет ожидающих заявок</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{transaction.user.name}</p>
                    <p className="text-sm text-muted">{transaction.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {Number(transaction.amount).toLocaleString("ru-RU")} ₽
                    </p>
                    <StatusBadge status={transaction.type} />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateTransaction(transaction.id, "approve")}
                    className="rounded-full bg-brand px-4 py-2 text-sm text-white"
                  >
                    Подтвердить
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTransaction(transaction.id, "reject")}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

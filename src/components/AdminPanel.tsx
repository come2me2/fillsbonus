"use client";

import { FormEvent, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { CLIENT_DISCOUNT_PERCENT } from "@/lib/bonus";

type Order = {
  amount: string | number;
  quoteAmount?: string | number | null;
  clientDiscountPercent?: string | number | null;
  clientDiscountAmount?: string | number | null;
  bonusAmount?: string | number | null;
};

type Referral = {
  id: string;
  clientName: string;
  clientPhone: string;
  status: string;
  createdAt: string;
  referrer: { name: string; refCode: string };
  order: Order | null;
};

function previewClientDiscount(quoteAmount: number) {
  const discount = Math.round((quoteAmount * CLIENT_DISCOUNT_PERCENT) / 100);
  return {
    discount,
    finalAmount: quoteAmount - discount,
  };
}

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
      quoteAmount: formData.get("quoteAmount"),
    });
  }

  return (
    <div className="space-y-8">
      {message ? <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p> : null}

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-medium">Заявки и заказы</h2>
        <p className="mt-2 text-sm text-muted">
          Приглашённый клиент получает скидку {CLIENT_DISCOUNT_PERCENT}% от суммы сметы. Бонус рефереру
          начисляется с суммы к оплате после скидки.
        </p>
        <div className="mt-6 space-y-4">
          {referrals.map((referral) => {
            const order = referral.order;
            const defaultQuote =
              Number(order?.quoteAmount ?? 0) ||
              (order?.clientDiscountAmount
                ? Number(order.amount) + Number(order.clientDiscountAmount)
                : Number(order?.amount ?? 0)) ||
              undefined;

            return (
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

                {order?.quoteAmount ? (
                  <div className="mt-4 grid gap-2 rounded-2xl bg-muted/30 p-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-muted">Смета</p>
                      <p className="font-medium">{Number(order.quoteAmount).toLocaleString("ru-RU")} ₽</p>
                    </div>
                    <div>
                      <p className="text-muted">Скидка клиенту {CLIENT_DISCOUNT_PERCENT}%</p>
                      <p className="font-medium text-green-700">
                        −{Number(order.clientDiscountAmount ?? 0).toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                    <div>
                      <p className="text-muted">К оплате</p>
                      <p className="font-medium">{Number(order.amount).toLocaleString("ru-RU")} ₽</p>
                    </div>
                  </div>
                ) : null}

                <form
                  onSubmit={(event) => handleAmountSubmit(referral.id, event)}
                  className="mt-4 flex flex-wrap items-end gap-3"
                >
                  <div>
                    <label className="mb-1 block text-xs text-muted">Сумма сметы до скидки, ₽</label>
                    <input
                      name="quoteAmount"
                      type="number"
                      min={1}
                      defaultValue={defaultQuote}
                      className="rounded-xl border border-border px-3 py-2"
                      onChange={(event) => {
                        const value = Number(event.currentTarget.value);
                        const preview = event.currentTarget.form?.querySelector(
                          `[data-preview-for="${referral.id}"]`,
                        );
                        if (!preview || !value) {
                          if (preview) preview.textContent = "";
                          return;
                        }
                        const { discount, finalAmount } = previewClientDiscount(value);
                        preview.textContent = `Скидка ${CLIENT_DISCOUNT_PERCENT}%: −${discount.toLocaleString("ru-RU")} ₽ → к оплате ${finalAmount.toLocaleString("ru-RU")} ₽`;
                      }}
                    />
                    <p
                      data-preview-for={referral.id}
                      className="mt-1 text-xs text-muted"
                    />
                  </div>
                  <button type="submit" className="rounded-full bg-brand px-4 py-2 text-sm text-white">
                    Сохранить смету
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
            );
          })}
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

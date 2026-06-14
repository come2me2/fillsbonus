"use client";

import { FormEvent, useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { CLIENT_DISCOUNT_PERCENT, REFERRER_BONUS_PERCENT } from "@/lib/bonus";

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
  notes?: string | null;
  createdAt: string;
  referrer: { name: string; refCode: string };
  order: Order | null;
};

const STATUS_FILTERS = [
  { value: "ALL", label: "Все" },
  { value: "LEAD", label: "Заявка" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "PAID", label: "Оплачен" },
  { value: "DELIVERED", label: "Доставлен" },
  { value: "BONUS_ACCRUED", label: "Бонус начислен" },
] as const;

function previewClientDiscount(quoteAmount: number) {
  const discount = Math.round((quoteAmount * CLIENT_DISCOUNT_PERCENT) / 100);
  return {
    discount,
    finalAmount: quoteAmount - discount,
  };
}

function mergeReferral(current: Referral, update: Partial<Referral>): Referral {
  return {
    ...current,
    ...update,
    referrer: update.referrer ? { ...current.referrer, ...update.referrer } : current.referrer,
    order:
      update.order && current.order
        ? { ...current.order, ...update.order }
        : (update.order ?? current.order),
  };
}

function PhoneLink({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void copyPhone()}
        className="text-sm text-muted underline-offset-2 hover:text-brand-dark hover:underline"
        title="Скопировать телефон"
      >
        {phone}
        {copied ? " ✓" : null}
      </button>
      <a
        href={`tel:${phone.replace(/\s/g, "")}`}
        className="rounded-full border border-border px-2 py-0.5 text-xs text-muted hover:border-brand hover:text-brand-dark"
      >
        Позвонить
      </a>
    </div>
  );
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const filteredReferrals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return referrals.filter((referral) => {
      const matchSearch =
        !query ||
        referral.clientName.toLowerCase().includes(query) ||
        referral.clientPhone.includes(search.trim()) ||
        referral.referrer.name.toLowerCase().includes(query) ||
        referral.referrer.refCode.toLowerCase().includes(query);

      const matchStatus = statusFilter === "ALL" || referral.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [referrals, search, statusFilter]);

  function applyReferralUpdate(id: string, update: Partial<Referral>) {
    setReferrals((current) =>
      current.map((item) => (item.id === id ? mergeReferral(item, update) : item)),
    );
  }

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

    if (data.referral) {
      applyReferralUpdate(id, data.referral);
    }

    setMessage("Обновлено");
  }

  async function updateTransaction(id: string, action: "approve" | "reject") {
    const confirmText =
      action === "approve"
        ? "Подтвердить транзакцию?"
        : "Отклонить транзакцию? Средства вернутся на баланс.";

    if (!window.confirm(confirmText)) {
      return;
    }

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
  }

  async function createManualLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setManualLoading(true);

    const formData = new FormData(event.currentTarget);
    const clientEmail = String(formData.get("clientEmail") ?? "").trim();

    const response = await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: formData.get("clientName"),
        clientPhone: formData.get("clientPhone"),
        clientEmail: clientEmail || undefined,
        refCode: formData.get("refCode"),
        notes: formData.get("notes") || undefined,
      }),
    });

    const data = await response.json();
    setManualLoading(false);

    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Ошибка создания заявки");
      return;
    }

    setReferrals((current) => [data.referral, ...current]);
    setShowManualForm(false);
    event.currentTarget.reset();
    setMessage("Заявка создана");
  }

  function handleAmountSubmit(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    void updateReferral(id, {
      action: "set_amount",
      quoteAmount: formData.get("quoteAmount"),
    });
  }

  function handleReject(id: string) {
    if (!window.confirm("Отклонить заявку?")) {
      return;
    }

    void updateReferral(id, { action: "reject" });
  }

  function toggleNotes(id: string, currentNotes?: string | null) {
    setNotesOpen((current) => ({ ...current, [id]: !current[id] }));
    setNotesDraft((current) => ({
      ...current,
      [id]: current[id] ?? currentNotes ?? "",
    }));
  }

  function saveNotes(id: string) {
    void updateReferral(id, {
      action: "set_notes",
      notes: notesDraft[id] ?? "",
    }).then(() => {
      setNotesOpen((current) => ({ ...current, [id]: false }));
    });
  }

  return (
    <div className="space-y-8">
      {message ? (
        <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>
      ) : null}

      <section className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-medium">Заявки и заказы</h2>
          <button
            type="button"
            onClick={() => setShowManualForm((value) => !value)}
            className="rounded-full bg-brand px-4 py-2 text-sm text-white"
          >
            {showManualForm ? "Скрыть форму" : "+ Создать заявку"}
          </button>
        </div>

        {showManualForm ? (
          <form
            onSubmit={(event) => void createManualLead(event)}
            className="mt-6 grid gap-4 rounded-2xl border border-border bg-muted/20 p-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-xs text-muted">Имя клиента</label>
              <input
                name="clientName"
                required
                className="w-full rounded-xl border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Телефон</label>
              <input
                name="clientPhone"
                required
                className="w-full rounded-xl border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Email (опционально)</label>
              <input
                name="clientEmail"
                type="email"
                className="w-full rounded-xl border border-border px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">Промокод реферера</label>
              <input
                name="refCode"
                required
                className="w-full rounded-xl border border-border px-3 py-2 uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted">Комментарий</label>
              <textarea
                name="notes"
                rows={2}
                className="w-full rounded-xl border border-border px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={manualLoading}
                className="rounded-full bg-brand px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {manualLoading ? "Создание..." : "Создать заявку"}
              </button>
            </div>
          </form>
        ) : null}

        <p className="mt-4 text-sm text-muted">
          Приглашённый клиент получает скидку {CLIENT_DISCOUNT_PERCENT}% от суммы сметы. Бонус
          рефереру — {REFERRER_BONUS_PERCENT}% от суммы к оплате после скидки.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по имени, телефону, рефереру..."
            className="w-full rounded-xl border border-border px-4 py-2 text-sm"
          />

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  statusFilter === filter.value
                    ? "bg-brand text-white"
                    : "border border-border text-muted hover:border-brand"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredReferrals.length === 0 ? (
            <p className="text-sm text-muted">Заявки не найдены</p>
          ) : (
            filteredReferrals.map((referral) => {
              const order = referral.order;
              const defaultQuote =
                Number(order?.quoteAmount ?? 0) ||
                (order?.clientDiscountAmount
                  ? Number(order.amount) + Number(order.clientDiscountAmount)
                  : Number(order?.amount ?? 0)) ||
                undefined;
              const isNotesOpen = notesOpen[referral.id];

              return (
                <div key={referral.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{referral.clientName}</p>
                      <PhoneLink phone={referral.clientPhone} />
                      <p className="text-sm text-muted">
                        Реферер: {referral.referrer.name} ({referral.referrer.refCode})
                      </p>
                      {referral.notes ? (
                        <p className="mt-2 rounded-xl bg-muted/30 px-3 py-2 text-sm text-muted">
                          {referral.notes}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge status={referral.status} />
                  </div>

                  {order?.quoteAmount ? (
                    <div className="mt-4 grid gap-2 rounded-2xl bg-muted/30 p-4 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-muted">Смета</p>
                        <p className="font-medium">
                          {Number(order.quoteAmount).toLocaleString("ru-RU")} руб.
                        </p>
                      </div>
                      <div>
                        <p className="text-muted">Скидка клиенту {CLIENT_DISCOUNT_PERCENT}%</p>
                        <p className="font-medium text-green-700">
                          −{Number(order.clientDiscountAmount ?? 0).toLocaleString("ru-RU")} руб.
                        </p>
                      </div>
                      <div>
                        <p className="text-muted">К оплате</p>
                        <p className="font-medium">
                          {Number(order.amount).toLocaleString("ru-RU")} руб.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <form
                    onSubmit={(event) => handleAmountSubmit(referral.id, event)}
                    className="mt-4 flex flex-wrap items-end gap-3"
                  >
                    <div>
                      <label className="mb-1 block text-xs text-muted">
                        Сумма сметы до скидки, руб.
                      </label>
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
                          preview.textContent = `Скидка ${CLIENT_DISCOUNT_PERCENT}%: −${discount.toLocaleString("ru-RU")} руб. → к оплате ${finalAmount.toLocaleString("ru-RU")} руб.`;
                        }}
                      />
                      <p data-preview-for={referral.id} className="mt-1 text-xs text-muted" />
                    </div>
                    <button
                      type="submit"
                      className="rounded-full bg-brand px-4 py-2 text-sm text-white"
                    >
                      Сохранить смету
                    </button>
                  </form>

                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => toggleNotes(referral.id, referral.notes)}
                      className="rounded-full border border-border px-4 py-2 text-sm"
                    >
                      {isNotesOpen ? "Скрыть заметку" : "Заметка"}
                    </button>

                    {isNotesOpen ? (
                      <div className="space-y-2">
                        <textarea
                          value={notesDraft[referral.id] ?? referral.notes ?? ""}
                          onChange={(event) =>
                            setNotesDraft((current) => ({
                              ...current,
                              [referral.id]: event.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                          placeholder="Комментарий менеджера..."
                        />
                        <button
                          type="button"
                          onClick={() => saveNotes(referral.id)}
                          className="rounded-full bg-brand px-4 py-2 text-sm text-white"
                        >
                          Сохранить заметку
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateReferral(referral.id, {
                          action: "set_status",
                          status: "IN_PROGRESS",
                        })
                      }
                      className="rounded-full border border-border px-4 py-2 text-sm"
                    >
                      В работе
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateReferral(referral.id, { action: "set_status", status: "PAID" })
                      }
                      className="rounded-full border border-border px-4 py-2 text-sm"
                    >
                      Оплачен
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateReferral(referral.id, {
                          action: "set_status",
                          status: "DELIVERED",
                        })
                      }
                      className="rounded-full bg-brand px-4 py-2 text-sm text-white"
                    >
                      Доставлен → начислить бонус
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(referral.id)}
                      className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
                    >
                      Отклонить
                    </button>
                  </div>
                </div>
              );
            })
          )}
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
                      {Number(transaction.amount).toLocaleString("ru-RU")} руб.
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

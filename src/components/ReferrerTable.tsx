"use client";

import { useState } from "react";

type Referrer = {
  id: string;
  name: string;
  refCode: string;
  successfulOrders: number;
  bonusBalance: string | number;
  _count: { referrals: number };
};

export function ReferrerTable({ initialReferrers }: { initialReferrers: Referrer[] }) {
  const [referrers, setReferrers] = useState(initialReferrers);
  const [editing, setEditing] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string | undefined>>({});

  function startEdit(id: string, current: string) {
    setEditing((prev) => ({ ...prev, [id]: current }));
    setError((prev) => ({ ...prev, [id]: undefined }));
  }

  function cancelEdit(id: string) {
    setEditing((prev) => ({ ...prev, [id]: undefined }));
    setError((prev) => ({ ...prev, [id]: undefined }));
  }

  async function saveRefCode(id: string) {
    const newCode = editing[id]?.trim().toUpperCase();
    if (!newCode) return;

    setLoading((prev) => ({ ...prev, [id]: true }));
    setError((prev) => ({ ...prev, [id]: undefined }));

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refCode: newCode }),
    });

    const data = await res.json();
    setLoading((prev) => ({ ...prev, [id]: false }));

    if (!res.ok || !data.ok) {
      setError((prev) => ({ ...prev, [id]: data.error ?? "Ошибка сохранения" }));
      return;
    }

    setReferrers((prev) =>
      prev.map((r) => (r.id === id ? { ...r, refCode: data.user.refCode } : r)),
    );
    setEditing((prev) => ({ ...prev, [id]: undefined }));
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-white/70">
          <tr>
            <th className="px-4 py-3">Имя</th>
            <th className="px-4 py-3">Промокод</th>
            <th className="px-4 py-3">Успешных заказов</th>
            <th className="px-4 py-3">Баланс</th>
            <th className="px-4 py-3">Заявок</th>
          </tr>
        </thead>
        <tbody>
          {referrers.map((referrer) => {
            const isEditing = editing[referrer.id] !== undefined;
            const isLoading = loading[referrer.id];
            const err = error[referrer.id];

            return (
              <tr key={referrer.id} className="border-b border-border last:border-none">
                <td className="px-4 py-3 font-medium">{referrer.name}</td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          value={editing[referrer.id] ?? ""}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [referrer.id]: e.target.value.toUpperCase(),
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void saveRefCode(referrer.id);
                            if (e.key === "Escape") cancelEdit(referrer.id);
                          }}
                          className="w-36 rounded-xl border border-border px-3 py-1.5 text-sm font-mono uppercase tracking-wider focus:border-brand focus:outline-none"
                          maxLength={20}
                          autoFocus
                          spellCheck={false}
                        />
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => void saveRefCode(referrer.id)}
                          className="rounded-full bg-brand px-3 py-1.5 text-xs text-white disabled:opacity-60"
                        >
                          {isLoading ? "..." : "Сохранить"}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelEdit(referrer.id)}
                          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted"
                        >
                          Отмена
                        </button>
                      </div>
                      {err ? <p className="text-xs text-red-600">{err}</p> : null}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium tracking-wider text-brand">
                        {referrer.refCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(referrer.id, referrer.refCode)}
                        className="rounded-full border border-border px-2 py-0.5 text-xs text-muted hover:border-brand hover:text-brand-dark"
                      >
                        Изменить
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{referrer.successfulOrders}</td>
                <td className="px-4 py-3">
                  {Number(referrer.bonusBalance).toLocaleString("ru-RU")} руб.
                </td>
                <td className="px-4 py-3">{referrer._count.referrals}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

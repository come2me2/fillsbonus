"use client";

import { useState } from "react";

export function SeedMockButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    if (!window.confirm("Загрузить демо-данные? Текущие mock-данные будут перезаписаны.")) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/admin/seed", { method: "POST" });
    const data = await response.json();
    setLoading(false);

    if (!response.ok || !data.ok) {
      setMessage(data.error ?? "Не удалось загрузить данные");
      return;
    }

    setMessage(
      `Готово. Войдите как ${data.adminEmail} / ${data.defaultPassword} и обновите страницу.`,
    );
    window.location.reload();
  }

  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">Демо-данные</p>
          <p className="text-sm text-muted">
            Заполнит кабинет и админку примерами заявок, бонусов и рефереров
          </p>
        </div>
        <button
          type="button"
          onClick={handleSeed}
          disabled={loading}
          className="rounded-full border border-border px-4 py-2 text-sm hover:bg-brand hover:text-white disabled:opacity-60"
        >
          {loading ? "Загрузка..." : "Загрузить mock-данные"}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}
    </div>
  );
}

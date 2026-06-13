"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    if (typeof payload.email === "string") payload.email = payload.email.trim();
    if (typeof payload.password === "string") payload.password = payload.password.trim();
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok || !data.ok) {
      setError(data.error ?? "Что-то пошло не так");
      return;
    }

    const nextPath = searchParams.get("next");
    const destination =
      nextPath ??
      (mode === "login" && data.user?.isAdmin ? "/admin" : "/dashboard");

    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
      {mode === "register" ? (
        <>
          <div>
            <label className="mb-2 block text-sm text-muted">Имя</label>
            <input
              name="name"
              required
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted">Телефон</label>
            <input
              name="phone"
              required
              placeholder="+7 (999) 123-45-67"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-brand"
            />
          </div>
        </>
      ) : null}

      <div>
        <label className="mb-2 block text-sm text-muted">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted">Пароль</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none focus:border-brand"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-pill w-full rounded-full bg-brand px-4 py-3 text-center font-medium text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
      </button>
    </form>
  );
}

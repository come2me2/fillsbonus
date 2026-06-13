import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="text-3xl font-semibold text-brand-dark">Вход</h1>
      <p className="mt-2 text-muted">Войдите в личный кабинет реферальной программы FILLS</p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted">Загрузка формы...</p>}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-muted">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-brand underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}

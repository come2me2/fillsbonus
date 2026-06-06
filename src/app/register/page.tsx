import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="text-3xl font-semibold text-brand-dark">Регистрация</h1>
      <p className="mt-2 text-muted">
        Создайте аккаунт и сразу получите персональную ссылку и промокод
      </p>
      <div className="mt-8">
        <AuthForm mode="register" />
      </div>
      <p className="mt-6 text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-brand underline">
          Войти
        </Link>
      </p>
    </div>
  );
}

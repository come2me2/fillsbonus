import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { RegisterBenefits } from "@/components/RegisterBenefits";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold text-brand-dark">Регистрация</h1>
        <p className="mt-2 text-muted">
          Создайте аккаунт и сразу получите персональную ссылку и промокод
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div>
          <AuthForm mode="register" />
          <p className="mt-6 text-sm text-muted">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-brand underline">
              Войти
            </Link>
          </p>
        </div>

        <RegisterBenefits />
      </div>
    </div>
  );
}

import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";
import { FillsLogo } from "@/components/FillsLogo";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <FillsLogo />
        <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-muted transition hover:text-accent">
                Кабинет
              </Link>
              {user.isAdmin ? (
                <Link href="/admin" className="text-muted transition hover:text-accent">
                  Админка
                </Link>
              ) : null}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted transition hover:text-accent">
                Войти
              </Link>
              <Link
                href="/register"
                className="btn-pill rounded-full bg-brand px-3 py-2 text-xs text-white hover:bg-brand-dark sm:px-4 sm:text-sm"
              >
                Стать участником
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

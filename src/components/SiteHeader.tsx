import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-[0.12em] text-brand sm:text-lg sm:tracking-[0.2em]"
        >
          FILLS BONUS
        </Link>
        <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-muted hover:text-brand">
                Кабинет
              </Link>
              {user.isAdmin ? (
                <Link href="/admin" className="text-muted hover:text-brand">
                  Админка
                </Link>
              ) : null}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-brand">
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

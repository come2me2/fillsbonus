import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { LogoutButton } from "@/components/LogoutButton";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-[0.2em] text-brand">
          FILS BONUS
        </Link>
        <nav className="flex items-center gap-4 text-sm">
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
                className="rounded-full bg-brand px-4 py-2 text-white hover:bg-brand-dark"
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

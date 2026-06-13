import Link from "next/link";
import { getMainSiteUrl } from "@/lib/site-urls";

export function SiteFooter() {
  const mainSiteUrl = getMainSiteUrl();

  return (
    <footer className="mt-8 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10">
        <div>
          <p className="font-medium text-brand-dark">FILLS Bonus</p>
          <p className="mt-1 text-sm text-muted">Реферальная программа мебельной фабрики FILLS</p>
        </div>

        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/register" className="text-muted hover:text-brand-dark">
            Регистрация
          </Link>
          <Link href="/login" className="text-muted hover:text-brand-dark">
            Вход
          </Link>
          <Link href="/#faq" className="text-muted hover:text-brand-dark">
            Условия
          </Link>
          <a
            href={mainSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-brand-dark"
          >
            fillsdesign.ru
          </a>
        </nav>
      </div>
    </footer>
  );
}

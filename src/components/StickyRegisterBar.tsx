import Link from "next/link";

export function StickyRegisterBar() {
  return (
    <>
      <section className="rounded-[2rem] bg-brand px-8 py-10 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-medium">Начните зарабатывать с FILLS</h2>
            <p className="mt-2 max-w-xl text-white/80">
              Зарегистрируйтесь за минуту — получите ссылку и промокод, делитесь ими с друзьями.
            </p>
          </div>
          <Link
            href="/register"
            className="btn-pill rounded-full bg-white px-6 py-3 font-medium text-brand hover:bg-white/90"
          >
            Стать участником
          </Link>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-3 backdrop-blur sm:hidden">
        <Link
          href="/register"
          className="btn-pill flex w-full rounded-full bg-brand py-3 text-center font-medium text-white"
        >
          Стать участником
        </Link>
      </div>
    </>
  );
}

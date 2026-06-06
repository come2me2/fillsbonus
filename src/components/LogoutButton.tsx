"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-pill rounded-full border border-border px-3 py-2 text-center text-sm hover:bg-brand hover:text-white sm:px-4"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      Выйти
    </button>
  );
}

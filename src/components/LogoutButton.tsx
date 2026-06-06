"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="rounded-full border border-border px-4 py-2 hover:bg-brand hover:text-white"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      Выйти
    </button>
  );
}

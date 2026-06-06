"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand hover:text-white"
    >
      {copied ? "Скопировано" : label ?? "Копировать"}
    </button>
  );
}

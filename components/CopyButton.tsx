"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value?: string | null; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return <button className="inline-flex min-h-8 items-center justify-center rounded-lg bg-accent px-3 text-xs font-extrabold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50" disabled={!value} onClick={copy} type="button">{copied ? "Copied" : label}</button>;
}

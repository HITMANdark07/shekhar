"use client";

import { useState } from "react";

/** Copies the address with a short "Copied" confirmation; falls back to mailto when clipboard is blocked. */
export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-mono text-sm transition-colors duration-150 hover:border-accent"
    >
      <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}

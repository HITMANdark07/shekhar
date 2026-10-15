import type { Metadata } from "next";
import { Terminal } from "@/components/terminal/terminal";

export const metadata: Metadata = {
  title: "Terminal",
  description: "The same portfolio, for people who prefer a shell.",
  robots: { index: false },
  alternates: { canonical: "/terminal" },
};

export default function TerminalPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-5xl">Terminal</h1>
      <p className="mt-3 text-fg-muted">The same portfolio, for people who prefer a shell. Try <code className="font-mono">help</code>.</p>
      <div className="mt-8">
        <Terminal />
      </div>
    </div>
  );
}

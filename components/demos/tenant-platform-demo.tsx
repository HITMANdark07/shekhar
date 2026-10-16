"use client";

import { useState } from "react";
import { BlueGreenDemo } from "./blue-green-demo";
import { FlowDemo } from "./flow-demo";

/** Two views of the multi-tenant platform: a tenant request, and the blue-green deploy. */
export function TenantPlatformDemo() {
  const [view, setView] = useState<"request" | "deploy">("request");
  return (
    <div className="space-y-4">
      <div role="group" aria-label="View" className="flex flex-wrap gap-2">
        {(
          [
            ["request", "Follow a tenant request"],
            ["deploy", "Ship it: blue-green deploy"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => setView(key)}
            className="rounded-full border border-border px-3 py-1 font-mono text-[0.8125rem] text-fg-muted transition-colors duration-150 hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-fg"
          >
            {label}
          </button>
        ))}
      </div>
      {view === "request" ? <FlowDemo ids={["tenant-companion", "tenant-notifypay", "tenant-missing"]} /> : <BlueGreenDemo />}
    </div>
  );
}

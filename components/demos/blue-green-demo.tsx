"use client";

import { useMemo, useState } from "react";
import { deployTimeline, type SlotStatus } from "@/content/demos/blue-green";
import { useDemoClock } from "@/lib/use-demo-clock";
import { ControlButton, PlayButton } from "./play-button";

const STATUS_STYLE: Record<SlotStatus, string> = {
  running: "bg-accent text-accent-fg",
  starting: "border border-accent text-accent",
  unhealthy: "border border-dashed border-fg text-fg",
  stopped: "border border-border text-fg-meta",
};

function Slot({ name, status, version, live, port }: { name: string; status: SlotStatus; version: string; live: boolean; port: number }) {
  return (
    <div className={`rounded-xl border p-4 transition-colors duration-300 ${live ? "border-accent bg-surface" : "border-border bg-bg"}`}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm">
          {name} <span className="text-fg-meta">:{port}</span>
        </p>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[0.75rem] transition-colors duration-300 ${STATUS_STYLE[status]}`}>
          {status === "unhealthy" ? "✕ unhealthy" : status}
        </span>
      </div>
      <p className="mt-2 font-serif text-2xl">{version}</p>
      <p className="font-mono text-[0.75rem] text-fg-meta">{live ? "← serving traffic" : "idle"}</p>
    </div>
  );
}

/** The production blue-green deploy, step by step, with an optional failing health check. */
export function BlueGreenDemo() {
  const [fail, setFail] = useState(false);
  const [index, setIndex] = useState(0);
  const steps = useMemo(() => deployTimeline(fail), [fail]);
  const { ref, playing, toggle } = useDemoClock(() => setIndex((i) => (i + 1) % steps.length), 2200);
  const step = steps[Math.min(index, steps.length - 1)];
  const s = step.state;

  return (
    <div ref={ref} className="space-y-4">
      <div className="grid items-center gap-3 sm:grid-cols-[7rem_1fr]">
        <div className="rounded-xl border border-dashed border-accent p-3 text-center">
          <p className="font-mono text-[0.8125rem] text-accent">nginx</p>
          <p className="mt-1 font-mono text-[0.75rem] text-fg-meta">upstream → {s.live === "blue" ? "8080" : "8081"}</p>
          <p className="mt-2 font-mono text-[0.75rem] text-fg-meta">current → {s.live}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slot name="blue" status={s.blue} version={s.version.blue} live={s.live === "blue"} port={8080} />
          <Slot name="green" status={s.green} version={s.version.green} live={s.live === "green"} port={8081} />
        </div>
      </div>

      <ol className="flex flex-wrap gap-1.5" aria-label="Deploy steps">
        {steps.map((st, i) => (
          <li key={st.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "step" : undefined}
              className={`rounded-md border px-2 py-1 font-mono text-[0.75rem] transition-colors duration-150 ${
                i === index ? "border-accent bg-accent text-accent-fg" : i < index ? "border-accent text-fg" : "border-border text-fg-meta"
              }`}
            >
              {i + 1}. {st.id}
            </button>
          </li>
        ))}
      </ol>

      <div aria-live={playing ? "off" : "polite"} className="rounded-lg border border-border bg-bg p-4">
        <p className="font-mono text-[0.75rem] text-fg-meta">
          step {index + 1} of {steps.length}
        </p>
        <p className="mt-1 font-medium">{step.title}</p>
        <p className="mt-1 text-fg-muted">{step.detail}</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-border bg-surface p-2.5 font-mono text-[0.75rem] text-fg">{step.trace}</pre>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PlayButton playing={playing} onToggle={toggle} />
        <ControlButton onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} label="Previous step">←</ControlButton>
        <ControlButton onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))} disabled={index >= steps.length - 1} label="Next step">→</ControlButton>
        <ControlButton
          onClick={() => {
            setFail((f) => !f);
            setIndex(0);
          }}
          pressed={fail}
        >
          {fail ? "✕ Health check will fail" : "Fail the health check"}
        </ControlButton>
      </div>
    </div>
  );
}

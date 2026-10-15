"use client";

import { useState } from "react";
import { evalRun, replayOrder, type Outcome } from "@/content/demos/eval-matrix";
import { useDemoClock } from "@/lib/use-demo-clock";
import { ControlButton, PlayButton } from "./play-button";

const order = replayOrder(evalRun);

const OUTCOME: Record<Outcome, { icon: string; className: string; label: string }> = {
  pass: { icon: "✓", className: "bg-accent text-accent-fg", label: "pass" },
  fail: { icon: "✕", className: "border border-fg text-fg", label: "fail" },
  error: { icon: "!", className: "border border-dashed border-fg-meta text-fg-meta", label: "infra error (not counted)" },
};

export function EvalMatrixDemo() {
  const [filled, setFilled] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const { ref, playing, toggle } = useDemoClock(
    () => setFilled((f) => Math.min(order.length, f + 1)),
    180,
  );
  // Paused before any replay (e.g. reduced motion): show the finished matrix.
  const count = !playing && filled === 0 ? order.length : filled;
  const shown = new Set(order.slice(0, count));
  const cell = picked !== null ? evalRun.results[picked] : null;

  return (
    <div ref={ref} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 font-mono text-[0.75rem]">
          <caption className="sr-only">Tasks by model, pass or fail</caption>
          <thead>
            <tr>
              <th scope="col" className="text-left font-normal text-fg-meta">task</th>
              {evalRun.models.map((m) => (
                <th key={m} scope="col" className="font-normal text-fg-meta">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evalRun.tasks.map((task, t) => (
              <tr key={task}>
                <th scope="row" className="whitespace-nowrap pr-2 text-left font-normal text-fg-muted">{task}</th>
                {evalRun.models.map((model, m) => {
                  const i = t * evalRun.models.length + m;
                  const r = evalRun.results[i];
                  const o = OUTCOME[r.outcome];
                  const visible = shown.has(i);
                  return (
                    <td key={model} className="p-0">
                      <button
                        type="button"
                        onClick={() => setPicked(i)}
                        disabled={!visible}
                        aria-label={`${task} on ${model}: ${visible ? o.label : "not run yet"}`}
                        aria-pressed={picked === i}
                        className={`grid h-8 w-full min-w-10 place-items-center rounded-md transition-[opacity,transform] duration-200 ${
                          visible ? `${o.className} opacity-100` : "border border-border opacity-50"
                        } ${picked === i ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
                      >
                        {visible ? o.icon : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div aria-live="polite" className="min-h-[3.5rem] rounded-lg border border-border bg-bg p-3 font-mono text-[0.8125rem]">
        {cell ? (
          <p>
            <span className="text-accent">{cell.task}</span> × {cell.model} → {OUTCOME[cell.outcome].label}
            <span className="text-fg-meta"> · {cell.steps} agent steps · {cell.toolTokens.toLocaleString("en")} tokens returned by tools</span>
          </p>
        ) : (
          <p className="text-fg-meta">Select a cell to see its trace summary.</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PlayButton playing={playing} onToggle={toggle} />
        <ControlButton
          onClick={() => {
            setFilled(0);
            setPicked(null);
            if (!playing) toggle();
          }}
          label="Replay from the start"
        >
          Replay
        </ControlButton>
        <ul className="ml-auto flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.75rem] text-fg-meta" aria-label="Legend">
          {Object.values(OUTCOME).map((o) => (
            <li key={o.label} className="flex items-center gap-1">
              <span className={`grid size-4 place-items-center rounded-[3px] text-[0.625rem] ${o.className}`} aria-hidden="true">{o.icon}</span>
              {o.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

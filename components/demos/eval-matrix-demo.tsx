"use client";

import { useState } from "react";
import { describeEnd, evalRun, replayOrder, type CellResult } from "@/content/demos/eval-matrix";
import { useDemoClock } from "@/lib/use-demo-clock";
import { ControlButton, PlayButton } from "./play-button";

const order = replayOrder(evalRun);
const nCols = evalRun.columns.length;
const REPEATS = 2;

const SCALE = [
  { passes: 2, className: "bg-accent text-accent-fg", label: "2 of 2 passed" },
  { passes: 1, className: "border border-accent bg-accent/20 text-fg", label: "1 of 2 passed" },
  { passes: 0, className: "border border-fg text-fg", label: "0 of 2 passed" },
];
const styleFor = (passes: number) => SCALE.find((s) => s.passes === passes) ?? SCALE[2];

function summary(cell: CellResult): string {
  const col = evalRun.columns[cell.column];
  return `${cell.task} on ${col.label}: ${cell.passes} of ${REPEATS} passed`;
}

export function EvalMatrixDemo() {
  const [filled, setFilled] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const { ref, playing, toggle } = useDemoClock(
    () => setFilled((f) => Math.min(order.length, f + 1)),
    90,
  );
  // Paused before any replay (e.g. reduced motion): show the finished matrix.
  const count = !playing && filled === 0 ? order.length : filled;
  const shown = new Set(order.slice(0, count));
  const cell = picked !== null ? evalRun.results[picked] : null;

  return (
    <div ref={ref} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 font-mono text-[0.75rem]">
          <caption className="sr-only">Tasks by server and model, passes out of two repeats</caption>
          <thead>
            <tr>
              <th scope="col" className="text-left font-normal text-fg-meta">task</th>
              {evalRun.columns.map((col) => (
                <th key={col.label} scope="col" className="relative font-normal leading-tight text-fg-meta">
                  <span className="sm:hidden" aria-hidden="true">{col.short[0]}<br />{col.short[1]}</span>
                  <span className="sr-only sm:not-sr-only">{col.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evalRun.tasks.map((task, t) => (
              <tr key={task}>
                <th scope="row" className="whitespace-nowrap pr-2 text-left font-normal text-fg-muted">{task}</th>
                {evalRun.columns.map((col, c) => {
                  const i = t * nCols + c;
                  const r = evalRun.results[i];
                  const s = styleFor(r.passes);
                  const visible = shown.has(i);
                  return (
                    <td key={col.label} className="p-0">
                      <button
                        type="button"
                        onClick={() => setPicked(i)}
                        disabled={!visible}
                        aria-label={visible ? summary(r) : `${task} on ${col.label}: not run yet`}
                        aria-pressed={picked === i}
                        className={`grid h-8 w-full min-w-9 place-items-center rounded-md transition-[opacity,transform] duration-200 ${
                          visible ? `${s.className} opacity-100` : "border border-border opacity-50"
                        } ${picked === i ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
                      >
                        {visible ? `${r.passes}/${REPEATS}` : ""}
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
          <div className="space-y-1.5">
            <p>
              <span className="text-accent">{cell.task}</span> · {evalRun.columns[cell.column].label} → {cell.passes}/{REPEATS} passed
            </p>
            <ul className="space-y-1 text-fg-meta">
              {cell.repeats.map((r, k) => (
                <li key={k}>
                  <span className="text-fg">repeat {k + 1}: {r.outcome}</span> · {describeEnd(r)} · {r.steps} {r.steps === 1 ? "step" : "steps"} ·{" "}
                  {r.contextTokens.toLocaleString("en")} context tokens · ${r.costUsd.toFixed(3)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-fg-meta">Select a cell to see what happened in each repeat.</p>
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
          {SCALE.map((s) => (
            <li key={s.passes} className="flex items-center gap-1">
              <span className={`grid h-4 min-w-6 place-items-center rounded-[3px] px-0.5 text-[0.625rem] ${s.className}`} aria-hidden="true">{s.passes}/{REPEATS}</span>
              {s.label}
            </li>
          ))}
        </ul>
      </div>
      <p className="font-mono text-[0.75rem] text-fg-meta sm:hidden">NC = NeatCode, FS = Filesystem server. Columns: GPT-6.1 Sol, Gemini 3.8 Flash, Qwen 3.8 Flash.</p>
    </div>
  );
}

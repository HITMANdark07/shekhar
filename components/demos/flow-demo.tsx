"use client";

import { useState } from "react";
import { flows, type Flow } from "@/content/demos/flows";
import { useDemoClock } from "@/lib/use-demo-clock";
import { ControlButton, PlayButton } from "./play-button";

function FlowView({ flow, index, playing }: { flow: Flow; index: number; playing: boolean }) {
  const step = flow.steps[index];
  const activeAt = flow.nodes.findIndex((n) => n.id === step.at);
  return (
    <>
      <ol className="grid gap-2 sm:grid-flow-col sm:auto-cols-fr" aria-label={`${flow.label}: stages`}>
        {flow.nodes.map((n, i) => {
          const state = i === activeAt ? "active" : i < activeAt ? "done" : "todo";
          return (
            <li key={n.id} className="relative">
              <div
                className={`h-full rounded-lg border px-3 py-2 transition-colors duration-200 ${
                  state === "active"
                    ? "border-accent bg-accent text-accent-fg"
                    : state === "done"
                      ? "border-accent text-fg"
                      : "border-border text-fg-muted"
                }`}
                aria-current={state === "active" ? "step" : undefined}
              >
                <p className="text-sm font-medium">{n.label}</p>
                <p className={`font-mono text-[0.75rem] ${state === "active" ? "text-accent-fg" : "text-fg-meta"}`}>{n.sub}</p>
              </div>
              {i < flow.nodes.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-2 left-6 h-2 w-px sm:-right-2 sm:bottom-auto sm:left-auto sm:top-1/2 sm:h-px sm:w-2 ${i < activeAt ? "bg-accent" : "bg-border"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" className="relative hidden h-3 sm:block">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-accent opacity-40 transition-[width] duration-500 ease-out"
          style={{ width: `${((activeAt + 0.5) / flow.nodes.length) * 100}%`, height: "1px", top: "50%" }}
        />
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_20%,transparent)] transition-[left] duration-500 ease-out"
          style={{ left: `${((activeAt + 0.5) / flow.nodes.length) * 100}%` }}
        />
      </div>
      <div aria-live={playing ? "off" : "polite"} className="rounded-lg border border-border bg-bg p-4">
        <p className="font-mono text-[0.75rem] text-fg-meta">
          step {index + 1} of {flow.steps.length}
        </p>
        <p className="mt-1 font-medium">{step.title}</p>
        <p className="mt-1 text-fg-muted">{step.detail}</p>
        {step.trace && (
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-border bg-surface p-2.5 font-mono text-[0.75rem] text-fg">{step.trace}</pre>
        )}
      </div>
    </>
  );
}

/** Steps through one or more flows; several flows render as tabs. */
export function FlowDemo({ ids }: { ids: Flow["id"][] }) {
  const selected = flows.filter((f) => ids.includes(f.id));
  const [tab, setTab] = useState(0);
  const [index, setIndex] = useState(0);
  const flow = selected[tab];
  const { ref, playing, toggle } = useDemoClock(() => setIndex((i) => (i + 1) % flow.steps.length), 2200);

  function pick(t: number) {
    setTab(t);
    setIndex(0);
  }

  return (
    <div ref={ref} className="space-y-4">
      {selected.length > 1 && (
        <div role="group" aria-label="Views" className="flex gap-2">
          {selected.map((f, t) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={t === tab}
              onClick={() => pick(t)}
              className="rounded-full border border-border px-3 py-1 font-mono text-[0.8125rem] text-fg-muted transition-colors duration-150 hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-fg"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      <FlowView flow={flow} index={index} playing={playing} />
      <div className="flex flex-wrap items-center gap-2">
        <PlayButton playing={playing} onToggle={toggle} />
        <ControlButton onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} label="Previous step">←</ControlButton>
        <ControlButton onClick={() => setIndex((i) => Math.min(flow.steps.length - 1, i + 1))} disabled={index === flow.steps.length - 1} label="Next step">→</ControlButton>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createSim, killPod, metrics, revivePod, run, step, type Job, type Workflow } from "@/lib/sim/gpu-queue";
import { useDemoClock } from "@/lib/use-demo-clock";
import { ControlButton, PlayButton } from "./play-button";

const WORKFLOW_STYLE: Record<Workflow, { letter: string; className: string; label: string }> = {
  "speech-to-image": { letter: "S", className: "bg-accent text-accent-fg", label: "speech → image" },
  "image-to-image": { letter: "I", className: "bg-fg text-bg", label: "image → image" },
  upscale: { letter: "U", className: "border border-fg-meta text-fg-muted", label: "upscale" },
};

const RATES = [
  { label: "Quiet", value: 0.2 },
  { label: "Busy", value: 0.38 },
  { label: "Spike", value: 0.55 },
];

const MAX_SHOWN = 8;

function JobChip({ job }: { job: Job }) {
  const s = WORKFLOW_STYLE[job.workflow];
  return (
    <span
      className={`grid size-5 shrink-0 place-items-center rounded-[4px] font-mono text-[0.625rem] ${s.className}`}
      title={`job ${job.id}: ${s.label}`}
    >
      {s.letter}
    </span>
  );
}

function initial(pods: number, rate: number) {
  return run(createSim({ pods, arrivalRate: rate, seed: 2026 }), 40);
}

export function GpuQueueDemo() {
  const [pods, setPods] = useState(3);
  const [rate, setRate] = useState(RATES[1].value);
  const [sim, setSim] = useState(() => initial(3, RATES[1].value));
  const { ref, playing, toggle } = useDemoClock(() => setSim((s) => step(s)), 260);
  const m = metrics(sim);

  function reset(nextPods = pods, nextRate = rate) {
    setPods(nextPods);
    setRate(nextRate);
    setSim(initial(nextPods, nextRate));
  }

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <PlayButton playing={playing} onToggle={toggle} />
        <ControlButton onClick={() => setSim((s) => step(s))} label="Advance one tick">
          Step
        </ControlButton>
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
        <span className="flex items-center gap-2">
          <span className="font-mono text-[0.8125rem] text-fg-meta">GPU pods</span>
          <ControlButton onClick={() => reset(Math.max(1, pods - 1))} disabled={pods <= 1} label="Remove a pod">
            −
          </ControlButton>
          <span className="w-4 text-center font-mono text-sm" aria-live="polite">{pods}</span>
          <ControlButton onClick={() => reset(Math.min(4, pods + 1))} disabled={pods >= 4} label="Add a pod">
            +
          </ControlButton>
        </span>
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
        {RATES.map((r) => (
          <ControlButton key={r.label} onClick={() => reset(pods, r.value)} pressed={rate === r.value}>
            {r.label}
          </ControlButton>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
        <div className="flex items-center justify-center rounded-lg border border-dashed border-accent p-3 text-center">
          <div>
            <p className="font-mono text-[0.8125rem] text-accent">router</p>
            <p className="mt-1 text-[0.8125rem] text-fg-meta">least-loaded live pod</p>
            {sim.backlog.length > 0 && (
              <p className="mt-2 font-mono text-[0.8125rem] text-fg">backlog {sim.backlog.length}</p>
            )}
          </div>
        </div>
        <ol className="space-y-2" aria-label="GPU pods">
          {sim.pods.map((pod) => {
            const done = pod.current ? (sim.tick - (pod.current.startedAt ?? sim.tick)) / pod.current.duration : 0;
            return (
              <li
                key={pod.id}
                className={`flex items-center gap-3 rounded-lg border p-2 ${pod.alive ? "border-border" : "border-dashed border-border opacity-60"}`}
              >
                <div role="group" className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-hidden" aria-label={`queue: ${pod.queue.length} jobs`}>
                  {pod.queue.length > MAX_SHOWN && (
                    <span className="font-mono text-[0.75rem] text-fg-meta">+{pod.queue.length - MAX_SHOWN}</span>
                  )}
                  {pod.queue.slice(0, MAX_SHOWN).reverse().map((j) => (
                    <JobChip key={j.id} job={j} />
                  ))}
                </div>
                <div className="w-28 shrink-0 rounded-md border border-border bg-bg px-2 py-1.5">
                  <div className="flex items-center justify-between font-mono text-[0.75rem]">
                    <span>pod {pod.id + 1}</span>
                    {pod.current ? <JobChip job={pod.current} /> : <span className="text-fg-meta">{pod.alive ? "idle" : "down"}</span>}
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${Math.min(done, 1) * 100}%` }} />
                  </div>
                </div>
                <ControlButton
                  onClick={() => setSim((s) => (pod.alive ? killPod(s, pod.id) : revivePod(s, pod.id)))}
                  label={pod.alive ? `Kill pod ${pod.id + 1}` : `Revive pod ${pod.id + 1}`}
                >
                  {pod.alive ? "Kill" : "Revive"}
                </ControlButton>
              </li>
            );
          })}
        </ol>
      </div>

      <dl className="grid grid-cols-3 gap-2 font-mono sm:grid-cols-5 sm:gap-3">
        {[
          ["completed", m.completed],
          ["queued", m.queued],
          ["running", m.running],
          ["avg wait (ticks)", m.avgWait],
          ["rerouted", sim.rerouted],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse rounded-md border border-border px-3 py-2">
            <dt className="text-[0.75rem] text-fg-meta">{label}</dt>
            <dd className="text-lg">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.75rem] text-fg-meta" aria-label="Workflow legend">
        {Object.entries(WORKFLOW_STYLE).map(([key, s]) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className={`grid size-4 place-items-center rounded-[3px] text-[0.5625rem] ${s.className}`} aria-hidden="true">
              {s.letter}
            </span>
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

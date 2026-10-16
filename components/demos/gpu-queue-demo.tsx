"use client";

import { useState } from "react";
import { createSim, killPod, metrics, revivePod, run, step, type Job } from "@/lib/sim/gpu-queue";
import { useDemoClock } from "@/lib/use-demo-clock";
import { FlowDemo } from "./flow-demo";
import { GpuWiringDemo } from "./gpu-wiring-demo";
import { ControlButton, PlayButton } from "./play-button";

const LOADS = [
  { label: "Quiet", value: 0.12 },
  { label: "Busy", value: 0.22 },
  { label: "Spike", value: 0.4 },
];

const MAX_SHOWN = 7;

function JobChip({ job }: { job: Job }) {
  const portrait = job.kind === "t2i";
  return (
    <span
      className={`grid size-5 shrink-0 place-items-center rounded-[4px] font-mono text-[0.625rem] ${
        portrait ? "bg-fg text-bg" : "bg-accent text-accent-fg"
      }`}
      title={portrait ? `portrait job ${job.id}` : `scene ${job.batch}, candidate ${(job.candidate ?? 0) + 1}`}
    >
      {portrait ? "P" : (job.candidate ?? 0) + 1}
    </span>
  );
}

function initial(i2iPods: number, rate: number) {
  return run(createSim({ i2iPods, arrivalRate: rate, t2iShare: 0.3, seed: 2026 }), 40);
}

function RenderQueueSim() {
  const [pods, setPods] = useState(3);
  const [rate, setRate] = useState(LOADS[1].value);
  const [sim, setSim] = useState(() => initial(3, LOADS[1].value));
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
          <span className="font-mono text-[0.8125rem] text-fg-meta">i2i pods</span>
          <ControlButton onClick={() => reset(Math.max(1, pods - 1))} disabled={pods <= 1} label="Remove an image-to-image pod">
            −
          </ControlButton>
          <span className="w-4 text-center font-mono text-sm" aria-live="polite">{pods}</span>
          <ControlButton onClick={() => reset(Math.min(4, pods + 1))} disabled={pods >= 4} label="Add an image-to-image pod">
            +
          </ControlButton>
        </span>
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
        {LOADS.map((l) => (
          <ControlButton key={l.label} onClick={() => reset(pods, l.value)} pressed={rate === l.value}>
            {l.label}
          </ControlButton>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <div className="flex items-center justify-center rounded-lg border border-dashed border-accent p-3 text-center">
          <div>
            <p className="font-mono text-[0.8125rem] text-accent">producer + router</p>
            <p className="mt-1 text-[0.8125rem] text-fg-meta">portraits → t2i · scenes fan out, least-busy first</p>
          </div>
        </div>
        <ol className="space-y-2" aria-label="GPU pods">
          {sim.pods.map((pod) => {
            const done = pod.current ? (sim.tick - (pod.current.startedAt ?? sim.tick)) / pod.current.duration : 0;
            const name = pod.kind === "t2i" ? "t2i" : `i2i ${pod.id}`;
            return (
              <li
                key={pod.id}
                className={`flex items-center gap-3 rounded-lg border p-2 ${pod.alive ? "border-border" : "border-dashed border-border opacity-60"}`}
              >
                <div
                  role="group"
                  className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-hidden"
                  aria-label={`${name} queue: ${pod.queue.length} jobs`}
                >
                  {pod.queue.length > MAX_SHOWN && (
                    <span className="font-mono text-[0.75rem] text-fg-meta">+{pod.queue.length - MAX_SHOWN}</span>
                  )}
                  {pod.queue.slice(0, MAX_SHOWN).reverse().map((j) => (
                    <JobChip key={j.id} job={j} />
                  ))}
                </div>
                <div className="w-28 shrink-0 rounded-md border border-border bg-bg px-2 py-1.5">
                  <div className="flex items-center justify-between font-mono text-[0.75rem]">
                    <span>{name}</span>
                    {pod.current ? <JobChip job={pod.current} /> : <span className="text-fg-meta">{pod.alive ? "idle" : "down"}</span>}
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${Math.min(done, 1) * 100}%` }} />
                  </div>
                </div>
                <ControlButton
                  onClick={() => setSim((s) => (pod.alive ? killPod(s, pod.id) : revivePod(s, pod.id)))}
                  label={pod.alive ? `Kill the ${name} worker` : `Revive the ${name} worker`}
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
          ["jobs done", m.completed],
          ["scenes done", m.batchesDone],
          ["queued", m.queued],
          ["avg scene (ticks)", m.avgBatchTime],
          ["requeued", sim.requeued],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse rounded-md border border-border px-3 py-2">
            <dt className="text-[0.75rem] text-fg-meta">{label}</dt>
            <dd className="text-lg">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.75rem] text-fg-meta" aria-label="Legend">
        <li className="flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-[3px] bg-fg text-[0.5625rem] text-bg" aria-hidden="true">P</span>
          character portrait (t2i)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-[3px] bg-accent text-[0.5625rem] text-accent-fg" aria-hidden="true">1</span>
          scene candidate n (i2i)
        </li>
        <li>killing a worker requeues its job (acks_late)</li>
      </ul>
    </div>
  );
}

/** Three views of the speech-to-image system; the GPU wiring leads. */
export function GpuQueueDemo() {
  const [view, setView] = useState<"wiring" | "story" | "queue">("wiring");
  return (
    <div className="space-y-4">
      <div role="group" aria-label="View" className="flex flex-wrap gap-2">
        {(
          [
            ["wiring", "How each GPU is wired"],
            ["story", "Life of a story"],
            ["queue", "Route the render queue"],
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
      {view === "wiring" ? <GpuWiringDemo /> : view === "story" ? <FlowDemo ids={["story-pipeline"]} /> : <RenderQueueSim />}
    </div>
  );
}

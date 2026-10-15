"use client";

import { useState } from "react";
import { cumulativeRewards, fleetEpisode, type EpisodeStep } from "@/content/demos/fleet-episode";
import { useDemoClock } from "@/lib/use-demo-clock";
import { ControlButton, PlayButton } from "./play-button";

const steps = fleetEpisode.steps;
const totals = cumulativeRewards(steps);

function Target({ on, children, className = "" }: { on: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 transition-colors duration-200 ${on ? "bg-accent text-accent-fg ring-2 ring-accent ring-offset-2 ring-offset-surface" : "border border-border"} ${className}`}
    >
      {children}
    </span>
  );
}

function MockPage({ step }: { step: EpisodeStep }) {
  const t = step.target;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg font-mono text-[0.75rem]">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </span>
        <span className="truncate text-fg-meta">{step.url}</span>
      </div>
      <div className="space-y-2.5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-fg-muted">github.local</span>
          <Target on={t === "search"}>search…</Target>
        </div>
        {t === "result" && (
          <ul className="space-y-1">
            <li><Target on>acme/widgets</Target></li>
            <li className="text-fg-meta">acme/widgets-legacy</li>
            <li className="text-fg-meta">widgetsco/acme</li>
          </ul>
        )}
        {(t === "star" || t === "issues-tab") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>acme/widgets</span>
              <Target on={t === "star"}>{step.state.starred ? "★ Starred" : "☆ Star"} {step.state.stars}</Target>
            </div>
            <div className="flex gap-2">
              <span className="text-fg-meta">Code</span>
              <Target on={t === "issues-tab"}>Issues</Target>
              <span className="text-fg-meta">Pull requests</span>
            </div>
          </div>
        )}
        {t === "issue" && (
          <ul className="space-y-1">
            <li><Target on>#87 Flaky test in parser</Target></li>
            <li className="text-fg-meta">#86 Docs: typo in README</li>
            <li className="text-fg-meta">#85 Support Node 22</li>
          </ul>
        )}
        {t === "submit" && (
          <div className="space-y-1.5">
            <p>#87 Flaky test in parser <span className="text-fg-meta">· open</span></p>
            <Target on>submit()</Target>
          </div>
        )}
        {t === "search" && <p className="text-fg-meta">Recent activity · Your repositories</p>}
      </div>
    </div>
  );
}

function RewardCurve({ index }: { index: number }) {
  const w = 240;
  const h = 70;
  const x = (i: number) => 10 + (i / (steps.length - 1)) * (w - 20);
  const y = (v: number) => h - 10 - v * (h - 20);
  const points = totals.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`Cumulative reward ${totals[index]} of 1.0 after step ${index + 1}`}>
      <line x1={10} y1={y(1)} x2={w - 10} y2={y(1)} stroke="var(--border)" strokeDasharray="3 3" />
      <polyline points={points} fill="none" stroke="var(--fg-meta)" strokeWidth={1.2} />
      <polyline points={totals.slice(0, index + 1).map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth={2} />
      <circle cx={x(index)} cy={y(totals[index])} r={4} fill="var(--accent)" />
      <text x={w - 10} y={y(1) - 4} textAnchor="end" fontSize={9} className="fill-fg-meta font-mono" aria-hidden="true">1.0</text>
    </svg>
  );
}

export function FleetEpisodeDemo() {
  const [index, setIndex] = useState(0);
  const { ref, playing, toggle } = useDemoClock(() => setIndex((i) => (i + 1) % steps.length), 1600);
  const step = steps[index];

  return (
    <div ref={ref} className="space-y-4">
      <p className="text-sm text-fg-muted">
        <span className="font-mono text-[0.8125rem] text-accent">task</span> {fleetEpisode.task}
      </p>
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <MockPage step={step} />
        <div className="space-y-3 font-mono text-[0.8125rem]">
          <dl className="space-y-2">
            <div>
              <dt className="text-fg-meta">observation</dt>
              <dd className="text-fg">{step.observation}</dd>
            </div>
            <div>
              <dt className="text-fg-meta">action</dt>
              <dd className="text-accent">{step.action}</dd>
            </div>
            <div>
              <dt className="text-fg-meta">reward</dt>
              <dd>
                +{step.reward.toFixed(1)} <span className="text-fg-meta">· total {totals[index].toFixed(1)}</span>
              </dd>
            </div>
          </dl>
          <RewardCurve index={index} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <PlayButton playing={playing} onToggle={toggle} />
        <ControlButton onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} label="Previous step">←</ControlButton>
        <ControlButton onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))} disabled={index === steps.length - 1} label="Next step">→</ControlButton>
        <label className="flex flex-1 items-center gap-3 font-mono text-[0.8125rem] text-fg-meta">
          <span className="whitespace-nowrap">step {index + 1}/{steps.length}</span>
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
            aria-label="Scrub through the episode"
          />
        </label>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { timeline, wiring, type Lane, type WireEdge, type WireNode } from "@/content/demos/gpu-wiring";
import { usePrefersReducedMotion } from "@/lib/use-demo-clock";
import { ControlButton, PlayButton } from "./play-button";

const nodeById = new Map(wiring.nodes.map((n) => [n.id, n as WireNode]));
const TRAVEL_MS = 900;
const PHASE_MS = 2300;
const RENDER_MS = 3600;

function edgePath(e: WireEdge): string {
  const a = nodeById.get(e.from)!;
  const b = nodeById.get(e.to)!;
  const o = e.offset ?? 0;
  if (e.kind === "db") {
    return `M${a.cx} ${a.cy + a.h / 2} L${b.cx} ${b.cy - b.h / 2}`;
  }
  if (e.kind === "storage") {
    const x1 = a.cx + a.w / 2;
    const y1 = a.cy + 14;
    const x2 = b.cx;
    const y2 = b.cy - b.h / 2;
    return `M${x1} ${y1} C${x1 + 44} ${y1}, ${x2} ${y2 - 50}, ${x2} ${y2}`;
  }
  if (e.kind === "progress" && e.to === "pubsub") {
    const x1 = a.cx - a.w / 2;
    const y1 = a.cy + 14;
    const x2 = b.cx + b.w / 2;
    const y2 = b.cy;
    return `M${x1} ${y1} C${x1 - 22} ${y1}, ${x2 + 22} ${y2}, ${x2} ${y2}`;
  }
  if (e.from === "pubsub") {
    const x1 = a.cx - a.w / 2;
    const y1 = a.cy;
    const x2 = b.cx + 28;
    const y2 = b.cy + b.h / 2;
    return `M${x1} ${y1} C${x1 - 50} ${y1}, ${x2} ${y2 + 70}, ${x2} ${y2}`;
  }
  const forward = b.cx > a.cx;
  const x1 = forward ? a.cx + a.w / 2 : a.cx - a.w / 2;
  const x2 = forward ? b.cx - b.w / 2 : b.cx + b.w / 2;
  const y1 = a.cy + o;
  const y2 = b.cy + o;
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

const EDGE_STYLE: Record<WireEdge["kind"], { width: number; dash?: string }> = {
  http: { width: 1.3 },
  sse: { width: 1.1, dash: "4 4" },
  db: { width: 1.1 },
  enqueue: { width: 1.2 },
  queue: { width: 1.6 },
  comfy: { width: 3 },
  storage: { width: 1, dash: "3 4" },
  progress: { width: 1, dash: "3 4" },
};

export function GpuWiringDemo() {
  const reduce = usePrefersReducedMotion();
  const [kind, setKind] = useState<"i2i" | "t2i">("i2i");
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const playing = choice ?? !reduce;
  const phases = useMemo(() => timeline(kind), [kind]);
  // Reduced motion and no choice yet: rest on the render step, where the whole wiring is busy.
  const effectiveIndex = !playing && choice === null && index === 0 ? phases.findIndex((p) => p.id === "render") : index;
  const phase = phases[effectiveIndex];
  const lanes: Lane[] = kind === "i2i" ? ["p1", "p2", "p3"] : ["t2i"];

  const pathRefs = useRef(new Map<string, SVGPathElement>());
  const packetRefs = useRef<(SVGCircleElement | null)[]>([]);
  const barRefs = useRef(new Map<Lane, SVGRectElement>());
  const svgRef = useRef<SVGSVGElement>(null);

  const expanded = useMemo(
    () => phase.packets.flatMap((p) => (p.stream ? [0, 0.34, 0.67].map((off) => ({ ...p, off })) : [{ ...p, off: 0 }])),
    [phase],
  );

  const activeEdges = new Set(phase.packets.map((p) => p.edge));
  const activeNodes = new Set(
    phase.packets.flatMap((p) => {
      const e = wiring.edges.find((x) => x.id === p.edge)!;
      return [e.from, e.to];
    }),
  );
  const renderAt = phases.findIndex((p) => p.id === "render");
  const jobsAt = phases.findIndex((p) => p.id === "jobs");
  const doneAt = phases.findIndex((p) => p.id === "done");
  const inflight = effectiveIndex >= jobsAt && effectiveIndex < doneAt ? 1 : 0;

  // Animate packets and GPU progress bars for the current step.
  useEffect(() => {
    const start = performance.now();
    const duration = phase.id === "render" ? RENDER_MS : PHASE_MS;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    if (svgRef.current) io.observe(svgRef.current);

    const place = (elapsed: number) => {
      expanded.forEach((p, i) => {
        const el = packetRefs.current[i];
        const path = pathRefs.current.get(p.edge);
        if (!el || !path) return;
        const base = !playing ? 0.55 : p.stream ? (elapsed / TRAVEL_MS + p.off) % 1 : Math.min(elapsed / TRAVEL_MS, 1);
        const t = p.reverse ? 1 - base : base;
        const pt = path.getPointAtLength(t * path.getTotalLength());
        el.setAttribute("cx", String(pt.x));
        el.setAttribute("cy", String(pt.y));
      });
      const pct = effectiveIndex > renderAt ? 1 : effectiveIndex < renderAt ? 0 : playing ? Math.min(elapsed / (RENDER_MS - 400), 1) : 0.6;
      for (const lane of lanes) {
        const bar = barRefs.current.get(lane);
        if (bar) bar.setAttribute("width", String(Math.round(pct * 130)));
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.visibilityState !== "visible") return;
      const elapsed = now - start;
      place(elapsed);
      if (playing && elapsed > duration) {
        cancelAnimationFrame(raf);
        setIndex((i) => (i + 1) % phases.length);
      }
    };
    place(0);
    if (playing) raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // lanes/phases derive from kind; effectiveIndex/phase from index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveIndex, kind, playing, expanded]);

  function pick(k: "i2i" | "t2i") {
    setKind(k);
    setIndex(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["i2i", "Scene request · i2i × 3 GPUs"],
            ["t2i", "Portrait request · t2i GPU"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => pick(k)}
            className="rounded-full border border-border px-3 py-1 font-mono text-[0.8125rem] text-fg-muted transition-colors duration-150 hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-fg"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${wiring.width} ${wiring.height}`}
          className="h-auto w-full min-w-[700px]"
          role="img"
          aria-label="Wiring of the render tier: the FastAPI producer puts tasks on four Redis queues; each queue feeds one Celery worker; each worker is connected to one ComfyUI GPU; results go to MinIO and progress flows back through Redis pub/sub to the client."
        >
          <defs>
            <pattern id="wire-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="var(--border)" />
            </pattern>
          </defs>
          <rect width={wiring.width} height={wiring.height} rx="12" fill="url(#wire-grid)" />

          {/* Redis frame */}
          <rect {...wiring.redisFrame} rx="12" fill="var(--surface)" stroke="var(--fg-meta)" strokeDasharray="4 4" strokeWidth={1} />
          <text x={wiring.redisFrame.x + 10} y={wiring.redisFrame.y + 16} fontSize={11} className="fill-fg-meta font-mono">
            Redis · broker
          </text>
          <text x={503} y={22} textAnchor="middle" fontSize={11} className="fill-fg-meta font-mono">
            Celery workers
          </text>
          <text x={726} y={22} textAnchor="middle" fontSize={11} className="fill-fg-meta font-mono">
            GPUs (ComfyUI)
          </text>

          {/* Edges */}
          {wiring.edges.map((e) => {
            const style = EDGE_STYLE[e.kind];
            const on = activeEdges.has(e.id);
            const laneOn = e.kind === "comfy" && lanes.some((l) => e.from === `worker-${l}`);
            return (
              <path
                key={e.id}
                ref={(el) => {
                  if (el) pathRefs.current.set(e.id, el);
                }}
                d={edgePath(e)}
                fill="none"
                stroke={on || (e.kind === "comfy" && laneOn) ? "var(--accent)" : "var(--fg-meta)"}
                strokeOpacity={on ? 1 : e.kind === "comfy" ? 0.75 : 0.4}
                strokeWidth={on ? style.width + 0.6 : style.width}
                strokeDasharray={style.dash}
                strokeLinecap="round"
              />
            );
          })}

          {/* 1:1 cable labels between each worker and its GPU */}
          {(["t2i", "p1", "p2", "p3"] as Lane[]).map((lane) => {
            const w = nodeById.get(`worker-${lane}`)!;
            return (
              <text key={lane} x={(w.cx + w.w / 2 + 647) / 2} y={w.cy - 7} textAnchor="middle" fontSize={9.5} className="fill-fg-meta font-mono">
                HTTP + WS
              </text>
            );
          })}

          {/* Nodes */}
          {wiring.nodes.map((n) => {
            const on = activeNodes.has(n.id);
            const used = !n.lane || lanes.includes(n.lane);
            const x = n.cx - n.w / 2;
            const y = n.cy - n.h / 2;
            return (
              <g key={n.id} opacity={used ? 1 : 0.4}>
                <rect
                  x={x}
                  y={y}
                  width={n.w}
                  height={n.h}
                  rx={n.kind === "queue" ? 8 : 10}
                  fill={n.kind === "gpu" ? "var(--bg)" : "var(--surface)"}
                  stroke={on ? "var(--accent)" : n.kind === "gpu" || n.kind === "worker" ? "var(--fg)" : "var(--fg-meta)"}
                  strokeWidth={on ? 2 : n.kind === "gpu" ? 1.6 : 1.1}
                />
                <text x={n.cx} y={n.kind === "gpu" ? y + 20 : n.cy - 2} textAnchor="middle" fontSize={12} className="fill-fg font-mono">
                  {n.label}
                </text>
                <text x={n.cx} y={n.kind === "gpu" ? y + 35 : n.cy + 13} textAnchor="middle" fontSize={9.5} className="fill-fg-meta font-mono">
                  {n.kind === "queue" && n.lane ? (lanes.includes(n.lane) && inflight ? "1 in flight" : "0 in flight") : n.sub}
                </text>
                {n.kind === "gpu" && n.lane && (
                  <>
                    <rect x={x + 14} y={y + 44} width={130} height={6} rx={3} fill="var(--border)" />
                    <rect
                      ref={(el) => {
                        if (el && n.lane) barRefs.current.set(n.lane, el);
                      }}
                      x={x + 14}
                      y={y + 44}
                      width={0}
                      height={6}
                      rx={3}
                      fill={used ? "var(--accent)" : "var(--fg-meta)"}
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Results arriving at the client */}
          {phase.id === "done" &&
            lanes.map((lane, i) => (
              <g key={lane}>
                <rect x={22 + i * 26} y={250} width={22} height={22} rx={4} fill="var(--accent)" />
                <text x={33 + i * 26} y={265} textAnchor="middle" fontSize={10} className="fill-accent-fg font-mono">
                  {kind === "i2i" ? i + 1 : "P"}
                </text>
              </g>
            ))}

          {/* Packets */}
          {expanded.map((p, i) => (
            <circle
              key={`${phase.id}-${p.edge}-${p.off}-${i}`}
              ref={(el) => {
                packetRefs.current[i] = el;
              }}
              r={p.tone === "result" ? 5.5 : p.tone === "progress" ? 3.2 : 4.5}
              fill={p.tone === "result" ? "var(--fg)" : p.tone === "progress" ? "var(--surface)" : "var(--accent)"}
              stroke="var(--accent)"
              strokeWidth={p.tone === "progress" ? 1.6 : 0}
            />
          ))}
        </svg>
      </div>

      <div aria-live={playing ? "off" : "polite"} className="rounded-lg border border-border bg-bg p-4">
        <p className="font-mono text-[0.75rem] text-fg-meta">
          step {effectiveIndex + 1} of {phases.length}
        </p>
        <p className="mt-1 font-medium">{phase.title}</p>
        <p className="mt-1 text-fg-muted">{phase.detail}</p>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-border bg-surface p-2.5 font-mono text-[0.75rem] text-fg">
          {phase.trace}
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PlayButton playing={playing} onToggle={() => setChoice(!playing)} />
        <ControlButton onClick={() => { setChoice(false); setIndex((i) => Math.max(0, (i === 0 && choice === null && !playing ? renderAt : i) - 1)); }} disabled={effectiveIndex === 0} label="Previous step">
          ←
        </ControlButton>
        <ControlButton onClick={() => { setChoice(false); setIndex((i) => Math.min(phases.length - 1, (i === 0 && choice === null && !playing ? renderAt : i) + 1)); }} disabled={effectiveIndex === phases.length - 1} label="Next step">
          →
        </ControlButton>
        <ul className="ml-auto flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.75rem] text-fg-meta" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="var(--accent)" /></svg>request
          </li>
          <li className="flex items-center gap-1.5">
            <svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="3.5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5" /></svg>progress
          </li>
          <li className="flex items-center gap-1.5">
            <svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="var(--fg)" /></svg>image
          </li>
        </ul>
      </div>
    </div>
  );
}

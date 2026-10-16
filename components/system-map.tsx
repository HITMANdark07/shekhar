"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects } from "@/content/projects";
import { systemMap, type MapNode } from "@/content/system-map";
import { usePrefersReducedMotion } from "@/lib/use-demo-clock";

const byId = new Map(systemMap.nodes.map((n) => [n.id, n as MapNode]));
const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
const NODE_H = 26;

function nodeWidth(n: MapNode) {
  return n.label.length * 7 + 22;
}

function edgeGeometry(fromId: string, toId: string) {
  const a = byId.get(fromId)!;
  const b = byId.get(toId)!;
  const mx = (a.x + b.x) / 2;
  const d = a.y === b.y ? `M${a.x} ${a.y} L${b.x} ${b.y}` : `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
  // Bezier midpoint (t = 0.5) for the static frame.
  const mid = a.y === b.y ? { x: mx, y: a.y } : { x: (a.x + 3 * mx + 3 * mx + b.x) / 8, y: (a.y + 3 * a.y + 3 * b.y + b.y) / 8 };
  return { d, mid };
}

const edges = systemMap.edges.map((e, i) => ({ ...e, i, ...edgeGeometry(e.from, e.to) }));

export function SystemMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduce = usePrefersReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const animating = !reduce;

  // Start every packet with a stagger once motion is allowed; pause while off screen.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !animating) return;
    const anims = svg.querySelectorAll<SVGAnimationElement>("animateMotion");
    anims.forEach((a, i) => a.beginElementAt((i * 0.41) % 2.6));
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !svg.dataset.userPaused) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
    io.observe(svg);
    return () => io.disconnect();
  }, [animating]);

  function togglePause() {
    const svg = svgRef.current;
    if (!svg) return;
    if (paused) {
      delete svg.dataset.userPaused;
      svg.unpauseAnimations();
    } else {
      svg.dataset.userPaused = "1";
      svg.pauseAnimations();
    }
    setPaused(!paused);
  }

  const activeNode = active ? byId.get(active) : null;
  const activeProject = activeNode?.project ? projectBySlug.get(activeNode.project) : null;
  const litEdges = new Set(
    activeNode ? edges.filter((e) => e.from === activeNode.id || e.to === activeNode.id).map((e) => e.i) : [],
  );

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${systemMap.width} ${systemMap.height}`}
        className="h-auto w-full"
        role="group"
        aria-label="Map of the systems I build. Each labelled system links to the project where I built it."
      >
        <defs>
          <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="var(--border)" />
          </pattern>
        </defs>
        <rect width={systemMap.width} height={systemMap.height} fill="url(#map-grid)" rx="14" />

        {edges.map((e) => (
          <path
            key={`${e.from}-${e.to}`}
            id={`map-edge-${e.i}`}
            d={e.d}
            fill="none"
            stroke={litEdges.has(e.i) ? "var(--accent)" : "var(--fg-meta)"}
            strokeOpacity={activeNode && !litEdges.has(e.i) ? 0.25 : 0.7}
            strokeWidth={litEdges.has(e.i) ? 1.8 : 1}
            strokeDasharray={litEdges.has(e.i) ? undefined : "3 4"}
          />
        ))}

        {animating
          ? edges.map((e) => (
              <circle key={`p-${e.i}`} r={3.6} fill="var(--accent)">
                <animateMotion dur={`${2.4 + (e.i % 3) * 0.5}s`} begin="indefinite" repeatCount="indefinite" path={e.d} />
              </circle>
            ))
          : edges.map((e) => <circle key={`s-${e.i}`} cx={e.mid.x} cy={e.mid.y} r={3.6} fill="var(--accent)" />)}

        {systemMap.nodes.map((n) => {
          const w = nodeWidth(n);
          const label = (
            <g
              className="map-node"
              data-active={active === n.id}
              onPointerEnter={() => setActive(n.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
            >
              <rect x={n.x - w / 2} y={n.y - NODE_H / 2} width={w} height={NODE_H} rx={NODE_H / 2} fill="var(--surface)" stroke={n.project ? "var(--accent)" : "var(--fg-meta)"} strokeWidth={1.3} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={12} className="pointer-events-none fill-fg font-mono">
                {n.label}
              </text>
            </g>
          );
          if (!n.project) return <g key={n.id}>{label}</g>;
          const project = projectBySlug.get(n.project)!;
          return (
            <Link key={n.id} href={`/projects/${n.project}`} aria-label={`${n.label}: ${project.title} case study`}>
              {label}
            </Link>
          );
        })}
      </svg>

      <div className="mt-2 flex min-h-[3.25rem] items-start justify-between gap-3">
        <p aria-live="polite" className="text-sm text-fg-muted">
          {activeProject ? (
            <>
              <span className="font-mono text-[0.8125rem] text-accent">{activeNode!.label}</span>
              {" → "}
              <span className="font-medium text-fg">{activeProject.title}</span>: {activeProject.tagline}
            </>
          ) : (
            <span className="font-mono text-[0.8125rem] text-fg-meta">hover or tab to a system to see where I built it</span>
          )}
        </p>
        {animating && (
          <button
            type="button"
            onClick={togglePause}
            className="shrink-0 rounded-md border border-border px-2.5 py-1 font-mono text-[0.75rem] text-fg-muted transition-colors duration-150 hover:border-accent hover:text-fg"
          >
            <span aria-hidden="true">{paused ? "▶ " : "❚❚ "}</span>
            {paused ? "Play" : "Pause"}
          </button>
        )}
      </div>
    </div>
  );
}

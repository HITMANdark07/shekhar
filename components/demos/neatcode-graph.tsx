"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import data from "@/content/generated/site-graph.json";
import { GRAPH_QUERIES, highlight, neighbors, type GraphQuery, type SiteGraph } from "@/lib/site-graph";

const graph = data as SiteGraph;

// The 3D view is client-only canvas code; load it on demand so the page ships the 2D SVG first.
const NeatCodeGraph3D = dynamic(() => import("./neatcode-graph-3d").then((m) => m.NeatCodeGraph3D), {
  ssr: false,
  loading: () => <div className="h-[440px] animate-pulse rounded-lg border border-border bg-bg motion-reduce:animate-none" />,
});

const GROUP_STYLE: Record<string, { fill: string; stroke: string; label: string }> = {
  app: { fill: "var(--accent)", stroke: "var(--accent)", label: "routes (app/)" },
  components: { fill: "var(--surface)", stroke: "var(--accent)", label: "components/" },
  content: { fill: "var(--fg)", stroke: "var(--fg)", label: "content/" },
  lib: { fill: "var(--surface)", stroke: "var(--fg)", label: "lib/" },
};

const degree = new Map<string, number>();
for (const e of graph.edges) {
  degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
  degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
}
const HUBS = new Set(
  [...degree.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id]) => id),
);

export function NeatCodeGraph({ variant }: { variant: "compact" | "full" }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState<GraphQuery | null>(null);
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const interactiveNodes = variant === "full";

  const lit = useMemo(
    () => highlight(graph, selected, query && query.node === selected ? query.direction : undefined),
    [selected, query],
  );
  const active = selected !== null;

  function choose(id: string) {
    setQuery(null);
    setSelected((cur) => (cur === id ? null : id));
  }

  function ask(q: GraphQuery) {
    setQuery(q);
    setSelected(q.node);
  }

  const answer = selected ? neighbors(graph, selected) : null;
  const selectedNode = graph.nodes.find((n) => n.id === selected);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Ask the graph">
        {GRAPH_QUERIES.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => ask(q)}
            aria-pressed={query?.label === q.label}
            className="rounded-full border border-border px-3 py-1 font-mono text-[0.8125rem] text-fg-muted transition-colors duration-150 hover:border-accent hover:text-fg aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-fg"
          >
            {q.label}
          </button>
        ))}
      </div>

      {interactiveNodes && (
        <div role="group" aria-label="Graph view" className="flex gap-1 self-start rounded-lg border border-border p-0.5 font-mono text-[0.75rem]">
          {(["2d", "3d"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className="rounded-md px-2.5 py-1 text-fg-muted transition-colors duration-150 aria-pressed:bg-accent aria-pressed:text-accent-fg"
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {mode === "3d" ? (
        <NeatCodeGraph3D graph={graph} lit={lit} selected={selected} onSelect={(id) => { setQuery(null); setSelected(id); }} />
      ) : (
      <svg
          viewBox="0 0 600 360"
          className="h-auto w-full"
          role={interactiveNodes ? "group" : "img"}
          aria-label={`Dependency graph of this website: ${graph.stats.files} files and ${graph.stats.edges} links, indexed by NeatCode`}
        >
          <g>
            {graph.edges.map((e, i) => {
              const s = graph.nodes.find((n) => n.id === e.source)!;
              const t = graph.nodes.find((n) => n.id === e.target)!;
              const on = lit.edges.has(i);
              return (
                <line
                  key={`${e.source}->${e.target}`}
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  pathLength={1}
                  className="graph-edge"
                  style={{ ["--i" as string]: i }}
                  stroke={on ? "var(--accent)" : "var(--fg-meta)"}
                  strokeWidth={on ? 1.6 : 0.8}
                  strokeOpacity={active && !on ? 0.12 : on ? 0.95 : 0.45}
                />
              );
            })}
          </g>
          {graph.nodes.map((n) => {
            const style = GROUP_STYLE[n.group] ?? GROUP_STYLE.lib;
            const r = 4 + Math.min(degree.get(n.id) ?? 0, 10) * 0.55;
            const on = lit.nodes.has(n.id);
            // Compact card: label only the selected file; full view: neighbours and hubs too.
            const showLabel = interactiveNodes ? on || (!active && HUBS.has(n.id)) : selected === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x} ${n.y})`}
                opacity={active && !on ? 0.25 : 1}
                className={interactiveNodes ? "graph-node cursor-pointer" : undefined}
                {...(interactiveNodes
                  ? {
                      role: "button",
                      tabIndex: 0,
                      "aria-pressed": selected === n.id,
                      "aria-label": `${n.id}, ${degree.get(n.id) ?? 0} links`,
                      onClick: () => choose(n.id),
                      onKeyDown: (ev: React.KeyboardEvent) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          choose(n.id);
                        }
                      },
                    }
                  : {})}
              >
                {selected === n.id && <circle r={r + 5} fill="none" stroke="var(--accent)" strokeWidth={1.2} />}
                <circle className="graph-dot" r={r} fill={style.fill} stroke={style.stroke} strokeWidth={1.4} />
                {showLabel && (
                  <text
                    y={-r - 4}
                    textAnchor="middle"
                    className="pointer-events-none fill-fg font-mono"
                    fontSize={10}
                    aria-hidden="true"
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[0.75rem] text-fg-meta">
        <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legend">
          {Object.entries(GROUP_STYLE).map(([key, s]) => (
            <li key={key} className="flex items-center gap-1.5">
              <svg width="10" height="10" aria-hidden="true">
                <circle cx="5" cy="5" r="4" fill={s.fill} stroke={s.stroke} strokeWidth="1.4" />
              </svg>
              {s.label}
            </li>
          ))}
        </ul>
        <p>
          {graph.stats.files} files · {graph.stats.edges} links · indexed in {graph.stats.indexSeconds}s
        </p>
      </div>

      <div aria-live="polite" className="min-h-[4.5rem] rounded-lg border border-border bg-bg p-3 font-mono text-[0.8125rem]">
        {selected && answer && selectedNode ? (
          <>
            <p className="text-fg">
              <span className="text-accent">query_graph</span>(&quot;{selected}&quot;)
              {query && <span className="text-fg-meta"> · {query.direction === "incoming" ? "used by" : "depends on"}</span>}
            </p>
            {selectedNode.symbols.length > 0 && (
              <p className="mt-1 text-fg-muted">defines: {selectedNode.symbols.join(", ")}</p>
            )}
            {(!query || query.direction === "incoming") && (
              <p className="mt-1 text-fg-muted">
                used by ({answer.incoming.length}): {answer.incoming.join(", ") || "—"}
              </p>
            )}
            {(!query || query.direction === "outgoing") && (
              <p className="mt-1 text-fg-muted">
                depends on ({answer.outgoing.length}): {answer.outgoing.join(", ") || "—"}
              </p>
            )}
          </>
        ) : (
          <p className="text-fg-meta">
            {interactiveNodes
              ? "Pick a question above, or select any file in the graph to see what it uses and what uses it."
              : "Pick a question to light up the answer in the graph."}
          </p>
        )}
      </div>
    </div>
  );
}

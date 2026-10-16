"use client";

import { useEffect, useRef, useState } from "react";
import { pickNode, project, rotate, type ScreenNode, type Vec3 } from "@/lib/graph3d";
import type { SiteGraph } from "@/lib/site-graph";
import { usePrefersReducedMotion } from "@/lib/use-demo-clock";

const HEIGHT = 440;
const START = { yaw: 0.6, pitch: -0.35, zoom: 1.45 };

type Palette = Record<"accent" | "fg" | "meta" | "surface" | "accentFg" | "mono", string>;

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  // Canvas can't resolve CSS variables, so read the real font-family next/font generated.
  return { accent: v("--accent"), fg: v("--fg"), meta: v("--fg-meta"), surface: v("--surface"), accentFg: v("--accent-fg"), mono: v("--font-jetbrains-mono") || "ui-monospace" };
}

export function NeatCodeGraph3D({
  graph,
  lit,
  selected,
  onSelect,
}: {
  graph: SiteGraph;
  lit: { nodes: Set<string>; edges: Set<number> };
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = usePrefersReducedMotion();
  const [spinning, setSpinning] = useState(true);
  const view = useRef({ ...START });
  const hover = useRef<string | null>(null);
  const screen = useRef<ScreenNode[]>([]);
  // Latest props for the render loop without restarting it.
  const live = useRef({ lit, selected, spin: spinning && !reduce });
  useEffect(() => {
    live.current = { lit, selected, spin: spinning && !reduce };
  });

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const degree = new Map<string, number>();
    for (const e of graph.edges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
    }
    const index = new Map(graph.nodes.map((n, i) => [n.id, i]));

    let palette = readPalette();
    const themeObserver = new MutationObserver(() => (palette = readPalette()));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => (palette = readPalette());
    mq.addEventListener("change", onScheme);

    let width = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      canvas.width = width * dpr;
      canvas.height = HEIGHT * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);

    const dragState = { active: false, moved: 0, x: 0, y: 0, pointers: new Map<number, { x: number; y: number }>(), pinch: 0 };

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.visibilityState !== "visible") return;
      const { lit: l, selected: sel, spin } = live.current;
      const v = view.current;
      if (spin && !dragState.active) v.yaw += 0.0025;

      const cam = { width, height: HEIGHT, distance: 3.2, zoom: v.zoom };
      const pts = graph.nodes.map((n) => {
        const r3 = rotate((n.p3 ?? [0, 0, 0]) as Vec3, v.yaw, v.pitch);
        return { n, r3, s: project(r3, cam) };
      });
      const active = sel !== null;

      ctx.clearRect(0, 0, width, HEIGHT);

      // Edges, far to near.
      const edgeOrder = graph.edges
        .map((e, i) => ({ e, i, depth: (pts[index.get(e.source)!].r3[2] + pts[index.get(e.target)!].r3[2]) / 2 }))
        .sort((a, b) => a.depth - b.depth);
      for (const { e, i, depth } of edgeOrder) {
        const a = pts[index.get(e.source)!].s;
        const b = pts[index.get(e.target)!].s;
        const on = l.edges.has(i);
        ctx.globalAlpha = on ? 0.95 : active ? 0.08 : 0.18 + (depth + 1) * 0.16;
        ctx.strokeStyle = on ? palette.accent : palette.meta;
        ctx.lineWidth = on ? 1.8 : 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Nodes, far to near.
      const nodeOrder = [...pts].sort((a, b) => a.r3[2] - b.r3[2]);
      const next: ScreenNode[] = [];
      for (const { n, r3, s } of nodeOrder) {
        const r = (3.2 + Math.min(degree.get(n.id) ?? 0, 10) * 0.45) * s.scale;
        const on = l.nodes.has(n.id);
        const depthAlpha = 0.45 + (r3[2] + 1) * 0.275;
        ctx.globalAlpha = active && !on ? 0.18 : depthAlpha;
        const filled = n.group === "app" || n.group === "content";
        ctx.fillStyle = n.group === "app" ? palette.accent : n.group === "content" ? palette.fg : palette.surface;
        ctx.strokeStyle = n.group === "lib" || n.group === "content" ? palette.fg : palette.accent;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (!filled) ctx.stroke();
        if (sel === n.id) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(s.x, s.y, r + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        next.push({ id: n.id, x: s.x, y: s.y, r, depth: r3[2] });
      }

      // Labels: selection, its neighbours, and whatever is under the pointer.
      ctx.font = `11px ${palette.mono}, ui-monospace, monospace`;
      ctx.textAlign = "center";
      for (const { n, s } of nodeOrder) {
        const show = n.id === hover.current || (active && l.nodes.has(n.id));
        if (!show) continue;
        ctx.globalAlpha = 1;
        ctx.fillStyle = palette.fg;
        ctx.fillText(n.label, s.x, s.y - 10 * s.scale - 6);
      }
      ctx.globalAlpha = 1;
      screen.current = next;
    };

    const onDown = (e: PointerEvent) => {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic or already-released pointers can't be captured; dragging still works without it.
      }
      dragState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dragState.active = true;
      dragState.moved = 0;
      dragState.x = e.clientX;
      dragState.y = e.clientY;
      if (dragState.pointers.size === 2) {
        const [a, b] = [...dragState.pointers.values()];
        dragState.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!dragState.active) {
        const id = pickNode(screen.current, e.clientX - rect.left, e.clientY - rect.top);
        hover.current = id;
        canvas.style.cursor = id ? "pointer" : "grab";
        return;
      }
      dragState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (dragState.pointers.size === 2) {
        const [a, b] = [...dragState.pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (dragState.pinch) view.current.zoom = Math.min(2.6, Math.max(0.6, view.current.zoom * (d / dragState.pinch)));
        dragState.pinch = d;
        dragState.moved += 10;
        return;
      }
      const dx = e.clientX - dragState.x;
      const dy = e.clientY - dragState.y;
      dragState.moved += Math.abs(dx) + Math.abs(dy);
      dragState.x = e.clientX;
      dragState.y = e.clientY;
      view.current.yaw += dx * 0.008;
      view.current.pitch = Math.min(1.3, Math.max(-1.3, view.current.pitch + dy * 0.008));
      canvas.style.cursor = "grabbing";
    };
    const onUp = (e: PointerEvent) => {
      dragState.pointers.delete(e.pointerId);
      if (dragState.pointers.size > 0) return;
      dragState.active = false;
      canvas.style.cursor = "grab";
      if (dragState.moved < 5) {
        const rect = canvas.getBoundingClientRect();
        onSelectRef.current(pickNode(screen.current, e.clientX - rect.left, e.clientY - rect.top));
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      view.current.zoom = Math.min(2.6, Math.max(0.6, view.current.zoom * Math.exp(-e.deltaY * 0.0015)));
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      mq.removeEventListener("change", onScheme);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [graph]);

  function onKeyDown(e: React.KeyboardEvent<HTMLCanvasElement>) {
    const v = view.current;
    const step = 0.12;
    if (e.key === "ArrowLeft") v.yaw -= step;
    else if (e.key === "ArrowRight") v.yaw += step;
    else if (e.key === "ArrowUp") v.pitch = Math.max(-1.3, v.pitch - step);
    else if (e.key === "ArrowDown") v.pitch = Math.min(1.3, v.pitch + step);
    else if (e.key === "+" || e.key === "=") v.zoom = Math.min(2.6, v.zoom * 1.12);
    else if (e.key === "-") v.zoom = Math.max(0.6, v.zoom / 1.12);
    else return;
    e.preventDefault();
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-lg border border-border bg-bg">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          role="img"
          aria-label={`3D dependency graph of this website, ${graph.stats.files} files. Drag or use arrow keys to orbit, scroll or plus and minus to zoom. Use the questions above for a text answer.`}
          className="block w-full touch-none cursor-grab"
          style={{ height: HEIGHT }}
        />
        <p className="pointer-events-none absolute left-3 top-2 font-mono text-[0.6875rem] text-fg-meta">
          drag to orbit · scroll to zoom · click a file
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {!reduce && (
          <button
            type="button"
            onClick={() => setSpinning((s) => !s)}
            aria-pressed={!spinning}
            className="rounded-md border border-border px-2.5 py-1 font-mono text-[0.75rem] text-fg-muted transition-colors duration-150 hover:border-accent hover:text-fg"
          >
            {spinning ? "❚❚ Stop rotating" : "▶ Auto-rotate"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            view.current = { ...START };
            onSelect(null);
          }}
          className="rounded-md border border-border px-2.5 py-1 font-mono text-[0.75rem] text-fg-muted transition-colors duration-150 hover:border-accent hover:text-fg"
        >
          Reset view
        </button>
        {selected && <span className="self-center font-mono text-[0.75rem] text-accent">{selected}</span>}
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { tiltFromPointer } from "@/lib/motion";

/**
 * Pointer-reactive wrapper: a spotlight follows the cursor and the card tilts a few degrees.
 * Tilt is skipped under prefers-reduced-motion (the spotlight is a colour change, not motion).
 */
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const t = tiltFromPointer(e.clientX - r.left, e.clientY - r.top, r.width, r.height, 4);
    el.style.setProperty("--mx", `${t.mx}%`);
    el.style.setProperty("--my", `${t.my}%`);
    el.style.setProperty("--rx", `${t.rx}deg`);
    el.style.setProperty("--ry", `${t.ry}deg`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}

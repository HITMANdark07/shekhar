"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** True when the visitor prefers reduced motion (and during SSR, so demos render paused). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCE).matches,
    () => true,
  );
}

/**
 * Shared play/pause clock for demos. Plays by default unless the visitor prefers
 * reduced motion, and only ticks while on screen and the tab is visible.
 */
export function useDemoClock(onTick: () => void, intervalMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [choice, setChoice] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const tick = useRef(onTick);
  const playing = choice ?? !reduce;

  useEffect(() => {
    tick.current = onTick;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") tick.current();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [playing, visible, intervalMs]);

  return { ref, playing, toggle: () => setChoice(!playing) };
}

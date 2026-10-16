"use client";

import { useEffect, useRef, useState } from "react";
import { formatStat, parseStat } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-demo-clock";

/** Renders the final value on the server; counts up from zero once, when first scrolled into view. */
export function CountUp({ value, durationMs = 1100 }: { value: string; durationMs?: number }) {
  const parsed = parseStat(value);
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!parsed || reduce || !el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(formatStat(parsed, parsed.value * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // parsed is derived from value; re-run only when the value or motion preference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

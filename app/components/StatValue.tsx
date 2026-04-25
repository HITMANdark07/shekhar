"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  count: number | "∞";
  suffix?: string;
};

export default function StatValue({ count, suffix = "" }: Props) {
  const [display, setDisplay] = useState<string>("0");
  const ref = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (count === "∞") {
      setDisplay("∞");
      return;
    }
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || doneRef.current) return;
          doneRef.current = true;
          const tgt = count;
          const t0 = performance.now();
          const dur = 1200;
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = Math.floor(tgt * eased);
            setDisplay(v.toLocaleString() + suffix);
            if (p < 1) requestAnimationFrame(tick);
            else setDisplay(tgt.toLocaleString() + suffix);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [count, suffix]);

  return (
    <div className="v" ref={ref}>
      {display}
    </div>
  );
}

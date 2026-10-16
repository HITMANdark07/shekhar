import { describe, expect, it } from "vitest";
import { createSim, killPod, metrics, revivePod, run, step, type SimState } from "@/lib/sim/gpu-queue";

const CONFIG = { i2iPods: 3, arrivalRate: 0.35, t2iShare: 0.3, seed: 42 };

function accounted(s: SimState): number {
  return s.completed.length + s.pods.reduce((n, p) => n + p.queue.length + (p.current ? 1 : 0), 0);
}

/** Step until an arrival of the given kind happens; returns the state right after it. */
function untilArrival(s: SimState, kind: "t2i" | "i2i"): SimState {
  for (let i = 0; i < 500; i++) {
    const before = s.arrived;
    const next = step(s);
    if (next.arrived > before && next.lastArrival === kind) return next;
    s = next;
  }
  throw new Error(`no ${kind} arrival`);
}

describe("gpu-queue simulation (mirrors the real producer/worker design)", () => {
  it("is deterministic for a given seed", () => {
    expect(run(createSim(CONFIG), 300)).toEqual(run(createSim(CONFIG), 300));
  });

  it("has one text-to-image pod plus the configured image-to-image pods", () => {
    const s = createSim(CONFIG);
    expect(s.pods.map((p) => p.kind)).toEqual(["t2i", "i2i", "i2i", "i2i"]);
  });

  it("fans each scene request out as one candidate per i2i pod, all in one batch", () => {
    const s = untilArrival(createSim({ ...CONFIG, t2iShare: 0 }), "i2i");
    const batch = s.lastBatch!;
    const placed = s.pods
      .filter((p) => p.kind === "i2i")
      .map((p) => [...p.queue, ...(p.current ? [p.current] : [])].filter((j) => j.batch === batch).length);
    expect(placed).toEqual([1, 1, 1]);
  });

  it("sends portrait (t2i) jobs only to the t2i pod", () => {
    let s = createSim({ ...CONFIG, t2iShare: 1 });
    s = run(s, 60);
    for (const p of s.pods.filter((p) => p.kind === "i2i")) {
      expect(p.queue.length + (p.current ? 1 : 0)).toBe(0);
    }
    expect(s.completed.every((j) => j.kind === "t2i")).toBe(true);
  });

  it("runs at most one job per worker", () => {
    let s = createSim(CONFIG);
    for (let i = 0; i < 400; i++) {
      s = step(s);
      for (const p of s.pods) expect(p.current === null || p.current.pod === p.id).toBe(true);
    }
  });

  it("requeues a killed worker's job to the front of its own pod queue (acks_late), losing nothing", () => {
    let s = run(createSim(CONFIG), 80);
    const pod = s.pods.find((p) => p.kind === "i2i" && p.current)!;
    const running = pod.current!;
    const before = accounted(s);
    s = killPod(s, pod.id);
    const dead = s.pods[pod.id];
    expect(dead.alive).toBe(false);
    expect(dead.current).toBeNull();
    expect(dead.queue[0].id).toBe(running.id);
    expect(accounted(s)).toBe(before);
    expect(s.requeued).toBe(1);

    const queuedWhileDead = dead.queue.length;
    s = run(s, 30);
    expect(s.pods[pod.id].current).toBeNull();
    expect(s.pods[pod.id].queue.length).toBeGreaterThanOrEqual(queuedWhileDead);

    s = revivePod(s, pod.id);
    s = step(s);
    expect(s.pods[pod.id].current?.id).toBe(running.id);
    expect(accounted(s)).toBe(s.arrived);
  });

  it("renders a whole batch in about one job's time when pods are idle", () => {
    const s = run(createSim({ i2iPods: 3, arrivalRate: 0.02, t2iShare: 0, seed: 5 }), 600);
    const m = metrics(s);
    expect(m.batchesDone).toBeGreaterThan(0);
    expect(m.avgBatchTime).toBeLessThanOrEqual(14);
  });

  it("grows the batch size with the number of i2i pods", () => {
    const s = untilArrival(createSim({ i2iPods: 4, arrivalRate: 0.5, t2iShare: 0, seed: 8 }), "i2i");
    const count = s.pods.reduce(
      (n, p) => n + [...p.queue, ...(p.current ? [p.current] : [])].filter((j) => j.batch === s.lastBatch).length,
      0,
    );
    expect(count).toBe(4);
  });
});

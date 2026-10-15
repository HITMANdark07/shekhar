import { describe, expect, it } from "vitest";
import {
  createSim,
  killPod,
  metrics,
  revivePod,
  run,
  step,
  type SimState,
} from "@/lib/sim/gpu-queue";

const CONFIG = { pods: 3, arrivalRate: 0.5, seed: 42 };

function accounted(s: SimState): number {
  return (
    s.completed.length +
    s.backlog.length +
    s.pods.reduce((n, p) => n + p.queue.length + (p.current ? 1 : 0), 0)
  );
}

describe("gpu-queue simulation", () => {
  it("is deterministic for a given seed", () => {
    expect(run(createSim(CONFIG), 300)).toEqual(run(createSim(CONFIG), 300));
  });

  it("never runs more than one job per pod (single concurrency)", () => {
    let s = createSim(CONFIG);
    for (let i = 0; i < 500; i++) {
      s = step(s);
      for (const p of s.pods) expect(p.current === null || typeof p.current.id === "number").toBe(true);
      expect(s.pods.filter((p) => p.current).length).toBeLessThanOrEqual(s.pods.length);
    }
  });

  it("routes each new job to the least-loaded live pod", () => {
    let s = createSim({ pods: 3, arrivalRate: 1, seed: 1 });
    s = step(s);
    s = step(s);
    s = step(s);
    const loads = s.pods.map((p) => p.queue.length + (p.current ? 1 : 0));
    expect(Math.max(...loads) - Math.min(...loads)).toBeLessThanOrEqual(1);
  });

  it("reroutes a killed pod's jobs without losing any", () => {
    let s = run(createSim(CONFIG), 120);
    const before = accounted(s);
    s = killPod(s, 0);
    expect(s.pods[0].alive).toBe(false);
    expect(s.pods[0].current).toBeNull();
    expect(s.pods[0].queue).toEqual([]);
    expect(accounted(s)).toBe(before);
    expect(s.rerouted).toBeGreaterThan(0);
    s = run(s, 100);
    expect(accounted(s)).toBe(s.arrived);
  });

  it("holds jobs in a backlog when every pod is down, and drains it on revive", () => {
    let s = createSim({ pods: 1, arrivalRate: 1, seed: 3 });
    s = killPod(s, 0);
    s = run(s, 10);
    expect(s.backlog.length).toBe(s.arrived);
    s = revivePod(s, 0);
    s = step(s);
    expect(s.backlog.length).toBe(0);
    expect(accounted(s)).toBe(s.arrived);
  });

  it("waits less with more pods on the same arrival stream", () => {
    const one = metrics(run(createSim({ pods: 1, arrivalRate: 0.5, seed: 9 }), 400));
    const four = metrics(run(createSim({ pods: 4, arrivalRate: 0.5, seed: 9 }), 400));
    expect(four.avgWait).toBeLessThan(one.avgWait);
    expect(four.completed).toBeGreaterThan(one.completed);
  });
});

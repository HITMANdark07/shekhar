/**
 * Illustrative, deterministic simulation of a router feeding per-pod queues,
 * one job per GPU worker at a time. Pure functions: every call returns a new state.
 */

export type Workflow = "speech-to-image" | "image-to-image" | "upscale";

export interface Job {
  id: number;
  workflow: Workflow;
  duration: number;
  arrivedAt: number;
  startedAt?: number;
  doneAt?: number;
}

export interface Pod {
  id: number;
  alive: boolean;
  current: Job | null;
  queue: Job[];
}

export interface SimConfig {
  pods: number;
  /** Probability of a new job arriving each tick (0..1). */
  arrivalRate: number;
  seed: number;
}

export interface SimState {
  tick: number;
  rng: number;
  nextId: number;
  arrivalRate: number;
  pods: Pod[];
  backlog: Job[];
  completed: Job[];
  arrived: number;
  rerouted: number;
}

const WORKFLOWS: { workflow: Workflow; min: number; max: number }[] = [
  { workflow: "speech-to-image", min: 8, max: 12 },
  { workflow: "image-to-image", min: 6, max: 9 },
  { workflow: "upscale", min: 3, max: 5 },
];

/** mulberry32: returns [value in 0..1, next seed]. */
function random(seed: number): [number, number] {
  let t = (seed + 0x6d2b79f5) | 0;
  const next = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

export function createSim({ pods, arrivalRate, seed }: SimConfig): SimState {
  return {
    tick: 0,
    rng: seed,
    nextId: 1,
    arrivalRate,
    pods: Array.from({ length: pods }, (_, id) => ({ id, alive: true, current: null, queue: [] })),
    backlog: [],
    completed: [],
    arrived: 0,
    rerouted: 0,
  };
}

function load(p: Pod): number {
  return p.queue.length + (p.current ? 1 : 0);
}

/** Least-loaded live pod, lowest id on ties; null if every pod is down. */
function route(pods: Pod[]): Pod | null {
  let best: Pod | null = null;
  for (const p of pods) if (p.alive && (!best || load(p) < load(best))) best = p;
  return best;
}

function clone(s: SimState): SimState {
  return {
    ...s,
    pods: s.pods.map((p) => ({ ...p, queue: [...p.queue] })),
    backlog: [...s.backlog],
    completed: [...s.completed],
  };
}

function assign(s: SimState, jobs: Job[]): void {
  for (const job of jobs) {
    const pod = route(s.pods);
    if (pod) pod.queue.push(job);
    else s.backlog.push(job);
  }
}

export function step(prev: SimState): SimState {
  const s = clone(prev);
  s.tick += 1;

  if (s.backlog.length && s.pods.some((p) => p.alive)) {
    const waiting = s.backlog;
    s.backlog = [];
    assign(s, waiting);
  }

  let r: number;
  [r, s.rng] = random(s.rng);
  if (r < s.arrivalRate) {
    let w: number;
    let d: number;
    [w, s.rng] = random(s.rng);
    [d, s.rng] = random(s.rng);
    const kind = WORKFLOWS[Math.floor(w * WORKFLOWS.length)];
    const job: Job = {
      id: s.nextId++,
      workflow: kind.workflow,
      duration: kind.min + Math.floor(d * (kind.max - kind.min + 1)),
      arrivedAt: s.tick,
    };
    s.arrived += 1;
    assign(s, [job]);
  }

  for (const pod of s.pods) {
    if (!pod.alive) continue;
    if (pod.current && s.tick - (pod.current.startedAt ?? s.tick) >= pod.current.duration) {
      s.completed.push({ ...pod.current, doneAt: s.tick });
      pod.current = null;
    }
    if (!pod.current && pod.queue.length) {
      const next = pod.queue.shift()!;
      pod.current = { ...next, startedAt: s.tick };
    }
  }
  return s;
}

export function run(s: SimState, ticks: number): SimState {
  let out = s;
  for (let i = 0; i < ticks; i++) out = step(out);
  return out;
}

export function killPod(prev: SimState, podId: number): SimState {
  const s = clone(prev);
  const pod = s.pods.find((p) => p.id === podId);
  if (!pod || !pod.alive) return s;
  const orphans = [...(pod.current ? [{ ...pod.current, startedAt: undefined }] : []), ...pod.queue];
  pod.alive = false;
  pod.current = null;
  pod.queue = [];
  s.rerouted += orphans.length;
  assign(s, orphans);
  return s;
}

export function revivePod(prev: SimState, podId: number): SimState {
  const s = clone(prev);
  const pod = s.pods.find((p) => p.id === podId);
  if (pod) pod.alive = true;
  return s;
}

export function metrics(s: SimState): { completed: number; queued: number; running: number; avgWait: number } {
  const recent = s.completed.slice(-40);
  const avgWait = recent.length
    ? recent.reduce((n, j) => n + ((j.startedAt ?? j.arrivedAt) - j.arrivedAt), 0) / recent.length
    : 0;
  return {
    completed: s.completed.length,
    queued: s.backlog.length + s.pods.reduce((n, p) => n + p.queue.length, 0),
    running: s.pods.filter((p) => p.current).length,
    avgWait: Math.round(avgWait * 10) / 10,
  };
}

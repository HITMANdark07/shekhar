/**
 * Illustrative, deterministic model of the speech-to-image render tier, shaped like the real
 * producer/worker design: one text-to-image pod for character portraits, N image-to-image pods
 * for scene panels. A scene request fans out one candidate per i2i pod (ordered by in-flight
 * count, round-robin on ties); every worker runs one job at a time, and a job whose worker dies
 * is requeued to its own pod (acks_late). Pure functions: every call returns a new state.
 */

export type JobKind = "t2i" | "i2i";

export interface Job {
  id: number;
  kind: JobKind;
  pod: number;
  duration: number;
  arrivedAt: number;
  batch?: number;
  candidate?: number;
  startedAt?: number;
  doneAt?: number;
}

export interface Pod {
  id: number;
  kind: JobKind;
  alive: boolean;
  current: Job | null;
  queue: Job[];
}

export interface SimConfig {
  /** Number of image-to-image pods (= candidates per scene). */
  i2iPods: number;
  /** Probability of a request arriving each tick (0..1). */
  arrivalRate: number;
  /** Share of requests that are portraits (t2i) rather than scene panels (i2i). */
  t2iShare: number;
  seed: number;
}

export interface SimState {
  tick: number;
  rng: number;
  rr: number;
  nextId: number;
  nextBatch: number;
  arrivalRate: number;
  t2iShare: number;
  pods: Pod[];
  completed: Job[];
  arrived: number;
  requeued: number;
  lastArrival?: JobKind;
  lastBatch?: number;
}

/** Fast turbo model for portraits; multi-reference scene edits take longer. */
const DURATION: Record<JobKind, [number, number]> = { t2i: [3, 5], i2i: [8, 12] };

/** mulberry32: returns [value in 0..1, next seed]. */
function random(seed: number): [number, number] {
  let t = (seed + 0x6d2b79f5) | 0;
  const next = t;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

export function createSim({ i2iPods, arrivalRate, t2iShare, seed }: SimConfig): SimState {
  return {
    tick: 0,
    rng: seed,
    rr: 0,
    nextId: 1,
    nextBatch: 1,
    arrivalRate,
    t2iShare,
    pods: [
      { id: 0, kind: "t2i", alive: true, current: null, queue: [] },
      ...Array.from({ length: i2iPods }, (_, i) => ({ id: i + 1, kind: "i2i" as const, alive: true, current: null, queue: [] })),
    ],
    completed: [],
    arrived: 0,
    requeued: 0,
  };
}

function inflight(p: Pod): number {
  return p.queue.length + (p.current ? 1 : 0);
}

function clone(s: SimState): SimState {
  return { ...s, pods: s.pods.map((p) => ({ ...p, queue: [...p.queue] })), completed: [...s.completed] };
}

function duration(s: SimState, kind: JobKind): number {
  let d: number;
  [d, s.rng] = random(s.rng);
  const [min, max] = DURATION[kind];
  return min + Math.floor(d * (max - min + 1));
}

/** Every i2i pod exactly once, least in-flight first; ties broken by a rotating offset. */
function pickAll(s: SimState): Pod[] {
  const pods = s.pods.filter((p) => p.kind === "i2i");
  s.rr += 1;
  const rotated = pods.map((_, i) => pods[(i + s.rr) % pods.length]);
  return [...rotated].sort((a, b) => inflight(a) - inflight(b));
}

export function step(prev: SimState): SimState {
  const s = clone(prev);
  s.tick += 1;
  s.lastArrival = undefined;

  let r: number;
  [r, s.rng] = random(s.rng);
  if (r < s.arrivalRate) {
    let k: number;
    [k, s.rng] = random(s.rng);
    if (k < s.t2iShare) {
      const pod = s.pods[0];
      pod.queue.push({ id: s.nextId++, kind: "t2i", pod: pod.id, duration: duration(s, "t2i"), arrivedAt: s.tick });
      s.arrived += 1;
      s.lastArrival = "t2i";
    } else {
      const batch = s.nextBatch++;
      pickAll(s).forEach((pod, candidate) => {
        pod.queue.push({ id: s.nextId++, kind: "i2i", pod: pod.id, duration: duration(s, "i2i"), arrivedAt: s.tick, batch, candidate });
        s.arrived += 1;
      });
      s.lastArrival = "i2i";
      s.lastBatch = batch;
    }
  }

  for (const pod of s.pods) {
    if (!pod.alive) continue;
    if (pod.current && s.tick - (pod.current.startedAt ?? s.tick) >= pod.current.duration) {
      s.completed.push({ ...pod.current, doneAt: s.tick });
      pod.current = null;
    }
    if (!pod.current && pod.queue.length) {
      pod.current = { ...pod.queue.shift()!, startedAt: s.tick };
    }
  }
  return s;
}

export function run(s: SimState, ticks: number): SimState {
  let out = s;
  for (let i = 0; i < ticks; i++) out = step(out);
  return out;
}

/** The worker dies: its unacknowledged job goes back to the front of the same pod's queue. */
export function killPod(prev: SimState, podId: number): SimState {
  const s = clone(prev);
  const pod = s.pods.find((p) => p.id === podId);
  if (!pod || !pod.alive) return s;
  if (pod.current) {
    pod.queue.unshift({ ...pod.current, startedAt: undefined });
    pod.current = null;
    s.requeued += 1;
  }
  pod.alive = false;
  return s;
}

export function revivePod(prev: SimState, podId: number): SimState {
  const s = clone(prev);
  const pod = s.pods.find((p) => p.id === podId);
  if (pod) pod.alive = true;
  return s;
}

export function metrics(s: SimState) {
  const byBatch = new Map<number, Job[]>();
  for (const j of s.completed) if (j.batch !== undefined) byBatch.set(j.batch, [...(byBatch.get(j.batch) ?? []), j]);
  const candidates = s.pods.filter((p) => p.kind === "i2i").length;
  const done = [...byBatch.values()].filter((jobs) => jobs.length === candidates);
  const recent = done.slice(-20);
  const avgBatchTime = recent.length
    ? recent.reduce((n, jobs) => n + (Math.max(...jobs.map((j) => j.doneAt!)) - jobs[0].arrivedAt), 0) / recent.length
    : 0;
  return {
    completed: s.completed.length,
    batchesDone: done.length,
    queued: s.pods.reduce((n, p) => n + p.queue.length, 0),
    running: s.pods.filter((p) => p.current).length,
    avgBatchTime: Math.round(avgBatchTime * 10) / 10,
  };
}

/**
 * How the speech-to-image render tier is wired, taken from img2img: each Celery worker listens to
 * exactly one Redis queue and drives exactly one ComfyUI GPU (workers.toml: name → queue → COMFY_URL).
 * Endpoint URLs are deliberately omitted.
 */

export const LANES = ["t2i", "p1", "p2", "p3"] as const;
export type Lane = (typeof LANES)[number];

const LANE_Y: Record<Lane, number> = { t2i: 72, p1: 162, p2: 252, p3: 342 };
const QUEUE_NAME: Record<Lane, string> = { t2i: "t2i", p1: "i2i.pod1", p2: "i2i.pod2", p3: "i2i.pod3" };

export interface WireNode {
  id: string;
  label: string;
  sub: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  kind: "client" | "api" | "store" | "queue" | "worker" | "gpu";
  lane?: Lane;
}

export interface WireEdge {
  id: string;
  from: string;
  to: string;
  kind: "http" | "db" | "enqueue" | "queue" | "comfy" | "storage" | "progress" | "sse";
  /** Vertical offset so a request and its response don't overlap. */
  offset?: number;
}

export interface Packet {
  edge: string;
  reverse?: boolean;
  /** Continuous stream (progress) rather than a single message. */
  stream?: boolean;
  tone: "request" | "progress" | "result";
}

export interface Phase {
  id: "request" | "jobs" | "dispatch" | "pull" | "submit" | "render" | "fetch" | "done";
  title: string;
  detail: string;
  trace: string;
  packets: Packet[];
}

export const wiring = {
  width: 820,
  height: 470,
  redisFrame: { x: 284, y: 30, w: 122, h: 422 },
  nodes: [
    { id: "client", label: "Client", sub: "browser · app", cx: 60, cy: 207, w: 100, h: 58, kind: "client" },
    { id: "api", label: "FastAPI", sub: "producer · router", cx: 192, cy: 207, w: 116, h: 64, kind: "api" },
    { id: "pg", label: "PostgreSQL", sub: "Job rows", cx: 192, cy: 422, w: 116, h: 42, kind: "store" },
    ...LANES.map(
      (lane): WireNode => ({ id: `q-${lane}`, label: QUEUE_NAME[lane], sub: "queue", cx: 345, cy: LANE_Y[lane], w: 104, h: 36, kind: "queue", lane }),
    ),
    { id: "pubsub", label: "pub/sub", sub: "progress events", cx: 345, cy: 422, w: 104, h: 42, kind: "queue" },
    ...LANES.map(
      (lane): WireNode => ({
        id: `worker-${lane}`,
        label: lane === "t2i" ? "worker · t2i" : `worker · i2i-pod${lane.slice(1)}`,
        sub: "Celery · concurrency 1",
        cx: 503,
        cy: LANE_Y[lane],
        w: 132,
        h: 50,
        kind: "worker",
        lane,
      }),
    ),
    ...LANES.map(
      (lane): WireNode => ({
        id: `gpu-${lane}`,
        label: lane === "t2i" ? "GPU · t2i" : `GPU · i2i ${lane.slice(1)}`,
        sub: lane === "t2i" ? "ComfyUI · Z-Image Turbo" : "ComfyUI · Flux.2 Klein",
        cx: 726,
        cy: LANE_Y[lane],
        w: 158,
        h: 62,
        kind: "gpu",
        lane,
      }),
    ),
    { id: "minio", label: "MinIO", sub: "PNG results", cx: 640, cy: 422, w: 110, h: 42, kind: "store" },
  ] satisfies WireNode[],
  edges: [
    { id: "c-api", from: "client", to: "api", kind: "http", offset: -10 },
    { id: "api-client", from: "api", to: "client", kind: "sse", offset: 10 },
    { id: "api-pg", from: "api", to: "pg", kind: "db" },
    { id: "pubsub-api", from: "pubsub", to: "api", kind: "progress" },
    ...LANES.flatMap((lane): WireEdge[] => [
      { id: `api-q-${lane}`, from: "api", to: `q-${lane}`, kind: "enqueue" },
      { id: `q-${lane}->worker-${lane}`, from: `q-${lane}`, to: `worker-${lane}`, kind: "queue" },
      { id: `worker-${lane}->gpu-${lane}`, from: `worker-${lane}`, to: `gpu-${lane}`, kind: "comfy" },
      { id: `worker-${lane}->minio`, from: `worker-${lane}`, to: "minio", kind: "storage" },
      { id: `worker-${lane}->pubsub`, from: `worker-${lane}`, to: "pubsub", kind: "progress" },
    ]),
  ] satisfies WireEdge[],
};

export function timeline(kind: "i2i" | "t2i"): Phase[] {
  const lanes: Lane[] = kind === "i2i" ? ["p1", "p2", "p3"] : ["t2i"];
  const each = (f: (lane: Lane) => Packet) => lanes.map(f);
  const scene = kind === "i2i";
  return [
    {
      id: "request",
      title: scene ? "POST /jobs/i2i" : "POST /jobs/t2i",
      detail: scene
        ? "The client asks for a scene panel: the prompt plus the characters' reference images."
        : "The client asks for a character portrait from a text prompt.",
      trace: scene ? '{ "prompt": "the king in the throne room", "refs": 2, "seed": 41 }' : '{ "prompt": "portrait of the youngest daughter" }',
      packets: [{ edge: "c-api", tone: "request" }],
    },
    {
      id: "jobs",
      title: scene ? "Three Job rows · pick the pods" : "One Job row · the t2i pod",
      detail: scene
        ? "The producer writes one Job row per candidate to PostgreSQL. The router increments each pod's in-flight counter in Redis and orders the pods least-busy first."
        : "The producer writes the Job row to PostgreSQL and counts it in flight on the text-to-image pod.",
      trace: scene ? "INCR pod:i2i.pod1:inflight → 1 (and pod2, pod3)" : "INCR pod:t2i:inflight → 1",
      packets: [{ edge: "api-pg", tone: "request" }],
    },
    {
      id: "dispatch",
      title: scene ? "Fan out: one Celery task per pod queue" : "Enqueue on the t2i queue",
      detail: scene
        ? "Each candidate becomes a Celery task on a different pod's queue, each with its own seed (base + i × 1,000,003), so three GPUs work on the same scene at once."
        : "The portrait becomes a single Celery task on the text-to-image queue.",
      trace: scene ? '{ "queue": "i2i.pod2", "candidate": 2, "seed": 1000044 }' : '{ "queue": "t2i" }',
      packets: each((lane) => ({ edge: `api-q-${lane}`, tone: "request" })),
    },
    {
      id: "pull",
      title: "Each worker drains only its own queue",
      detail: "Every Celery worker listens to exactly one queue with concurrency 1 and prefetch 1, so a GPU never takes a second job while it is busy.",
      trace: `celery worker -Q ${scene ? "i2i.pod2" : "t2i"} -c 1 -O fair`,
      packets: each((lane) => ({ edge: `q-${lane}->worker-${lane}`, tone: "request" })),
    },
    {
      id: "submit",
      title: "Worker → its own GPU",
      detail: scene
        ? "Each worker is wired to one ComfyUI GPU (its COMFY_URL in workers.toml). It uploads the reference images with /upload/image (skipped when that pod already has them, by content hash), then submits the workflow with POST /prompt."
        : "The t2i worker is wired to the text-to-image GPU and submits the workflow with POST /prompt.",
      trace: scene ? "POST /upload/image (2 refs) → POST /prompt { client_id, workflow: flux_klein_i2i }" : "POST /prompt { client_id, workflow: z_image_turbo }",
      packets: each((lane) => ({ edge: `worker-${lane}->gpu-${lane}`, tone: "request" })),
    },
    {
      id: "render",
      title: scene ? "Three GPUs render in parallel" : "The GPU renders",
      detail: "Progress comes back over the ComfyUI /ws websocket. The worker republishes it on Redis pub/sub, and the API streams it to the client over SSE.",
      trace: 'event: progress   data: {"jobId": "j2", "pct": 55}',
      packets: [
        ...each((lane): Packet => ({ edge: `worker-${lane}->gpu-${lane}`, reverse: true, stream: true, tone: "progress" })),
        ...each((lane): Packet => ({ edge: `worker-${lane}->pubsub`, stream: true, tone: "progress" })),
        { edge: "pubsub-api", stream: true, tone: "progress" },
        { edge: "api-client", stream: true, tone: "progress" },
      ],
    },
    {
      id: "fetch",
      title: "Fetch the image, store it",
      detail: "Each worker downloads its PNG from its GPU with /view, uploads it to MinIO, and marks the Job COMPLETED.",
      trace: `GET /view → PUT jobs/${kind}/j2.png → 200`,
      packets: [
        ...each((lane): Packet => ({ edge: `worker-${lane}->gpu-${lane}`, reverse: true, tone: "result" })),
        ...each((lane): Packet => ({ edge: `worker-${lane}->minio`, tone: "result" })),
      ],
    },
    {
      id: "done",
      title: scene ? "Three candidates in about one job's time" : "Portrait ready",
      detail: scene
        ? "A done event carries each image's URL to the client, which keeps the best. task_postrun decrements each pod's in-flight counter, so the router sees the GPUs free again."
        : "A done event carries the image URL to the client; task_postrun decrements the pod's in-flight counter.",
      trace: 'event: done   data: {"resultUrl": "/jobs/j2/result"}',
      packets: [
        ...each((lane): Packet => ({ edge: `worker-${lane}->pubsub`, tone: "result" })),
        { edge: "pubsub-api", tone: "result" },
        { edge: "api-client", tone: "result" },
      ],
    },
  ];
}

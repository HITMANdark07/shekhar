import { describe, expect, it } from "vitest";
import { LANES, wiring, timeline } from "@/content/demos/gpu-wiring";

const nodeIds = new Set(wiring.nodes.map((n) => n.id));
const edgeIds = new Set(wiring.edges.map((e) => e.id));

describe("GPU wiring diagram (mirrors img2img's workers.toml)", () => {
  it("wires every Celery worker to exactly one GPU, and every GPU to exactly one worker", () => {
    for (const lane of LANES) {
      const links = wiring.edges.filter((e) => e.kind === "comfy" && (e.from === `worker-${lane}` || e.to === `gpu-${lane}`));
      expect(links).toHaveLength(1);
      expect(links[0]).toMatchObject({ from: `worker-${lane}`, to: `gpu-${lane}` });
    }
  });

  it("feeds each worker from exactly one queue", () => {
    for (const lane of LANES) {
      expect(wiring.edges.filter((e) => e.to === `worker-${lane}` && e.kind === "queue")).toHaveLength(1);
    }
  });

  it("only references nodes that exist", () => {
    for (const e of wiring.edges) {
      expect(nodeIds.has(e.from)).toBe(true);
      expect(nodeIds.has(e.to)).toBe(true);
    }
  });

  it.each(["i2i", "t2i"] as const)("%s timeline only uses edges that exist", (kind) => {
    for (const phase of timeline(kind)) for (const p of phase.packets) expect(edgeIds.has(p.edge)).toBe(true);
  });

  it("fans a scene request out to all three i2i queues at once", () => {
    const dispatch = timeline("i2i").find((p) => p.id === "dispatch")!;
    expect(dispatch.packets.map((p) => p.edge).sort()).toEqual(["api-q-p1", "api-q-p2", "api-q-p3"]);
  });

  it("keeps a portrait request on the t2i lane only", () => {
    const edges = timeline("t2i").flatMap((p) => p.packets.map((x) => x.edge));
    expect(edges.some((e) => /p[123]/.test(e))).toBe(false);
    expect(edges).toContain("worker-t2i->gpu-t2i");
  });

  it("names the real ComfyUI calls each worker makes to its GPU", () => {
    const text = JSON.stringify(timeline("i2i"));
    for (const call of ["/upload/image", "POST /prompt", "/ws", "/view", "MinIO", "task_postrun"]) expect(text).toContain(call);
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { GpuQueueDemo } from "@/components/demos/gpu-queue-demo";
import { caseStudies } from "@/content/case-studies";

describe("GPU case study leads with the wiring", () => {
  it("opens on the GPU wiring view by default", () => {
    const html = renderToStaticMarkup(createElement(GpuQueueDemo));
    expect(html).toContain("How each GPU is wired");
    expect(html).toContain("worker · i2i-pod1");
    expect(html).toContain("HTTP + WS");
    expect(html).toMatch(/aria-pressed="true"[^>]*>How each GPU is wired/);
  });

  it("titles the demo around the GPU wiring", () => {
    expect(caseStudies["gpu-inference"].demo.title).toMatch(/GPU/);
    expect(caseStudies["gpu-inference"].demo.caption).toMatch(/each Celery worker/i);
  });
});

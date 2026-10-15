import { describe, expect, it } from "vitest";
import siteGraph from "@/content/generated/site-graph.json";
import { GRAPH_QUERIES, highlight, neighbors, type SiteGraph } from "@/lib/site-graph";

const tiny: SiteGraph = {
  generatedAt: "2026-10-15",
  stats: { files: 3, symbols: 4, edges: 2, indexSeconds: 0.5 },
  nodes: [
    { id: "a.ts", label: "a.ts", group: "app", x: 0, y: 0, symbols: [] },
    { id: "b.ts", label: "b.ts", group: "lib", x: 1, y: 1, symbols: [] },
    { id: "c.ts", label: "c.ts", group: "lib", x: 2, y: 2, symbols: [] },
  ],
  edges: [
    { source: "a.ts", target: "b.ts", kinds: ["imports"] },
    { source: "c.ts", target: "b.ts", kinds: ["imports", "calls"] },
  ],
};

describe("neighbors", () => {
  it("splits incoming and outgoing edges", () => {
    expect(neighbors(tiny, "b.ts")).toEqual({ incoming: ["a.ts", "c.ts"], outgoing: [] });
    expect(neighbors(tiny, "a.ts")).toEqual({ incoming: [], outgoing: ["b.ts"] });
  });

  it("returns empty lists for unknown ids", () => {
    expect(neighbors(tiny, "nope.ts")).toEqual({ incoming: [], outgoing: [] });
  });
});

describe("generated site graph (real NeatCode export)", () => {
  const graph = siteGraph as SiteGraph;
  const ids = new Set(graph.nodes.map((n) => n.id));

  it("has nodes, edges and stats from the index", () => {
    expect(graph.nodes.length).toBeGreaterThan(20);
    expect(graph.edges.length).toBeGreaterThan(20);
    expect(graph.stats.files).toBeGreaterThan(0);
    expect(graph.stats.indexSeconds).toBeGreaterThan(0);
  });

  it("only references nodes that exist", () => {
    for (const e of graph.edges) {
      expect(ids.has(e.source)).toBe(true);
      expect(ids.has(e.target)).toBe(true);
    }
  });

  it("keeps every node inside the 0..600 x 0..360 canvas", () => {
    for (const n of graph.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(600);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(360);
    }
  });

  it("excludes tests, scripts and config files", () => {
    for (const id of ids) expect(id).toMatch(/^(app|components|content|lib)\//);
  });

  it("every preset query points at a real node with at least one answer", () => {
    for (const q of GRAPH_QUERIES) {
      expect(ids.has(q.node)).toBe(true);
      expect(neighbors(graph, q.node)[q.direction].length).toBeGreaterThan(0);
    }
  });
});

describe("highlight", () => {
  it("lights the node, its neighbours and the connecting edges", () => {
    const h = highlight(tiny, "b.ts");
    expect([...h.nodes].sort()).toEqual(["a.ts", "b.ts", "c.ts"]);
    expect([...h.edges].sort()).toEqual([0, 1]);
  });

  it("can restrict to one direction", () => {
    const h = highlight(tiny, "a.ts", "incoming");
    expect([...h.nodes]).toEqual(["a.ts"]);
    expect(h.edges.size).toBe(0);
  });

  it("is empty when nothing is selected", () => {
    const h = highlight(tiny, null);
    expect(h.nodes.size).toBe(0);
    expect(h.edges.size).toBe(0);
  });
});

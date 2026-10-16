import { describe, expect, it } from "vitest";
import { buildCommands, filterCommands } from "@/lib/commands";
import { formatStat, parseStat, tiltFromPointer } from "@/lib/motion";
import { projects } from "@/content/projects";
import { systemMap } from "@/content/system-map";

describe("parseStat / formatStat (count-up)", () => {
  it.each([
    ["4+ years", { prefix: "", value: 4, suffix: "+ years", decimals: 0 }],
    ["10k+", { prefix: "", value: 10, suffix: "k+", decimals: 0 }],
    ["131k LOC", { prefix: "", value: 131, suffix: "k LOC", decimals: 0 }],
    ["+25%", { prefix: "+", value: 25, suffix: "%", decimals: 0 }],
    ["3.8s", { prefix: "", value: 3.8, suffix: "s", decimals: 1 }],
    ["<300ms", { prefix: "<", value: 300, suffix: "ms", decimals: 0 }],
  ])("parses %s", (input, expected) => {
    expect(parseStat(input)).toEqual(expected);
  });

  it("round-trips the final value exactly", () => {
    for (const s of ["4+ years", "10k+", "131k LOC", "+25%", "3.8s", "<300ms"]) {
      const p = parseStat(s)!;
      expect(formatStat(p, p.value)).toBe(s);
    }
  });

  it("returns null for values without a number", () => {
    expect(parseStat("n/a")).toBeNull();
  });
});

describe("tiltFromPointer", () => {
  it("is flat at the centre and tilts toward the pointer, capped at max", () => {
    expect(tiltFromPointer(50, 50, 100, 100, 6)).toEqual({ rx: 0, ry: 0, mx: 50, my: 50 });
    const corner = tiltFromPointer(100, 0, 100, 100, 6);
    expect(corner.ry).toBe(6);
    expect(corner.rx).toBe(6);
    expect(corner.mx).toBe(100);
    expect(corner.my).toBe(0);
  });

  it("clamps pointers outside the card", () => {
    const t = tiltFromPointer(500, -40, 100, 100, 6);
    expect(Math.abs(t.rx)).toBeLessThanOrEqual(6);
    expect(Math.abs(t.ry)).toBeLessThanOrEqual(6);
  });
});

describe("command palette", () => {
  const commands = buildCommands();

  it("offers every page, every project and the contact actions", () => {
    const ids = commands.map((c) => c.id);
    for (const id of ["page:/", "page:/projects", "page:/about", "page:/terminal", "action:copy-email", "action:theme"]) {
      expect(ids).toContain(id);
    }
    for (const p of projects) expect(ids).toContain(`project:${p.slug}`);
  });

  it("matches loosely and ranks prefix matches first", () => {
    const hits = filterCommands(commands, "neat").map((c) => c.id);
    expect(hits[0]).toBe("project:neatcode");
    expect(filterCommands(commands, "gpu pipe").map((c) => c.id)).toContain("project:gpu-inference");
  });

  it("returns everything for an empty query and nothing for nonsense", () => {
    expect(filterCommands(commands, "")).toHaveLength(commands.length);
    expect(filterCommands(commands, "zzqqxx")).toHaveLength(0);
  });
});

describe("hero system map", () => {
  const ids = new Set(systemMap.nodes.map((n) => n.id));

  it("connects only nodes that exist", () => {
    for (const e of systemMap.edges) {
      expect(ids.has(e.from)).toBe(true);
      expect(ids.has(e.to)).toBe(true);
    }
  });

  it("links every project node to a real case study", () => {
    const slugs = new Set(projects.map((p) => p.slug));
    for (const n of systemMap.nodes) if (n.project) expect(slugs.has(n.project)).toBe(true);
    expect(systemMap.nodes.filter((n) => n.project).length).toBeGreaterThanOrEqual(5);
  });

  it("keeps nodes inside the viewBox", () => {
    for (const n of systemMap.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(30);
      expect(n.x).toBeLessThanOrEqual(systemMap.width - 30);
      expect(n.y).toBeGreaterThanOrEqual(20);
      expect(n.y).toBeLessThanOrEqual(systemMap.height - 20);
    }
  });
});

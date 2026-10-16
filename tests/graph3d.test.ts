import { describe, expect, it } from "vitest";
import siteGraph from "@/content/generated/site-graph.json";
import { pickNode, project, rotate } from "@/lib/graph3d";
import type { SiteGraph } from "@/lib/site-graph";

describe("rotate", () => {
  it("is identity at zero angles", () => {
    expect(rotate([1, 2, 3], 0, 0)).toEqual([1, 2, 3]);
  });

  it("turns +x into -z after a quarter yaw", () => {
    const [x, y, z] = rotate([1, 0, 0], Math.PI / 2, 0);
    expect(x).toBeCloseTo(0, 6);
    expect(y).toBeCloseTo(0, 6);
    expect(z).toBeCloseTo(-1, 6);
  });

  it("preserves distance from the origin", () => {
    const p = rotate([0.3, -0.7, 0.5], 1.1, -0.4);
    expect(Math.hypot(...p)).toBeCloseTo(Math.hypot(0.3, -0.7, 0.5), 6);
  });
});

describe("project", () => {
  it("puts the origin at the canvas centre", () => {
    const s = project([0, 0, 0], { width: 400, height: 300, distance: 3, zoom: 1 });
    expect(s.x).toBe(200);
    expect(s.y).toBe(150);
  });

  it("draws nearer points larger than farther ones", () => {
    const cam = { width: 400, height: 300, distance: 3, zoom: 1 };
    expect(project([0, 0, 1], cam).scale).toBeGreaterThan(project([0, 0, -1], cam).scale);
  });

  it("zoom scales screen distance from the centre", () => {
    const a = project([0.5, 0, 0], { width: 400, height: 300, distance: 3, zoom: 1 });
    const b = project([0.5, 0, 0], { width: 400, height: 300, distance: 3, zoom: 2 });
    expect(b.x - 200).toBeCloseTo((a.x - 200) * 2, 6);
  });
});

describe("pickNode", () => {
  const pts = [
    { id: "far", x: 100, y: 100, r: 6, depth: -1 },
    { id: "near", x: 103, y: 101, r: 6, depth: 1 },
    { id: "other", x: 300, y: 300, r: 6, depth: 0 },
  ];

  it("picks the nearest-to-camera node under the pointer", () => {
    expect(pickNode(pts, 101, 100)).toBe("near");
  });

  it("returns null when nothing is close", () => {
    expect(pickNode(pts, 200, 20)).toBeNull();
  });
});

describe("3D layout in the exported graph", () => {
  it("gives every node a position inside the unit cube", () => {
    for (const n of (siteGraph as SiteGraph).nodes) {
      expect(n.p3).toHaveLength(3);
      for (const c of n.p3!) expect(Math.abs(c)).toBeLessThanOrEqual(1);
    }
  });
});

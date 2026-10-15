import { describe, expect, it } from "vitest";
import { cumulativeRewards, fleetEpisode } from "@/content/demos/fleet-episode";
import { flows } from "@/content/demos/flows";
import { evalRun, replayOrder } from "@/content/demos/eval-matrix";

describe("fleet episode (synthetic)", () => {
  it("accumulates rewards to exactly 1.0 at task completion", () => {
    const totals = cumulativeRewards(fleetEpisode.steps);
    expect(totals).toHaveLength(fleetEpisode.steps.length);
    expect(totals.at(-1)).toBeCloseTo(1, 5);
    for (let i = 1; i < totals.length; i++) expect(totals[i]).toBeGreaterThanOrEqual(totals[i - 1]);
  });

  it("shows the page as observed before each action (star count matches the observation)", () => {
    for (const s of fleetEpisode.steps) {
      const shown = s.observation.match(/(\d+)\)?\.?$|shows (\d+)/);
      if (shown) expect(String(s.state.stars)).toBe(shown[1] ?? shown[2]);
    }
  });

  it("gives every step an observation, an action and a URL", () => {
    for (const s of fleetEpisode.steps) {
      expect(s.observation).not.toBe("");
      expect(s.action).not.toBe("");
      expect(s.url).toMatch(/^github\.local\//);
    }
  });
});

describe("flow demos", () => {
  it("only step through nodes that exist in their flow", () => {
    for (const f of flows) {
      const ids = new Set(f.nodes.map((n) => n.id));
      expect(f.steps.length).toBeGreaterThan(2);
      for (const s of f.steps) expect(ids.has(s.at)).toBe(true);
    }
  });

  it("covers the generative AI request and both Ivorie views", () => {
    expect(flows.map((f) => f.id).sort()).toEqual(["genai-request", "ivorie-message", "ivorie-payment"]);
  });

  it("never shows invented money amounts or fee percentages", () => {
    const text = JSON.stringify(flows.find((f) => f.id === "ivorie-payment"));
    expect(text).not.toMatch(/[$₹€]\s?\d|\d+\s?%/);
  });
});

describe("eval matrix (sample data)", () => {
  it("has a result for every task × model cell", () => {
    expect(evalRun.results).toHaveLength(evalRun.tasks.length * evalRun.models.length);
  });

  it("replays every cell exactly once", () => {
    const order = replayOrder(evalRun);
    expect(new Set(order).size).toBe(evalRun.results.length);
  });
});

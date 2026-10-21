import { describe, expect, it } from "vitest";
import { cumulativeRewards, fleetEpisode } from "@/content/demos/fleet-episode";
import { flows } from "@/content/demos/flows";
import { evalRun, replayOrder } from "@/content/demos/eval-matrix";
import data from "@/content/generated/eval-matrix.json";

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

  it("covers the generative AI request, both Ivorie views and the story pipeline", () => {
    expect(flows.map((f) => f.id).sort()).toEqual([
      "genai-request",
      "ivorie-message",
      "ivorie-payment",
      "story-pipeline",
      "tenant-companion",
      "tenant-missing",
      "tenant-notifypay",
    ]);
  });

  it("traces the live story pipeline from microphone to panels", () => {
    const ids = flows.find((f) => f.id === "story-pipeline")!.nodes.map((n) => n.id);
    expect(ids).toEqual(["mic", "stt", "director", "dispatch", "gpus", "panels"]);
  });

  it("never shows invented money amounts or fee percentages", () => {
    const text = JSON.stringify(flows.find((f) => f.id === "ivorie-payment"));
    expect(text).not.toMatch(/[$₹€]\s?\d|\d+\s?%/);
  });
});

describe("eval matrix (real run data)", () => {
  const passes = (server: string, model: string) =>
    data.runs.filter((r) => r.server === server && r.model === model && r.outcome === "pass").length;

  it("has 12 tasks x 6 columns x 2 repeats = 144 runs", () => {
    expect(evalRun.tasks).toHaveLength(12);
    expect(evalRun.columns).toHaveLength(6);
    expect(evalRun.results).toHaveLength(72);
    expect(evalRun.results.every((c) => c.repeats.length === 2)).toBe(true);
    expect(data.runs).toHaveLength(144);
  });

  it("matches the published pass totals", () => {
    expect(passes("neatcode", "openai/gpt-6.1-sol")).toBe(24);
    expect(passes("filesystem", "openai/gpt-6.1-sol")).toBe(24);
    expect(passes("neatcode", "google/gemini-3.8-flash")).toBe(0);
    expect(passes("filesystem", "google/gemini-3.8-flash")).toBe(6);
    expect(passes("neatcode", "qwen/qwen3.8-flash")).toBe(2);
    expect(passes("filesystem", "qwen/qwen3.8-flash")).toBe(6);
  });

  it("contains no local paths or keys", () => {
    const text = JSON.stringify(data);
    expect(text).not.toContain("/Users/");
    expect(text).not.toContain("sk-or-");
  });

  it("replays every cell exactly once", () => {
    const order = replayOrder(evalRun);
    expect(new Set(order).size).toBe(evalRun.results.length);
  });
});

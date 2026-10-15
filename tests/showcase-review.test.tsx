import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FlowDemo } from "@/components/demos/flow-demo";
import { NeatCodeGraph } from "@/components/demos/neatcode-graph";
import { caseStudies } from "@/content/case-studies";
import { flows } from "@/content/demos/flows";
import { fleetEpisode } from "@/content/demos/fleet-episode";
import { projects } from "@/content/projects";

describe("final review fixes", () => {
  it("keeps a visible focus style on graph nodes", () => {
    const html = renderToStaticMarkup(<NeatCodeGraph variant="full" />);
    expect(html).toContain("graph-node");
    expect(html).not.toContain("outline-none");
  });

  it("gives Fleet task-level feedback: reward only when the task is complete", () => {
    const rewarded = fleetEpisode.steps.filter((s) => s.reward > 0);
    expect(rewarded).toHaveLength(1);
    expect(rewarded[0]).toBe(fleetEpisode.steps.at(-1));
    expect(rewarded[0].reward).toBe(1);
  });

  it("describes unbuilt mcp-evals features as planned, not shipped", () => {
    const cs = JSON.stringify(caseStudies["mcp-evals"]);
    expect(cs).not.toMatch(/feeds the CLI, a GitHub Action regression gate, a public leaderboard/);
    expect(cs).toMatch(/planned/i);
    expect(projects.find((p) => p.slug === "mcp-evals")!.tagline).toMatch(/being built|building/i);
  });

  it("does not claim the NeatCode index ships inside the npm package", () => {
    expect(JSON.stringify(caseStudies.neatcode)).not.toMatch(/index ships inside an npm package/);
  });

  it("names all of NeatCode's edge confidence tags", () => {
    expect(JSON.stringify(caseStudies.neatcode)).toContain("AMBIGUOUS");
  });

  it("separates the site's sync time from the number of files shown", () => {
    const line = caseStudies.neatcode.outcomes.find((o) => o.includes("This portfolio"))!;
    expect(line).toMatch(/linked files shown/);
  });

  it("uses plain toggle buttons, not a half-built tab pattern", () => {
    const html = renderToStaticMarkup(<FlowDemo ids={["ivorie-message", "ivorie-payment"]} />);
    expect(html).not.toContain('role="tab"');
    expect(html).toContain("aria-pressed");
  });

  it("avoids the most specific unsupported details", () => {
    const text = JSON.stringify(flows) + JSON.stringify(caseStudies["gpu-inference"]);
    expect(text).not.toMatch(/PostgreSQL|never handles card details|transcribed/);
  });
});

import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { projects } from "@/content/projects";
import siteGraph from "@/content/generated/site-graph.json";

describe("case studies", () => {
  it("exist for every project", () => {
    expect(Object.keys(caseStudies).sort()).toEqual(projects.map((p) => p.slug).sort());
  });

  it.each(Object.entries(caseStudies))("%s is complete, with no placeholder copy", (_slug, cs) => {
    expect(cs.tldr.length).toBeGreaterThanOrEqual(3);
    expect(cs.context.length).toBeGreaterThanOrEqual(1);
    expect(cs.role).not.toBe("");
    expect(cs.how.length).toBeGreaterThanOrEqual(3);
    expect(cs.decisions.length).toBeGreaterThanOrEqual(2);
    expect(cs.outcomes.length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(cs)).not.toMatch(/coming soon|lorem|TODO|TBD/i);
  });

  it("gives every project an interactive demo", () => {
    for (const cs of Object.values(caseStudies)) expect(cs.demo.key).toBeTruthy();
  });
});

describe("NeatCode outcome about this site", () => {
  it("quotes the real graph stats instead of a hard-coded number", () => {
    const line = caseStudies.neatcode.outcomes.find((o) => o.includes("This portfolio"));
    expect(line).toContain(`${siteGraph.stats.files} source files`);
    expect(line).toContain(`${siteGraph.stats.indexSeconds}s`);
  });
});

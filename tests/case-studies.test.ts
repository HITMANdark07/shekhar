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
    expect(line).toContain(`${siteGraph.stats.files} linked files shown`);
    expect(line).toContain(`${siteGraph.stats.indexSeconds}s`);
  });
});

describe("Ivorie, grounded in the pb-ivy source", () => {
  const text = JSON.stringify(caseStudies.ivorie);

  it("describes the verified architecture", () => {
    for (const fact of ["Socket.IO", "Redis", "PostgreSQL", "Expo push", "Stripe Connect", "ACH", "Turborepo"]) {
      expect(text).toContain(fact);
    }
  });

  it("explains the three sides of the marketplace", () => {
    expect(text).toMatch(/couples/i);
    expect(text).toMatch(/vendors/i);
    expect(text).toMatch(/recently married/i);
  });
});

describe("Speech-to-image pipeline, grounded in the img2img source", () => {
  const text = JSON.stringify(caseStudies["gpu-inference"]);

  it("describes the verified architecture", () => {
    for (const fact of ["FastAPI", "Celery", "Redis", "ComfyUI", "Sarvam", "MinIO", "SSE", "acks_late", "AWS"]) {
      expect(text).toContain(fact);
    }
  });

  it("is no longer marked confidential and credits the build", () => {
    const p = projects.find((x) => x.slug === "gpu-inference")!;
    expect(p.confidential).toBeFalsy();
    expect(p.period?.start).toBe("2026-08");
    expect(caseStudies["gpu-inference"].role).toMatch(/designed and built/i);
  });
});

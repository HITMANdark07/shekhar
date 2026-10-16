import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { deployTimeline } from "@/content/demos/blue-green";
import { flows } from "@/content/demos/flows";
import { projects } from "@/content/projects";

describe("multi-tenant AI app platform (from apps_go_backend)", () => {
  const project = projects.find((p) => p.slug === "ai-apps-platform");
  const text = JSON.stringify(caseStudies["ai-apps-platform"]);

  it("is in the registry with its real period and stack", () => {
    expect(project).toBeDefined();
    expect(project!.period).toEqual({ start: "2025-12", end: "2026-05" });
    for (const tech of ["Go", "TypeScript", "PostgreSQL", "pgvector", "Redis", "GitHub Actions"]) expect(project!.stack).toContain(tech);
  });

  it("describes the verified architecture", () => {
    for (const fact of ["X-App-ID", "app_id", "Gin", "GORM", "LangGraph", "pgvector", "SSE", "OpenTelemetry", "blue-green", "nginx", "rollback", "arm64"]) {
      expect(text).toContain(fact);
    }
  });

  it("does not claim an automated test gate the pipeline doesn't have", () => {
    expect(text).not.toMatch(/go test|test suite|tests? gate/i);
  });
});

describe("tenant request flows", () => {
  const byId = new Map(flows.map((f) => [f.id, f]));

  it("covers a Januji AI request, a NotifyPay request, and a request without X-App-ID", () => {
    for (const id of ["tenant-januji", "tenant-notifypay", "tenant-missing"] as const) expect(byId.has(id)).toBe(true);
  });

  it("rejects a request without X-App-ID at the app-ID middleware, before auth", () => {
    const steps = byId.get("tenant-missing")!.steps;
    expect(steps.at(-1)!.at).toBe("appid");
    expect(steps.at(-1)!.detail).toMatch(/rejected/i);
  });

  it("scopes the tenant's query by app_id", () => {
    const text = JSON.stringify(byId.get("tenant-notifypay"));
    expect(text).toMatch(/app_id = /);
  });
});

describe("blue-green deploy timeline", () => {
  it("only switches traffic after the new slot passes its health check", () => {
    const steps = deployTimeline(false);
    const healthy = steps.findIndex((s) => s.id === "health");
    const switched = steps.findIndex((s) => s.state.live === "green");
    expect(healthy).toBeGreaterThan(-1);
    expect(switched).toBeGreaterThan(healthy);
    expect(steps.at(-1)!.state).toMatchObject({ live: "green", blue: "stopped", green: "running" });
  });

  it("keeps the old slot live and stops the new one when the health check fails", () => {
    const steps = deployTimeline(true);
    expect(steps.every((s) => s.state.live === "blue")).toBe(true);
    expect(steps.at(-1)!.id).toBe("rollback");
    expect(steps.at(-1)!.state).toMatchObject({ live: "blue", blue: "running", green: "stopped" });
  });
});

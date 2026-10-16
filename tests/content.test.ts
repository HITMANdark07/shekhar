import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { employers } from "@/content/experience";
import { currently } from "@/content/about";
import {
  formatPeriod,
  getBuilding,
  getFeatured,
  getProject,
  getProjects,
  getSelectedWork,
  projectTag,
} from "@/lib/projects";

const PHONE = /(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/;

describe("project registry", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("has exactly one featured project", () => {
    expect(projects.filter((p) => p.featured)).toHaveLength(1);
  });

  it("has unique order values", () => {
    const orders = projects.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("keeps summaries within 160 characters", () => {
    for (const p of projects) expect(p.summary.length).toBeLessThanOrEqual(160);
  });

  it("has no empty metric values or labels", () => {
    for (const p of projects)
      for (const m of p.metrics) {
        expect(m.value.trim()).not.toBe("");
        expect(m.label.trim()).not.toBe("");
      }
  });

  it("points cover and diagram paths at files in public/", () => {
    for (const p of projects) {
      for (const src of [p.cover?.src, p.diagram?.src]) {
        if (src) expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
      }
    }
  });
});

describe("registry helpers", () => {
  it("features NeatCode", () => {
    expect(getFeatured().slug).toBe("neatcode");
  });

  it("orders selected work as in the spec", () => {
    expect(getSelectedWork().map((p) => p.slug)).toEqual([
      "gpu-inference",
      "fleet",
      "genai-platform",
      "ivorie",
    ]);
  });

  it("sorts all projects by order", () => {
    expect(getProjects()[0].slug).toBe("neatcode");
    expect(getProjects()).toHaveLength(6);
  });

  it("keeps building projects out of selected work and lists them separately", () => {
    expect(getBuilding().map((p) => p.slug)).toEqual(["mcp-evals"]);
    expect(getSelectedWork().some((p) => p.status === "building")).toBe(false);
  });

  it("returns undefined for unknown slugs", () => {
    expect(getProject("does-not-exist")).toBeUndefined();
  });

  it("builds a kind · status tag", () => {
    expect(projectTag(getFeatured())).toBe("Open source · Active");
    expect(projectTag(getProject("ivorie")!)).toBe("Work · Shipped");
  });

  it("formats periods", () => {
    expect(formatPeriod({ start: "2022-08" })).toBe("Aug 2022 – present");
    expect(formatPeriod({ start: "2022-02", end: "2022-08" })).toBe("Feb 2022 – Aug 2022");
    expect(formatPeriod(undefined)).toBeUndefined();
  });
});

describe("facts", () => {
  it("lists the two résumé employers in order", () => {
    expect(employers.map((e) => e.name)).toEqual([
      "Pure Billion Technologies",
      "Invest With Tribe",
    ]);
    expect(employers[0].roles[0].title).toBe("Senior Software Engineer");
  });

  it("never contains a phone number in content/", () => {
    const dir = join(process.cwd(), "content");
    for (const f of readdirSync(dir, { recursive: true }) as string[]) {
      const path = join(dir, f);
      if (statSync(path).isFile()) expect(readFileSync(path, "utf8")).not.toMatch(PHONE);
    }
  });

  it("uses the résumé email and links", () => {
    expect(site.email).toBe("shekharkumar235838@gmail.com");
    expect(site.links.github).toBe("https://github.com/HITMANdark07");
    expect(site.links.linkedin).toBe("https://www.linkedin.com/in/shekhar-kumar1");
  });
});

describe("assets", () => {
  it("ships an optimized portrait", () => {
    const p = join(process.cwd(), "public", site.portrait.src);
    expect(existsSync(p)).toBe(true);
    expect(statSync(p).size).toBeLessThanOrEqual(60 * 1024);
  });

  it("ships the résumé at the linked path", () => {
    expect(existsSync(join(process.cwd(), "public", site.resume))).toBe(true);
  });

  it("removed the old unoptimized assets", () => {
    expect(existsSync(join(process.cwd(), "public/assets/shekhar.png"))).toBe(false);
    expect(existsSync(join(process.cwd(), "public/assets/Shekhar_Kumar_Resume.pdf"))).toBe(false);
  });
});

describe("résumé alignment (final review)", () => {
  it("frames NeatCode as résumé work, not a side project", () => {
    expect(site.bio.join(" ")).not.toMatch(/own time/i);
  });

  // Technologies the résumé ties to each project, or that its source confirms (mcp-evals:
  // public repo dependencies; Ivorie: the pb-ivy monorepo the owner provided).
  const RESUME_STACK: Record<string, string[]> = {
    neatcode: ["TypeScript", "ts-morph", "SQLite", "MCP"],
    "gpu-inference": ["ComfyUI", "GPU pods", "Queues"],
    fleet: ["RL environments", "Agent evaluation"],
    "genai-platform": ["LangChain", "MCP", "Vector databases", "RAG"],
    ivorie: ["NestJS", "Expo React Native", "Next.js", "Stripe Connect", "AWS", "Socket.IO", "Redis", "PostgreSQL", "Prisma"],
    "mcp-evals": ["TypeScript", "MCP SDK", "zod", "Commander"],
  };

  it("uses only résumé-backed technologies in project stacks", () => {
    for (const p of projects) {
      for (const tech of p.stack) expect(RESUME_STACK[p.slug]).toContain(tech);
    }
  });
});

describe("home highlights and about currently", () => {
  it("shows four résumé-backed highlights in the hero", () => {
    expect(site.highlights.map((h) => h.value)).toEqual(["4+ years", "10k+", "131k LOC", "+25%"]);
  });

  it("dates the Currently section and links each item", () => {
    expect(currently.asOf).toMatch(/^[A-Z][a-z]+ \d{4}$/);
    expect(currently.items.length).toBeGreaterThanOrEqual(3);
    for (const item of currently.items) expect(item.href).toMatch(/^(\/|https:\/\/)/);
  });
});

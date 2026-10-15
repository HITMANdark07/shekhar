import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExperienceList } from "@/components/experience-list";
import { FeaturedProject } from "@/components/featured-project";
import { MetricList } from "@/components/metric-list";
import { ProjectCard } from "@/components/project-card";
import { ProjectCover } from "@/components/project-cover";
import { projects } from "@/content/projects";
import { employers } from "@/content/experience";
import type { Project } from "@/content/types";
import { getFeatured, getProject } from "@/lib/projects";

const sparse: Project = {
  slug: "sparse",
  title: "Sparse",
  tagline: "A project with nothing optional.",
  summary: "Nothing optional.",
  kind: "side",
  status: "building",
  order: 99,
  role: "Author",
  stack: [],
  metrics: [],
};

describe("ProjectCard", () => {
  it("links to the case study", () => {
    const html = renderToStaticMarkup(<ProjectCard project={getProject("ivorie")!} />);
    expect(html).toContain('href="/projects/ivorie"');
    expect(html).toContain("Work · Shipped");
    expect(html).toContain("10k+");
  });

  it("omits metrics, stack and cover image for a sparse project", () => {
    const html = renderToStaticMarkup(<ProjectCard project={sparse} />);
    expect(html).not.toContain("<dl");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("undefined");
  });

  it("uses h3 by default and the requested heading level when given", () => {
    expect(renderToStaticMarkup(<ProjectCard project={sparse} />)).toContain("<h3");
    const html = renderToStaticMarkup(<ProjectCard project={sparse} headingLevel="h2" />);
    expect(html).toContain("<h2");
    expect(html).not.toContain("<h3");
  });

  it("renders cover art as decorative", () => {
    const html = renderToStaticMarkup(
      <ProjectCard project={{ ...sparse, cover: { src: "/projects/x/cover.webp" } }} />,
    );
    expect(html).toMatch(/<img[^>]*alt=""/);
  });
});

describe("MetricList", () => {
  it("renders nothing for no metrics", () => {
    expect(renderToStaticMarkup(<MetricList metrics={[]} />)).toBe("");
  });

  it("respects the limit", () => {
    const html = renderToStaticMarkup(<MetricList metrics={getFeatured().metrics} limit={3} />);
    expect(html.match(/<dt/g)).toHaveLength(3);
  });
});

describe("FeaturedProject", () => {
  it("shows three metrics, npm package and repo link", () => {
    const html = renderToStaticMarkup(<FeaturedProject project={getFeatured()} />);
    expect(html.match(/<dt/g)).toHaveLength(3);
    expect(html).toContain("@neatcodeai/cli");
    expect(html).toContain("https://github.com/HITMANdark07/neatcodeai");
    expect(html).toContain('role="img"');
  });
});

describe("ExperienceList", () => {
  it("compact shows the summary, full shows highlights", () => {
    const compact = renderToStaticMarkup(<ExperienceList employers={employers} variant="compact" />);
    const full = renderToStaticMarkup(<ExperienceList employers={employers} variant="full" />);
    expect(compact).toContain("Aug 2022 – present");
    expect(compact).toContain(employers[0].summary);
    expect(compact).not.toContain("<ul");
    expect(full).toContain(employers[1].highlights[0]);
  });
});

describe("ProjectCover", () => {
  it("draws a decorative motif for every project", () => {
    for (const p of projects) {
      const html = renderToStaticMarkup(<ProjectCover project={p} />);
      expect(html).toContain(`data-motif="${p.slug}"`);
      expect(html).toContain('aria-hidden="true"');
    }
  });

  it("falls back to a generic motif for unknown projects", () => {
    expect(renderToStaticMarkup(<ProjectCover project={sparse} />)).toContain('data-motif="default"');
  });
});

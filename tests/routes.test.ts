import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "@/app/projects/[slug]/page";
import { projects } from "@/content/projects";

const props = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});

describe("/projects/[slug]", () => {
  it("pre-renders exactly the registry slugs and nothing else", () => {
    expect(generateStaticParams().map((p) => p.slug).sort()).toEqual(
      projects.map((p) => p.slug).sort(),
    );
    expect(dynamicParams).toBe(false);
  });

  it("builds per-project metadata", async () => {
    const meta = await generateMetadata(props("neatcode") as never);
    expect(meta.title).toBe("NeatCode");
    expect(meta.description).toBe(projects[0].summary);
    expect(meta.alternates?.canonical).toBe("/projects/neatcode");
  });

  it("renders all metrics, links and the write-up notice", async () => {
    const html = renderToStaticMarkup(await ProjectPage(props("neatcode") as never));
    expect(html).toContain("<h1");
    expect(html).toContain("12–60×");
    expect(html).toContain("@neatcodeai/mcp");
    expect(html).toContain("Full write-up coming soon");
  });

  it("shows the confidentiality note and omits empty blocks", async () => {
    const html = renderToStaticMarkup(await ProjectPage(props("fleet") as never));
    expect(html).toContain("client details abstracted");
    expect(html).not.toContain("flex-col-reverse"); // MetricList markup absent: Fleet has no metrics
    expect(html).not.toContain("Source on GitHub");
    expect(html).not.toContain("undefined");
  });

  it("calls notFound() for unknown slugs", async () => {
    await expect(ProjectPage(props("does-not-exist") as never)).rejects.toThrow();
  });
});

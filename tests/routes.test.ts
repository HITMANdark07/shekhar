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

  it("renders the full case study: metrics, links, demo and every section", async () => {
    const html = renderToStaticMarkup(await ProjectPage(props("neatcode") as never));
    expect(html).toContain("<h1");
    expect(html).toContain("12–60×");
    expect(html).toContain("@neatcodeai/mcp");
    for (const heading of ["TL;DR", "The problem", "How it works", "Key decisions", "Outcomes", "What&#x27;s next"]) {
      expect(html).toContain(heading);
    }
    expect(html).toContain("This website, indexed by NeatCode");
    expect(html).not.toMatch(/coming soon/i);
  });

  it("links to the neighbouring case studies", async () => {
    const html = renderToStaticMarkup(await ProjectPage(props("fleet") as never));
    expect(html).toContain('href="/projects/gpu-inference"');
    expect(html).toContain('href="/projects/genai-platform"');
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

describe("Ivorie live links", () => {
  it("records the live website, App Store listing and vendor page", () => {
    const ivorie = projects.find((p) => p.slug === "ivorie")!;
    expect(ivorie.links?.website).toBe("https://planwithivorie.com/");
    expect(ivorie.links?.appStore).toBe("https://apps.apple.com/us/app/ivorie/id6748675158");
    expect(ivorie.links?.more).toContainEqual({ label: "Vendor sign-up", href: "https://planwithivorie.com/vendor" });
  });

  it("puts the live links up front on the case study", async () => {
    const html = renderToStaticMarkup(await ProjectPage(props("ivorie") as never));
    expect(html).toContain('href="https://planwithivorie.com/"');
    expect(html).toContain('href="https://apps.apple.com/us/app/ivorie/id6748675158"');
    expect(html).toContain("App Store");
    expect(html).toContain('href="https://planwithivorie.com/vendor"');
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import NotFound from "@/app/not-found";
import ProjectPage from "@/app/projects/[slug]/page";
import { ContactSection } from "@/components/contact-section";
import { ProjectCard } from "@/components/project-card";
import { getProject } from "@/lib/projects";
import { site } from "@/content/site";

const props = (slug: string) => ({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({}) });

describe("motion integration", () => {
  it("wraps project cards in the interactive tilt card with a zooming cover", () => {
    const html = renderToStaticMarkup(<ProjectCard project={getProject("fleet")!} />);
    expect(html).toContain("tilt-card");
    expect(html).toContain("cover-zoom");
  });

  it("opens case studies with the cover as a banner and a reading progress bar", async () => {
    const html = renderToStaticMarkup(await ProjectPage(props("ivorie") as never)).replaceAll("%2F", "/");
    expect(html).toContain("/projects/ivorie/cover.webp");
    expect(html).toContain("reading-progress");
  });

  it("illustrates the 404 page with the lost-packet art", () => {
    const html = decodeURIComponent(renderToStaticMarkup(<NotFound />));
    expect(html).toContain("/art/lost-packet.webp");
    expect(html).toMatch(/<img[^>]*alt=""/);
  });

  it("ends the home page with a contact section offering the email", () => {
    const html = decodeURIComponent(renderToStaticMarkup(<ContactSection />));
    expect(html).toContain(`mailto:${site.email}`);
    expect(html).toContain("/art/contact.webp");
    expect(html).toContain("Copy");
  });
});

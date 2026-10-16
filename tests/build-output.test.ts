import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "../content/projects";

const OUT = join(process.cwd(), "out");
const read = (f: string) => readFileSync(join(OUT, f), "utf8");
const hasPrefix = (dir: string, prefix: string) =>
  existsSync(join(OUT, dir)) && readdirSync(join(OUT, dir)).some((f) => f.startsWith(prefix));

const PAGES = [
  "index.html",
  "about.html",
  "projects.html",
  "terminal.html",
  "404.html",
  ...projects.map((p) => `projects/${p.slug}.html`),
];

describe("static export", () => {
  it.each(PAGES)("emits %s", (f) => {
    expect(existsSync(join(OUT, f))).toBe(true);
  });

  it.each(["sitemap.xml", "robots.txt", "resume.pdf", "about/portrait.webp", "icon.svg", "apple-icon.png", "_headers"])(
    "emits %s",
    (f) => expect(existsSync(join(OUT, f))).toBe(true),
  );

  it("emits OG images for the site and each project", () => {
    expect(hasPrefix(".", "opengraph-image") || existsSync(join(OUT, "og"))).toBe(true);
    for (const p of projects) {
      expect(hasPrefix(`projects/${p.slug}`, "opengraph-image") || existsSync(join(OUT, "og", `${p.slug}.png`))).toBe(true);
    }
  });

  it.each(PAGES)("%s has lang=en, exactly one h1, and no phone number", (f) => {
    const html = read(f);
    expect(html).toContain('<html lang="en"');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).not.toMatch(/8409209072|84092\s?09072/);
  });

  it("marks /terminal noindex and keeps it out of the sitemap", () => {
    expect(read("terminal.html")).toMatch(/<meta name="robots" content="noindex/);
    expect(read("sitemap.xml")).not.toContain("/terminal");
  });

  it("ships page-appropriate structured data, and none on utility pages", () => {
    expect(read("index.html")).toContain('"@type":"WebSite"');
    expect(read("index.html")).toContain('"@type":"Person"');
    expect(read("about.html")).toContain('"@type":"ProfilePage"');
    expect(read("projects/neatcode.html")).toContain('"@type":"BreadcrumbList"');
    expect(read("terminal.html")).not.toContain("application/ld+json");
  });

  it("serves llms.txt, a favicon.ico and a raster icon", () => {
    expect(read("llms.txt")).toContain("NeatCode");
    expect(existsSync(join(OUT, "favicon.ico"))).toBe(true);
    expect(existsSync(join(OUT, "icon.png"))).toBe(true);
  });

  it.each(["index.html", "about.html", "projects.html", "projects/fleet.html"])("%s has a social preview image", (f) => {
    expect(read(f)).toMatch(/<meta property="og:image" content="https:\/\/www\.shekharkumar\.com\//);
  });

  it("marks profile links rel=me", () => {
    expect(read("index.html")).toMatch(/href="https:\/\/github.com\/HITMANdark07"[^>]*rel="me"|rel="me"[^>]*href="https:\/\/github.com\/HITMANdark07"/);
  });

  it("has no placeholder copy on any page", () => {
    for (const f of PAGES) expect(read(f)).not.toMatch(/coming soon|lorem ipsum/i);
  });

  it("contains none of the dropped claims", () => {
    const all = PAGES.map(read).join("\n");
    for (const banned of ["99.9%", "420ms", "4 fine-tuned models", "6000+", "CLEARANCE", "no frameworks", "Januji", "januji"]) {
      expect(all).not.toContain(banned);
    }
  });
});

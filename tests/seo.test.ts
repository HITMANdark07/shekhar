import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { GET as llmsGET } from "@/app/llms.txt/route";
import { homeJsonLd, profilePageJsonLd, projectJsonLd } from "@/lib/json-ld";

describe("structured data", () => {
  const graph = (json: string) => JSON.parse(json)["@graph"] as Record<string, unknown>[];

  it("home: one WebSite and one Person, linked by @id", () => {
    const nodes = graph(homeJsonLd());
    const website = nodes.find((n) => n["@type"] === "WebSite")!;
    const person = nodes.find((n) => n["@type"] === "Person")!;
    expect(website).toMatchObject({ "@id": `${site.url}/#website`, url: site.url, name: site.name, publisher: { "@id": `${site.url}/#person` } });
    expect(person["@id"]).toBe(`${site.url}/#person`);
    expect(person.alternateName).toContain("HITMANdark07");
    expect(person.sameAs).toEqual(expect.arrayContaining([site.links.github, site.links.linkedin]));
    expect(person.knowsAbout).toEqual(expect.arrayContaining(["Backend engineering", "AI infrastructure"]));
    expect(person.image).toBe(`${site.url}${site.portrait.src}`);
  });

  it("about: a ProfilePage whose main entity is the same person", () => {
    const page = JSON.parse(profilePageJsonLd());
    expect(page["@type"]).toBe("ProfilePage");
    expect(page.mainEntity["@id"]).toBe(`${site.url}/#person`);
    expect(page.mainEntity.name).toBe(site.name);
  });

  it("case studies: an Article by the person, plus breadcrumbs", () => {
    const p = projects.find((x) => x.slug === "neatcode")!;
    const nodes = graph(projectJsonLd(p));
    const article = nodes.find((n) => n["@type"] === "Article")!;
    const crumbs = nodes.find((n) => n["@type"] === "BreadcrumbList")! as { itemListElement: { item: string }[] };
    expect(article).toMatchObject({ headline: p.title, author: { "@id": `${site.url}/#person`, name: site.name }, dateModified: p.updated });
    expect(crumbs.itemListElement.map((i) => i.item)).toEqual([site.url, `${site.url}/projects`, `${site.url}/projects/${p.slug}`]);
  });

  it("escapes < so content cannot close the script tag", () => {
    const json = homeJsonLd({ ...site, name: "</script><b>x" });
    expect(json).not.toContain("</script>");
    expect(json).toContain("\\u003c");
  });
});

describe("llms.txt", () => {
  it("summarises the person and links every page and case study", async () => {
    const res = await llmsGET();
    const text = await res.text();
    expect(res.headers.get("content-type")).toMatch(/text\/plain/);
    expect(text).toContain(`# ${site.name}`);
    expect(text).toContain("HITMANdark07");
    for (const p of projects) expect(text).toContain(`${site.url}/projects/${p.slug}`);
  });
});

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);

  it("lists home, about, projects and every case study", () => {
    expect(urls).toContain(site.url);
    expect(urls).toContain(`${site.url}/about`);
    expect(urls).toContain(`${site.url}/projects`);
    for (const p of projects) expect(urls).toContain(`${site.url}/projects/${p.slug}`);
  });

  it("dates every entry", () => {
    for (const e of sitemap()) expect(e.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("excludes /terminal", () => {
    expect(urls.some((u) => u.includes("/terminal"))).toBe(false);
  });
});

describe("robots", () => {
  it("allows crawling and points at the sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe(`${site.url}/sitemap.xml`);
    expect(r.rules).toEqual({ userAgent: "*", allow: "/" });
  });
});

describe("OG image content type", () => {
  // Static export writes OG images without an extension; hosts must be told they are PNGs.
  it("declares image/png for OG paths on Vercel", () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8"));
    const sources = config.headers.map((h: { source: string }) => h.source);
    expect(sources).toEqual(["/opengraph-image", "/projects/:slug/opengraph-image"]);
    for (const h of config.headers) {
      expect(h.headers).toContainEqual({ key: "Content-Type", value: "image/png" });
    }
  });

  it("declares image/png for OG paths on Cloudflare Pages", () => {
    const rules = readFileSync(join(process.cwd(), "public/_headers"), "utf8");
    expect(rules).toMatch(/^\/opengraph-image\n\s+Content-Type: image\/png/m);
    expect(rules).toMatch(/^\/projects\/\*\/opengraph-image\n\s+Content-Type: image\/png/m);
  });
});

describe("legacy résumé URL", () => {
  const OLD = "/assets/Shekhar_Kumar_Resume.pdf";

  it("redirects on Vercel", () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8"));
    expect(config.redirects).toContainEqual({ source: OLD, destination: site.resume, permanent: true });
  });

  it("redirects on Cloudflare Pages", () => {
    const rules = readFileSync(join(process.cwd(), "public/_redirects"), "utf8");
    expect(rules).toMatch(new RegExp(`^${OLD.replace(/\./g, "\\.")}\\s+${site.resume.replace(/\./g, "\\.")}\\s+301$`, "m"));
  });
});

describe("canonical domain", () => {
  it("uses www.shekharkumar.com as the site URL everywhere", () => {
    expect(site.url).toBe("https://www.shekharkumar.com");
    expect(robots().sitemap).toBe("https://www.shekharkumar.com/sitemap.xml");
    for (const e of sitemap()) expect(e.url.startsWith("https://www.shekharkumar.com")).toBe(true);
  });

  it("permanently redirects the old vercel.app host to the custom domain", () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), "vercel.json"), "utf8"));
    expect(config.redirects).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "shekhar-fawn.vercel.app" }],
      destination: "https://www.shekharkumar.com/:path*",
      permanent: true,
    });
  });
});

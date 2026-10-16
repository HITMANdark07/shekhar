import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { personJsonLd } from "@/lib/json-ld";

describe("personJsonLd", () => {
  it("describes the person with sameAs links", () => {
    const data = JSON.parse(personJsonLd());
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe(site.name);
    expect(data.jobTitle).toBe(site.role);
    expect(data.sameAs).toEqual([site.links.github, site.links.linkedin]);
  });

  it("escapes < so content cannot close the script tag", () => {
    const json = personJsonLd({ ...site, name: "</script><b>x" });
    expect(json).not.toContain("</script>");
    expect(json).toContain("\\u003c");
    expect(JSON.parse(json).name).toBe("</script><b>x");
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

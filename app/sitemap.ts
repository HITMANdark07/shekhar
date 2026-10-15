import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/about", "/projects", ...getProjects().map((p) => `/projects/${p.slug}`)];
  return paths.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}

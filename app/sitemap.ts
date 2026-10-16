import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/projects"].map((path) => ({ url: `${site.url}${path}`, lastModified: site.updated }));
  const studies = getProjects().map((p) => ({ url: `${site.url}/projects/${p.slug}`, lastModified: p.updated ?? site.updated }));
  return [...pages, ...studies];
}

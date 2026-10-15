import { site } from "@/content/site";
import { getProject, getProjects, projectTag } from "@/lib/projects";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const dynamic = "force-static";
export const alt = "Project overview";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  return renderOgImage({
    eyebrow: project ? projectTag(project) : site.role,
    title: project?.title ?? site.name,
    footer: project ? `${project.tagline}  ·  ${site.name}` : site.name,
  });
}

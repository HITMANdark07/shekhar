import Link from "next/link";
import type { Project } from "@/content/types";
import { projectTag } from "@/lib/projects";
import { Badge } from "./badge";
import { MetricList } from "./metric-list";
import { Morph } from "./morph";
import { ProjectCover } from "./project-cover";
import { TiltCard } from "./tilt-card";

export function ProjectCard({
  project,
  headingLevel: Heading = "h3",
}: {
  project: Project;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <TiltCard>
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors duration-150 hover:border-accent">
      <div className="overflow-hidden">
        <Morph name={`cover-${project.slug}`}>
          <div className="cover-zoom">
            <ProjectCover project={project} className="h-36" />
          </div>
        </Morph>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Badge>{projectTag(project)}</Badge>
        <Heading className="mt-1 font-serif text-2xl">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-1 text-fg-muted">{project.tagline}</p>
        <MetricList metrics={project.metrics} limit={3} />
        {project.stack.length > 0 && (
          <p className="mt-auto pt-4 font-mono text-[0.8125rem] text-fg-meta">
            {project.stack.join(" · ")}
          </p>
        )}
      </div>
    </article>
    </TiltCard>
  );
}

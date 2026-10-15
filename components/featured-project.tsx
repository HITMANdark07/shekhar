import Link from "next/link";
import type { Project } from "@/content/types";
import { projectTag } from "@/lib/projects";
import { Badge } from "./badge";
import { NeatCodeGraph } from "./demos/neatcode-graph";
import { MetricList } from "./metric-list";

export function FeaturedProject({ project }: { project: Project }) {
  const npm = project.links?.npm?.[0];
  return (
    <article className="grid overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-[1fr_1.15fr]">
      <div className="p-6 sm:p-8">
        <Badge>
          {projectTag(project)}
          {npm && ` · ${npm}`}
        </Badge>
        <h3 className="mt-2 font-serif text-4xl">{project.title}</h3>
        <p className="mt-2 text-fg-muted">{project.summary}</p>
        <MetricList metrics={project.metrics} limit={3} />
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href={`/projects/${project.slug}`} className="font-medium text-accent hover:underline">
            Case study <span aria-hidden="true">→</span>
          </Link>
          {project.links?.repo && (
            <a href={project.links.repo} className="text-fg-muted hover:text-fg">GitHub</a>
          )}
          {npm && (
            <a href={`https://www.npmjs.com/package/${npm}`} className="text-fg-muted hover:text-fg">npm</a>
          )}
        </p>
      </div>
      <figure className="flex flex-col gap-2 border-t border-border bg-bg p-5 md:border-l md:border-t-0">
        <NeatCodeGraph variant="compact" />
        <figcaption className="font-mono text-[0.8125rem] text-fg-meta">
          This website, indexed by NeatCode — real graph, not a mock-up.
        </figcaption>
      </figure>
    </article>
  );
}

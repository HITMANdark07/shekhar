import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { MetricList } from "@/components/metric-list";
import { formatPeriod, getProject, getProjects, projectTag } from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, url: `/projects/${project.slug}` },
  };
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const period = formatPeriod(project.period);
  const facts: [string, string][] = [
    ["Role", project.role],
    ...(project.org ? ([["Organisation", project.org]] as [string, string][]) : []),
    ...(period ? ([["Period", period]] as [string, string][]) : []),
  ];

  return (
    <article className="max-w-3xl">
      <p className="text-sm">
        <Link href="/projects" className="text-fg-muted hover:text-fg">
          <span aria-hidden="true">← </span>All projects
        </Link>
      </p>
      <header className="mt-6">
        <Badge>{projectTag(project)}</Badge>
        <h1 className="mt-2 font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">{project.title}</h1>
        <p className="mt-4 text-lg text-fg-muted">{project.tagline}</p>
      </header>

      <dl className="mt-8 grid gap-4 border-y border-border py-5 sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[0.8125rem] text-fg-meta">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <MetricList metrics={project.metrics} />

      {project.stack.length > 0 && (
        <section aria-labelledby="stack-title" className="mt-10">
          <h2 id="stack-title" className="font-serif text-2xl">Stack</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li key={s} className="rounded-md border border-border px-2.5 py-1 font-mono text-[0.8125rem]">{s}</li>
            ))}
          </ul>
        </section>
      )}

      {project.links && (
        <section aria-labelledby="links-title" className="mt-10">
          <h2 id="links-title" className="font-serif text-2xl">Links</h2>
          <ul className="mt-3 space-y-1">
            {project.links.repo && (
              <li><a href={project.links.repo} className="text-accent hover:underline">Source on GitHub</a></li>
            )}
            {project.links.npm?.map((pkg) => (
              <li key={pkg}>
                <a href={`https://www.npmjs.com/package/${pkg}`} className="font-mono text-accent hover:underline">{pkg}</a>
              </li>
            ))}
            {project.links.demo && (
              <li><a href={project.links.demo} className="text-accent hover:underline">Live demo</a></li>
            )}
            {project.links.docs && (
              <li><a href={project.links.docs} className="text-accent hover:underline">Documentation</a></li>
            )}
          </ul>
        </section>
      )}

      {project.confidential && (
        <p className="mt-10 text-sm text-fg-meta">
          Built at {project.org ?? "work"}; client details abstracted.
        </p>
      )}

      <aside className="mt-10 rounded-xl border border-border bg-surface p-5">
        <p className="font-medium">Full write-up coming soon</p>
        <p className="mt-1 text-fg-muted">
          The case study covering architecture, trade-offs and results is in progress.
        </p>
      </aside>
    </article>
  );
}

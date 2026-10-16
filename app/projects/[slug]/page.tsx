import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { buttonClass } from "@/components/button-styles";
import { ProjectDemo } from "@/components/demos/project-demo";
import { Morph } from "@/components/morph";
import { ProjectCover } from "@/components/project-cover";
import { MetricList } from "@/components/metric-list";
import { caseStudies } from "@/content/case-studies";
import { JsonLd, projectJsonLd } from "@/lib/json-ld";
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

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-serif text-3xl">
      {children}
    </h2>
  );
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = getProject(slug);
  const cs = caseStudies[slug];
  if (!project || !cs) notFound();

  const all = getProjects();
  const at = all.findIndex((p) => p.slug === slug);
  const prev = all[at - 1];
  const next = all[at + 1];

  const period = formatPeriod(project.period);
  const facts: [string, string][] = [
    ["Role", project.role],
    ...(project.org ? ([["Organisation", project.org]] as [string, string][]) : []),
    ...(period ? ([["Period", period]] as [string, string][]) : []),
  ];
  const updated = project.updated
    ? new Date(`${project.updated}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;

  return (
    <article>
      <JsonLd json={projectJsonLd(project)} />
      <div className="reading-progress" aria-hidden="true" />
      <p className="text-sm">
        <Link href="/projects" className="text-fg-muted hover:text-fg">
          <span aria-hidden="true">← </span>All projects
        </Link>
      </p>

      <header className="mt-6 max-w-3xl">
        <Badge>{projectTag(project)}</Badge>
        <h1 className="mt-2 text-balance font-serif text-[clamp(2.5rem,6vw,4rem)] leading-[1.02]">{project.title}</h1>
        <p className="mt-4 text-lg text-fg-muted">{project.tagline}</p>
        {(project.links?.website || project.links?.appStore) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {project.links.website && (
              <a href={project.links.website} className={buttonClass("primary")}>
                Visit {new URL(project.links.website).hostname.replace(/^www\./, "")} <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.links.appStore && (
              <a href={project.links.appStore} className={buttonClass("secondary")}>
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                  <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.27-.87-2.29-3.52ZM14.2 6.12c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.21Z" />
                </svg>
                Download on the App Store <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        )}
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <Morph name={`cover-${project.slug}`}>
          <ProjectCover project={project} className="aspect-[16/5] h-auto" preload />
        </Morph>
      </div>

      <dl className="mt-8 grid max-w-3xl gap-4 border-y border-border py-5 sm:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[0.8125rem] text-fg-meta">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        {updated && (
          <div>
            <dt className="text-[0.8125rem] text-fg-meta">Updated</dt>
            <dd>
              <time dateTime={project.updated}>{updated}</time>
            </dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="tldr" className="mt-10 max-w-3xl">
        <h2 id="tldr" className="font-mono text-[0.8125rem] uppercase tracking-wider text-accent">
          TL;DR
        </h2>
        <ol className="mt-3 space-y-3">
          {cs.tldr.map((line, i) => (
            <li key={line} className="flex gap-4 text-lg">
              <span aria-hidden="true" className="font-mono text-sm leading-7 text-accent">
                0{i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
        <MetricList metrics={project.metrics} />
      </section>

      <section aria-label="Interactive model" className="mt-12">
        <ProjectDemo demo={cs.demo} />
      </section>

      <div className="mt-16 max-w-3xl space-y-16">
        <section aria-labelledby="problem">
          <SectionHeading id="problem">The problem</SectionHeading>
          <div className="mt-4 space-y-4 text-fg-muted">
            {cs.context.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="mt-6 border-l-2 border-accent pl-4">
            <span className="font-mono text-[0.8125rem] uppercase tracking-wider text-fg-meta">My role · </span>
            {cs.role}
          </p>
        </section>

        <section aria-labelledby="how">
          <SectionHeading id="how">How it works</SectionHeading>
          <ol className="mt-6">
            {cs.how.map((step, i) => (
              <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
                {i < cs.how.length - 1 && (
                  <span aria-hidden="true" className="absolute left-[0.9375rem] top-9 bottom-1 w-px bg-border" />
                )}
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-accent font-mono text-[0.8125rem] text-accent"
                >
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="mt-1 text-fg-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="decisions">
          <SectionHeading id="decisions">Key decisions</SectionHeading>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {cs.decisions.map((d) => (
              <li key={d.decision} className="rounded-xl border border-border bg-surface p-5">
                <h3 className="font-medium">{d.decision}</h3>
                <p className="mt-1 font-mono text-[0.8125rem] text-fg-meta">instead of: {d.alternative}</p>
                <p className="mt-3 text-fg-muted">{d.why}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="outcomes">
          <SectionHeading id="outcomes">Outcomes</SectionHeading>
          <ul className="mt-4 space-y-2">
            {cs.outcomes.map((o) => (
              <li key={o} className="flex gap-3">
                <span aria-hidden="true" className="text-accent">✓</span>
                <span className="text-fg-muted">{o}</span>
              </li>
            ))}
          </ul>
        </section>

        {cs.next && (
          <section aria-labelledby="next">
            <SectionHeading id="next">What&apos;s next</SectionHeading>
            <ul className="mt-4 space-y-2">
              {cs.next.map((n) => (
                <li key={n} className="flex gap-3">
                  <span aria-hidden="true" className="text-accent">→</span>
                  <span className="text-fg-muted">{n}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="stack-links" className="grid gap-8 sm:grid-cols-2">
          <h2 id="stack-links" className="sr-only">Stack and links</h2>
          {project.stack.length > 0 && (
            <div>
              <h3 className="font-mono text-[0.8125rem] uppercase tracking-wider text-fg-meta">Stack</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <li key={s} className="rounded-md border border-border px-2.5 py-1 font-mono text-[0.8125rem]">{s}</li>
                ))}
              </ul>
            </div>
          )}
          {project.links && (
            <div>
              <h3 className="font-mono text-[0.8125rem] uppercase tracking-wider text-fg-meta">Links</h3>
              <ul className="mt-3 space-y-1">
                {project.links.website && (
                  <li><a href={project.links.website} className="text-accent hover:underline">Website · {new URL(project.links.website).hostname}</a></li>
                )}
                {project.links.appStore && (
                  <li><a href={project.links.appStore} className="text-accent hover:underline">iOS app · App Store</a></li>
                )}
                {project.links.more?.map((l) => (
                  <li key={l.href}><a href={l.href} className="text-accent hover:underline">{l.label}</a></li>
                ))}
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
            </div>
          )}
        </section>

        {project.confidential && (
          <p className="text-sm text-fg-meta">Built at {project.org ?? "work"}; client details abstracted.</p>
        )}
      </div>

      <nav aria-label="More case studies" className="mt-16 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
        {prev ? (
          <Link href={`/projects/${prev.slug}`} className="group rounded-xl border border-border p-4 transition-colors duration-150 hover:border-accent">
            <span className="font-mono text-[0.8125rem] text-fg-meta">← Previous</span>
            <span className="mt-1 block font-serif text-2xl group-hover:text-accent">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/projects/${next.slug}`} className="group rounded-xl border border-border p-4 text-right transition-colors duration-150 hover:border-accent">
            <span className="font-mono text-[0.8125rem] text-fg-meta">Next →</span>
            <span className="mt-1 block font-serif text-2xl group-hover:text-accent">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}

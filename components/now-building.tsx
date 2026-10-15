import Link from "next/link";
import type { Project } from "@/content/types";
import { Badge } from "./badge";
import { ProjectCover } from "./project-cover";

export function NowBuilding({ projects }: { projects: Project[] }) {
  return (
    <ul className="space-y-4">
      {projects.map((p) => (
        <li key={p.slug}>
          <article className="relative grid overflow-hidden rounded-xl border border-dashed border-accent bg-surface transition-colors duration-150 hover:border-solid sm:grid-cols-[1fr_16rem]">
            <div className="p-5 sm:p-6">
              <Badge>
                <span className="mr-1.5 inline-block size-2 animate-pulse rounded-full bg-accent align-middle motion-reduce:animate-none" aria-hidden="true" />
                Now building · open source
              </Badge>
              <h3 className="mt-2 font-serif text-3xl">
                <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-1 max-w-[60ch] text-fg-muted">{p.tagline}</p>
              <p className="mt-4 font-mono text-[0.8125rem] text-accent">
                Design, milestones and a demo of the eval matrix <span aria-hidden="true">→</span>
              </p>
            </div>
            <ProjectCover project={p} className="hidden h-full sm:block sm:border-b-0 sm:border-l" />
          </article>
        </li>
      ))}
    </ul>
  );
}

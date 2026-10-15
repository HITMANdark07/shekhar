import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open-source and professional projects across backend and AI infrastructure.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">Projects</h1>
      <p className="mt-4 max-w-[60ch] text-lg text-fg-muted">
        Open-source work and systems I&apos;ve built professionally, newest focus first.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {getProjects().map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </>
  );
}

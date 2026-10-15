import Image from "next/image";
import type { Project } from "@/content/types";

export function ProjectCover({ project, className = "" }: { project: Project; className?: string }) {
  if (project.cover) {
    return (
      <Image
        src={project.cover.src}
        alt=""
        width={1200}
        height={630}
        className={`w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`w-full bg-[linear-gradient(120deg,var(--accent),var(--border))] opacity-80 ${className}`}
    />
  );
}

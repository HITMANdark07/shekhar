import { projects } from "@/content/projects";
import type { Period, Project, ProjectKind, ProjectStatus } from "@/content/types";

const KIND_LABEL: Record<ProjectKind, string> = {
  "open-source": "Open source",
  work: "Work",
  side: "Side project",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  active: "Active",
  building: "Building",
  archived: "Archived",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getProjects(): Project[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeatured(): Project {
  const featured = projects.find((p) => p.featured);
  if (!featured) throw new Error("content/projects.ts must mark one project as featured");
  return featured;
}

/** Shipped and active work for the home grid: not featured, not still being built. */
export function getSelectedWork(): Project[] {
  return getProjects().filter((p) => !p.featured && p.status !== "building");
}

export function getBuilding(): Project[] {
  return getProjects().filter((p) => p.status === "building");
}

export function projectTag(project: Project): string {
  return `${KIND_LABEL[project.kind]} · ${STATUS_LABEL[project.status]}`;
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatPeriod(period?: Period): string | undefined {
  if (!period) return undefined;
  return `${formatMonth(period.start)} – ${period.end ? formatMonth(period.end) : "present"}`;
}

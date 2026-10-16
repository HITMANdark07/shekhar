import { site } from "@/content/site";
import { getProjects } from "@/lib/projects";

export type CommandAction = "copy-email" | "theme";

export interface Command {
  id: string;
  label: string;
  group: "Pages" | "Projects" | "Actions" | "Elsewhere";
  hint?: string;
  href?: string;
  external?: boolean;
  action?: CommandAction;
  keywords?: string;
}

export function buildCommands(): Command[] {
  return [
    { id: "page:/", label: "Home", group: "Pages", href: "/", keywords: "start index" },
    { id: "page:/projects", label: "All projects", group: "Pages", href: "/projects", keywords: "work case studies" },
    { id: "page:/about", label: "About", group: "Pages", href: "/about", keywords: "bio experience skills" },
    { id: "page:/terminal", label: "Terminal", group: "Pages", href: "/terminal", keywords: "shell cli easter egg" },
    ...getProjects().map(
      (p): Command => ({
        id: `project:${p.slug}`,
        label: p.title,
        group: "Projects",
        hint: p.status === "building" ? "building" : p.kind === "open-source" ? "open source" : "case study",
        href: `/projects/${p.slug}`,
        keywords: `${p.tagline} ${p.stack.join(" ")}`,
      }),
    ),
    { id: "action:copy-email", label: "Copy email address", group: "Actions", hint: site.email, action: "copy-email", keywords: "contact mail" },
    { id: "action:theme", label: "Toggle light / dark theme", group: "Actions", action: "theme", keywords: "dark mode colour" },
    { id: "link:resume", label: "Open résumé (PDF)", group: "Elsewhere", href: site.resume, external: true, keywords: "cv resume" },
    { id: "link:github", label: "GitHub", group: "Elsewhere", href: site.links.github, external: true, keywords: "code repos" },
    { id: "link:linkedin", label: "LinkedIn", group: "Elsewhere", href: site.links.linkedin, external: true, keywords: "profile" },
  ];
}

function isSubsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i === needle.length;
}

/** Every query token must appear (as a subsequence) in the label or keywords; prefix matches rank first. */
export function filterCommands(commands: Command[], query: string): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  const tokens = q.split(/\s+/);
  return commands
    .map((c, i) => {
      const label = c.label.toLowerCase();
      const hay = `${label} ${(c.keywords ?? "").toLowerCase()}`;
      if (!tokens.every((t) => isSubsequence(t, hay))) return null;
      const score = label.startsWith(q) ? 0 : label.includes(q) ? 1 : hay.includes(q) ? 2 : 3;
      return { c, score, i };
    })
    .filter((x): x is { c: Command; score: number; i: number } => x !== null)
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .map((x) => x.c);
}

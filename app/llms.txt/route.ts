import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-static";

/** llms.txt (llmstxt.org): a plain-text map of who this is and where the details live. */
export function GET() {
  const projects = getProjects()
    .map((p) => `- [${p.title}](${site.url}/projects/${p.slug}): ${p.summary}`)
    .join("\n");
  const facts = getProjects()
    .flatMap((p) => caseStudies[p.slug]?.tldr.slice(0, 1).map((t) => `- ${p.title}: ${t}`) ?? [])
    .join("\n");
  const body = `# ${site.name}

> ${site.description}

${site.name} (GitHub: ${site.handles.join(", ")}) is a ${site.role.toLowerCase()} based in ${site.location.city}, India, working on ${site.focus.toLowerCase()} at ${site.employer}. Contact: ${site.email}.

## Pages

- [Home](${site.url}): overview, featured work and experience
- [About](${site.url}/about): bio, experience, skills and what he is working on now
- [Projects](${site.url}/projects): all case studies
- [Résumé (PDF)](${site.url}${site.resume})

## Case studies

${projects}

## Key facts

${facts}

## Elsewhere

- GitHub: ${site.links.github}
- LinkedIn: ${site.links.linkedin}
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

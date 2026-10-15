import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/button-styles";
import { ExperienceList } from "@/components/experience-list";
import { FeaturedProject } from "@/components/featured-project";
import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import { employers } from "@/content/experience";
import { site } from "@/content/site";
import { getFeatured, getSelectedWork } from "@/lib/projects";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  const featured = getFeatured();
  const work = getSelectedWork();

  return (
    <>
      <section aria-labelledby="intro-title" className="max-w-3xl">
        <p className="font-mono text-[0.8125rem] uppercase tracking-wider text-accent">
          {site.role} · {site.focus} · {site.location.city}
        </p>
        <h1 id="intro-title" className="mt-4 text-balance font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">
          {site.headline}
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg text-fg-muted">{site.subheadline}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={`/projects/${featured.slug}`} className={buttonClass("primary")}>
            {featured.title} case study <span aria-hidden="true">→</span>
          </Link>
          <a href={site.resume} className={buttonClass("secondary")}>Résumé</a>
          <a href={`mailto:${site.email}`} className={buttonClass("secondary")}>Email</a>
        </div>
      </section>

      <Section id="featured" title="Featured">
        <FeaturedProject project={featured} />
      </Section>

      <Section
        id="work"
        title="Selected work"
        action={<Link href="/projects" className="text-sm text-accent hover:underline">All projects →</Link>}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {work.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Section>

      <Section
        id="experience"
        title="Experience"
        action={<a href={site.resume} className="text-sm text-accent hover:underline">Full résumé ↗</a>}
      >
        <ExperienceList employers={employers} variant="compact" />
      </Section>
    </>
  );
}

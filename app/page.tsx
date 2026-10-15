import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/button-styles";
import { ExperienceList } from "@/components/experience-list";
import { FeaturedProject } from "@/components/featured-project";
import { NowBuilding } from "@/components/now-building";
import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import { employers } from "@/content/experience";
import { site } from "@/content/site";
import { getBuilding, getFeatured, getSelectedWork } from "@/lib/projects";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  const featured = getFeatured();
  const work = getSelectedWork();
  const building = getBuilding();

  return (
    <>
      <section aria-labelledby="intro-title">
        <p className="font-mono text-[0.8125rem] uppercase tracking-wider text-accent">
          {site.role} · {site.focus} · {site.location.city}
        </p>
        <h1 id="intro-title" className="mt-4 max-w-3xl text-balance font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">
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
        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-4">
          {site.highlights.map((h) => (
            <div key={h.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-[0.8125rem] text-fg-meta">{h.label}</dt>
              <dd className="font-serif text-3xl">{h.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Section id="featured" title="Featured">
        <FeaturedProject project={featured} />
      </Section>

      {building.length > 0 && (
        <Section id="building" title="Now building">
          <NowBuilding projects={building} />
        </Section>
      )}

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

import type { Metadata } from "next";
import Image from "next/image";
import { ExperienceList } from "@/components/experience-list";
import { Section } from "@/components/section";
import Link from "next/link";
import { achievements, currently, education, skills } from "@/content/about";
import { employers } from "@/content/experience";
import { site } from "@/content/site";
import { JsonLd, profilePageJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Shekhar Kumar (HITMANdark07): senior software engineer in Bengaluru building backend and AI infrastructure. Experience, skills, and current work.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Shekhar Kumar",
    description: "Senior software engineer in Bengaluru building backend and AI infrastructure. Experience, skills and current work.",
    url: "/about",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shekhar Kumar — Senior Software Engineer" }],
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd json={profilePageJsonLd()} />
      <div className="grid gap-10 md:grid-cols-[1fr_220px] md:items-start">
        <div className="max-w-3xl">
          <h1 className="font-serif text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.05]">About</h1>
          <div className="mt-6 space-y-4 text-lg text-fg-muted">
            {site.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <Image
          src={site.portrait.src}
          alt={site.portrait.alt}
          width={site.portrait.width}
          height={site.portrait.height}
          className="w-44 rounded-xl border border-border md:w-full"
        />
      </div>

      <Section id="at-a-glance" title="At a glance">
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {[
            ["Name", site.name],
            ["Also known as", `${site.handles.join(", ")} on GitHub`],
            ["Role", `${site.role} at ${site.employer}`],
            ["Focus", `${site.focus}: distributed systems, LLM platforms, GPU inference, agent evaluation`],
            ["Based in", `${site.location.city}, India · works remotely`],
            ["Open source", "NeatCode (@neatcodeai/cli on npm) and mcp-evals"],
            ["Experience", "4+ years shipping production systems in TypeScript, Go, Python and PostgreSQL"],
            ["Contact", site.email],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[0.8125rem] uppercase tracking-wider text-fg-meta">{k}</dt>
              <dd className="mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="currently" title="Currently">
        <p className="-mt-3 mb-4 font-mono text-[0.8125rem] text-fg-meta">as of {currently.asOf}</p>
        <ul className="space-y-3">
          {currently.items.map((item) => (
            <li key={item.label} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
              <p className="text-fg-muted">
                <Link href={item.href} className="font-medium text-fg underline decoration-border underline-offset-4 hover:decoration-accent">
                  {item.label}
                </Link>
                {" — "}
                {item.detail}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="experience" title="Experience">
        <ExperienceList employers={employers} variant="full" />
      </Section>

      <Section id="skills" title="Skills">
        <dl className="grid gap-5 sm:grid-cols-2">
          {skills.map((g) => (
            <div key={g.name}>
              <dt className="font-mono text-[0.8125rem] uppercase tracking-wider text-accent">{g.name}</dt>
              <dd className="mt-1 text-fg-muted">{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="achievements" title="Recognition">
        <ul className="list-disc space-y-2 pl-5 text-fg-muted">
          {achievements.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>

      <Section id="education" title="Education">
        <p>
          <span className="font-semibold">{education.degree}</span>, {education.school}
        </p>
        <p className="font-mono text-[0.8125rem] text-fg-meta">
          {education.years} · {education.location}
        </p>
      </Section>
    </>
  );
}

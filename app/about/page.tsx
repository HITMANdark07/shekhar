import type { Metadata } from "next";
import Image from "next/image";
import { ExperienceList } from "@/components/experience-list";
import { Section } from "@/components/section";
import Link from "next/link";
import { achievements, currently, education, skills } from "@/content/about";
import { employers } from "@/content/experience";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
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

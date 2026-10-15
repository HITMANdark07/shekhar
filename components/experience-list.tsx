import type { Employer } from "@/content/types";
import { formatPeriod } from "@/lib/projects";

export function ExperienceList({
  employers,
  variant,
}: {
  employers: Employer[];
  variant: "compact" | "full";
}) {
  return (
    <ol className="space-y-8">
      {employers.map((e) => (
        <li key={e.name} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-6">
          <p className="pt-0.5 font-mono text-[0.8125rem] text-fg-meta">{formatPeriod(e.period)}</p>
          <div>
            <h3>
              <span className="font-semibold">{e.roles[0].title}</span>, {e.name}
            </h3>
            <p className="text-[0.8125rem] text-fg-meta">{e.location}</p>
            {variant === "compact" ? (
              <p className="mt-1 text-fg-muted">{e.summary}</p>
            ) : (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-fg-muted">
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

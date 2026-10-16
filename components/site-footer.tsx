import Link from "next/link";
import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-fg-muted sm:px-6">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-fg">{site.email}</a>
          </li>
          <li>
            <a href={site.links.github} rel="me" className="hover:text-fg">GitHub</a>
          </li>
          <li>
            <a href={site.links.linkedin} rel="me" className="hover:text-fg">LinkedIn</a>
          </li>
        </ul>
        <p className="font-mono text-[0.8125rem] text-fg-meta">
          Prefer a shell? <Link href="/terminal" className="text-accent underline">/terminal</Link>
        </p>
      </div>
    </footer>
  );
}

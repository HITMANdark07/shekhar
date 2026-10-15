import Link from "next/link";
import { site } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="whitespace-nowrap font-semibold">
          {site.name}
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-2.5 whitespace-nowrap text-sm text-fg-muted sm:gap-6">
            <li>
              <Link href="/projects" className="hover:text-fg">Work</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-fg">About</Link>
            </li>
            <li>
              <a href={site.resume} className="hover:text-fg">
                Résumé<span aria-hidden="true"> ↗</span>
              </a>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

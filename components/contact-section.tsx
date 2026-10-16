import Image from "next/image";
import { site } from "@/content/site";
import { buttonClass } from "./button-styles";
import { CopyEmailButton } from "./copy-email-button";

export function ContactSection() {
  return (
    <section aria-labelledby="contact-title" className="reveal mt-24 overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid items-center gap-6 p-6 sm:p-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-mono text-[0.8125rem] uppercase tracking-wider text-accent">Contact</p>
          <h2 id="contact-title" className="mt-2 text-balance font-serif text-4xl leading-tight">
            Building something that has to work in production?
          </h2>
          <p className="mt-3 max-w-[48ch] text-fg-muted">
            I&apos;m happy to talk about backend and AI infrastructure roles, or a hard systems problem you&apos;re stuck on.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${site.email}`} className={buttonClass("primary")}>
              Email me <span aria-hidden="true">→</span>
            </a>
            <CopyEmailButton email={site.email} />
            <a href={site.links.linkedin} className={buttonClass("secondary")}>LinkedIn</a>
          </div>
        </div>
        <Image src="/art/contact.webp" alt="" width={1200} height={675} className="cover-art float-gently w-full rounded-xl" />
      </div>
    </section>
  );
}

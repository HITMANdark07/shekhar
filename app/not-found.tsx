import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr]">
      <div>
      <p className="font-mono text-[0.8125rem] uppercase tracking-wider text-accent">404</p>
      <h1 id="nf-title" className="mt-3 font-serif text-5xl">Page not found</h1>
      <p className="mt-4 text-fg-muted">This packet took a wrong turn somewhere. The page doesn&apos;t exist, or it moved.</p>
      <p className="mt-6 flex gap-5">
        <Link href="/" className="text-accent hover:underline">Home</Link>
        <Link href="/projects" className="text-accent hover:underline">Projects</Link>
      </p>
      <p className="mt-6 font-mono text-[0.8125rem] text-fg-meta">Tip: press ⌘K to jump anywhere.</p>
      </div>
      <Image src="/art/lost-packet.webp" alt="" width={1200} height={675} className="cover-art float-gently w-full" priority={false} />
    </section>
  );
}

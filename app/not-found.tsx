import Link from "next/link";

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="max-w-xl">
      <p className="font-mono text-[0.8125rem] uppercase tracking-wider text-accent">404</p>
      <h1 id="nf-title" className="mt-3 font-serif text-5xl">Page not found</h1>
      <p className="mt-4 text-fg-muted">That page doesn&apos;t exist, or it moved.</p>
      <p className="mt-6 flex gap-5">
        <Link href="/" className="text-accent hover:underline">Home</Link>
        <Link href="/projects" className="text-accent hover:underline">Projects</Link>
      </p>
    </section>
  );
}

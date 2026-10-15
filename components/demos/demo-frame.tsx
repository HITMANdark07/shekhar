export type DemoSource = "real" | "illustrative" | "synthetic" | "sample";

const SOURCE_LABEL: Record<DemoSource, string> = {
  real: "Real data",
  illustrative: "Illustrative",
  synthetic: "Synthetic example",
  sample: "Sample data",
};

/** Frame for every interactive model: title, an honesty label, the demo, and a caption. */
export function DemoFrame({
  title,
  source,
  caption,
  children,
}: {
  title: string;
  source: DemoSource;
  caption: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <p className="font-mono text-[0.8125rem] uppercase tracking-wider text-fg-muted">{title}</p>
        <p className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.75rem] text-fg-meta">
          {SOURCE_LABEL[source]}
        </p>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      <figcaption className="border-t border-border px-4 py-3 text-sm text-fg-muted">{caption}</figcaption>
    </figure>
  );
}

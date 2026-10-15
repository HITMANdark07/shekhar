export function Section({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="mt-20">
      <div className="mb-6 flex items-baseline justify-between gap-4 border-t border-border pt-4">
        <h2 id={`${id}-title`} className="font-serif text-3xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

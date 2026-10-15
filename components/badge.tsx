export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[0.8125rem] uppercase tracking-wider text-accent">
      {children}
    </span>
  );
}

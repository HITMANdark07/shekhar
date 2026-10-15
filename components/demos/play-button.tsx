export function PlayButton({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 font-mono text-[0.8125rem] transition-colors duration-150 hover:border-accent"
    >
      <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
      {playing ? "Pause" : "Play"}
    </button>
  );
}

export function ControlButton({
  children,
  onClick,
  pressed,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      disabled={disabled}
      className="rounded-md border border-border px-3 py-1.5 font-mono text-[0.8125rem] text-fg-muted transition-colors duration-150 hover:border-accent hover:text-fg disabled:opacity-40 aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-fg"
    >
      {children}
    </button>
  );
}

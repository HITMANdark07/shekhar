const BASE =
  "inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150";

export function buttonClass(variant: "primary" | "secondary"): string {
  return variant === "primary"
    ? `${BASE} bg-accent text-accent-fg hover:opacity-90`
    : `${BASE} border border-border text-fg hover:border-accent`;
}

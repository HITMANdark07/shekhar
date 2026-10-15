/** Static code-graph illustration. Part 3 replaces it with the live NeatCode demo. */
export function GraphPoster() {
  return (
    <svg
      viewBox="0 0 220 140"
      role="img"
      aria-label="Illustration of a code graph: one symbol linked to four related files"
      className="h-auto w-4/5"
    >
      <g stroke="var(--fg-meta)" strokeWidth="1.2">
        <line x1="40" y1="30" x2="110" y2="70" />
        <line x1="110" y1="70" x2="180" y2="35" />
        <line x1="110" y1="70" x2="70" y2="115" />
        <line x1="110" y1="70" x2="160" y2="110" />
        <line x1="40" y1="30" x2="70" y2="115" />
        <line x1="180" y1="35" x2="160" y2="110" />
      </g>
      <circle cx="110" cy="70" r="8" fill="var(--accent)" />
      <g fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.5">
        <circle cx="40" cy="30" r="5" />
        <circle cx="180" cy="35" r="5" />
        <circle cx="70" cy="115" r="5" />
        <circle cx="160" cy="110" r="5" />
      </g>
    </svg>
  );
}

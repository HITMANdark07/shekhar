import Image from "next/image";
import type { Project } from "@/content/types";

const INK = "var(--fg-meta)";
const ACCENT = "var(--accent)";

/** Small seeded PRNG so each motif is stable across renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function GraphMotif() {
  const r = rng(7);
  const nodes = Array.from({ length: 14 }, () => [150 + r() * 230, 14 + r() * 84] as const);
  return (
    <>
      {nodes.slice(1).map(([x, y], i) => {
        const [tx, ty] = nodes[Math.floor(r() * (i + 1))];
        return <line key={i} x1={x} y1={y} x2={tx} y2={ty} stroke={INK} strokeWidth={0.8} />;
      })}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 6 : 3.2} fill={i === 0 ? ACCENT : "var(--bg)"} stroke={i === 0 ? ACCENT : INK} strokeWidth={1.2} />
      ))}
    </>
  );
}

function LanesMotif() {
  return (
    <>
      {[0, 1, 2, 3].map((lane) => (
        <g key={lane} transform={`translate(0 ${18 + lane * 22})`}>
          {Array.from({ length: 6 - lane }, (_, i) => (
            <rect key={i} x={150 + i * 22 + lane * 8} y={0} width={14} height={12} rx={2} fill={i === 0 && lane === 1 ? ACCENT : "none"} stroke={INK} strokeWidth={1} />
          ))}
          <rect x={330} y={-3} width={50} height={18} rx={5} fill={lane === 2 ? ACCENT : "var(--bg)"} stroke={lane === 2 ? ACCENT : INK} strokeWidth={1.2} />
        </g>
      ))}
    </>
  );
}

function WindowsMotif() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${170 + i * 55} ${14 + i * 14})`}>
          <rect width={120} height={62} rx={5} fill="var(--bg)" stroke={INK} strokeWidth={1.1} />
          <line x1={0} y1={12} x2={120} y2={12} stroke={INK} strokeWidth={0.8} />
          {[8, 15, 22].map((cx) => (
            <circle key={cx} cx={cx} cy={6} r={1.8} fill={INK} />
          ))}
        </g>
      ))}
      <path d="M190 60 C 230 40, 250 90, 290 70 S 350 60, 370 86" fill="none" stroke={ACCENT} strokeWidth={1.6} strokeDasharray="3 5" />
      <circle cx={370} cy={86} r={4} fill={ACCENT} />
    </>
  );
}

function BranchesMotif() {
  const ys = [26, 46, 66, 86];
  return (
    <>
      <line x1={140} y1={56} x2={200} y2={56} stroke={INK} strokeWidth={1.2} />
      {ys.map((y) => (
        <path key={y} d={`M200 56 C 230 56, 230 ${y}, 260 ${y} L 310 ${y} C 340 ${y}, 340 56, 370 56`} fill="none" stroke={INK} strokeWidth={1} />
      ))}
      <line x1={370} y1={56} x2={395} y2={56} stroke={INK} strokeWidth={1.2} />
      <circle cx={200} cy={56} r={4} fill="var(--bg)" stroke={INK} strokeWidth={1.2} />
      {ys.map((y, i) => (
        <circle key={y} cx={285} cy={y} r={3.5} fill={i === 1 ? ACCENT : "var(--bg)"} stroke={i === 1 ? ACCENT : INK} strokeWidth={1.2} />
      ))}
      <circle cx={370} cy={56} r={5} fill={ACCENT} />
    </>
  );
}

function ArcsMotif() {
  return (
    <>
      <circle cx={250} cy={56} r={34} fill="none" stroke={INK} strokeWidth={1.2} />
      <circle cx={290} cy={56} r={34} fill="none" stroke={ACCENT} strokeWidth={1.4} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${335 + i * 14} ${22 + i * 18})`}>
          <rect width={22} height={13} rx={6} fill={i === 2 ? ACCENT : "var(--bg)"} stroke={i === 2 ? ACCENT : INK} strokeWidth={1} />
        </g>
      ))}
    </>
  );
}

function MatrixMotif() {
  const fills = [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0];
  return (
    <>
      {fills.map((f, i) => (
        <rect key={i} x={100 + (i % 8) * 25} y={18 + Math.floor(i / 8) * 26} width={19} height={19} rx={4} fill={f ? ACCENT : "var(--bg)"} stroke={f ? ACCENT : INK} strokeWidth={1} opacity={f ? 0.9 : 1} />
      ))}
    </>
  );
}

function DefaultMotif() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={200 + i * 40} cy={56} r={4} fill={i === 2 ? ACCENT : "var(--bg)"} stroke={INK} strokeWidth={1.2} />
      ))}
    </>
  );
}

const MOTIFS: Record<string, () => React.ReactNode> = {
  neatcode: GraphMotif,
  "gpu-inference": LanesMotif,
  fleet: WindowsMotif,
  "genai-platform": BranchesMotif,
  ivorie: ArcsMotif,
  "mcp-evals": MatrixMotif,
};

export function ProjectCover({ project, className = "" }: { project: Project; className?: string }) {
  if (project.cover) {
    return (
      <Image
        src={project.cover.src}
        alt=""
        width={1200}
        height={630}
        className={`cover-art w-full object-cover ${className}`}
      />
    );
  }
  const motif = MOTIFS[project.slug] ? project.slug : "default";
  const Motif = MOTIFS[project.slug] ?? DefaultMotif;
  return (
    <svg
      viewBox="0 0 400 112"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-motif={motif}
      className={`w-full border-b border-border bg-bg ${className}`}
    >
      <defs>
        <pattern id={`dots-${motif}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="var(--border)" />
        </pattern>
      </defs>
      <rect width="400" height="112" fill={`url(#dots-${motif})`} />
      <Motif />
    </svg>
  );
}

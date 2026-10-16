export interface ParsedStat {
  prefix: string;
  value: number;
  suffix: string;
  decimals: number;
}

/** Split a display stat like "+25%" or "131k LOC" into the number to animate and its text around it. */
export function parseStat(text: string): ParsedStat | null {
  const m = text.match(/^([^\d]*?)(\d+(?:\.(\d+))?)(.*)$/);
  if (!m) return null;
  return { prefix: m[1], value: Number(m[2]), suffix: m[4], decimals: m[3]?.length ?? 0 };
}

export function formatStat(p: ParsedStat, value: number): string {
  return `${p.prefix}${value.toFixed(p.decimals)}${p.suffix}`;
}

/** Card tilt in degrees from a pointer position, plus the pointer position in % for the spotlight. */
export function tiltFromPointer(x: number, y: number, w: number, h: number, max: number) {
  const cx = Math.min(Math.max(x, 0), w);
  const cy = Math.min(Math.max(y, 0), h);
  const px = cx / w - 0.5;
  const py = cy / h - 0.5;
  const round = (n: number) => Math.round(n * 100) / 100 || 0;
  return { rx: round(-py * 2 * max), ry: round(px * 2 * max), mx: round((cx / w) * 100), my: round((cy / h) * 100) };
}

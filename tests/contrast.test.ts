import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAIRS: [fg: string, bg: string, min: number][] = [
  ["fg", "bg", 7],
  ["fg", "surface", 7],
  ["fg-muted", "bg", 4.5],
  ["fg-muted", "surface", 4.5],
  ["fg-meta", "bg", 4.5],
  ["fg-meta", "surface", 4.5],
  ["accent", "bg", 4.5],
  ["accent", "surface", 4.5],
  ["accent-fg", "accent", 4.5],
];

describe.each([
  ["light", ":root"],
  ["dark", ':root[data-theme="dark"]'],
])("%s theme contrast", (_name, selector) => {
  const t = block(selector);
  it.each(PAIRS)("%s on %s ≥ %s:1", (fg, bg, min) => {
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
  });
});

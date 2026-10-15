import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY, themeInitScript } from "@/lib/theme";

function run(opts: { stored?: string | null; throws?: boolean; prefersDark?: boolean }) {
  const dataset: Record<string, string> = {};
  const context = {
    localStorage: {
      getItem: (key: string) => {
        if (opts.throws) throw new Error("SecurityError");
        return key === THEME_STORAGE_KEY ? (opts.stored ?? null) : null;
      },
    },
    window: {
      matchMedia: (q: string) => ({
        matches: q === "(prefers-color-scheme: dark)" && Boolean(opts.prefersDark),
      }),
    },
    document: { documentElement: { dataset } },
  };
  runInNewContext(themeInitScript, context);
  return dataset.theme;
}

describe("themeInitScript", () => {
  it("applies a stored light/dark choice", () => {
    expect(run({ stored: "dark", prefersDark: false })).toBe("dark");
    expect(run({ stored: "light", prefersDark: true })).toBe("light");
  });

  it("falls back to the system preference when nothing is stored", () => {
    expect(run({ stored: null, prefersDark: true })).toBe("dark");
    expect(run({ stored: null, prefersDark: false })).toBe("light");
  });

  it("ignores garbage stored values", () => {
    expect(run({ stored: "purple", prefersDark: true })).toBe("dark");
  });

  it("does not throw when storage is blocked, leaving CSS to follow the system", () => {
    expect(() => run({ throws: true })).not.toThrow();
    expect(run({ throws: true })).toBeUndefined();
  });
});

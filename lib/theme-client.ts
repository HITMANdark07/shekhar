import { THEME_STORAGE_KEY } from "./theme";

/** Flip between light and dark, starting from whatever is showing now, and remember the choice. */
export function toggleTheme(): void {
  const root = document.documentElement;
  const current =
    root.dataset.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
}

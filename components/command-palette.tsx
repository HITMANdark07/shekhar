"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCommands, filterCommands, type Command } from "@/lib/commands";
import { site } from "@/content/site";
import { toggleTheme } from "@/lib/theme-client";

const COMMANDS = buildCommands();

/** ⌘K / Ctrl+K (or "/") opens a jump-anywhere palette built on the native <dialog>. */
export function CommandPalette() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const results = useMemo(() => filterCommands(COMMANDS, query), [query]);

  function open() {
    setQuery("");
    setIndex(0);
    dialogRef.current?.showModal();
    inputRef.current?.focus();
  }

  function close() {
    dialogRef.current?.close();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function run(cmd: Command) {
    if (cmd.action === "copy-email") {
      try {
        await navigator.clipboard.writeText(site.email);
        setToast("Email copied");
      } catch {
        setToast(site.email);
      }
      window.setTimeout(() => setToast(null), 1800);
      return;
    }
    close();
    if (cmd.action === "theme") toggleTheme();
    else if (cmd.external && cmd.href) window.open(cmd.href, "_blank", "noopener");
    else if (cmd.href) router.push(cmd.href);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[index]) {
      e.preventDefault();
      void run(results[index]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="hidden items-center gap-2 rounded-md border border-border px-2 py-1 font-mono text-[0.75rem] text-fg-meta transition-colors duration-150 hover:border-accent hover:text-fg sm:inline-flex"
        aria-label="Open command palette"
      >
        <span aria-hidden="true">⌘K</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Command palette"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="command-palette m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <span aria-hidden="true" className="font-mono text-accent">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Jump to a project, page or action…"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
            aria-autocomplete="list"
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-fg-meta"
          />
          <kbd className="font-mono text-[0.75rem] text-fg-meta">esc</kbd>
        </div>
        <ul id="command-results" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-fg-meta">No matches</li>}
          {results.map((cmd, i) => {
            const header = results[i - 1]?.group !== cmd.group ? cmd.group : null;
            return (
              <li key={cmd.id} role="presentation">
                {header && (
                  <p role="presentation" className="px-3 pb-1 pt-3 font-mono text-[0.6875rem] uppercase tracking-wider text-fg-meta">
                    {header}
                  </p>
                )}
                <div
                  id={`cmd-${cmd.id}`}
                  role="option"
                  aria-selected={i === index}
                  onPointerMove={() => setIndex(i)}
                  onClick={() => void run(cmd)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                    i === index ? "bg-accent text-accent-fg" : "text-fg"
                  }`}
                >
                  <span className="truncate">{cmd.label}</span>
                  {cmd.hint && (
                    <span className={`shrink-0 truncate font-mono text-[0.75rem] ${i === index ? "text-accent-fg" : "text-fg-meta"}`}>
                      {cmd.hint}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[0.6875rem] text-fg-meta">
          <span>↑↓ navigate · ↵ open</span>
          <span aria-live="polite">{toast}</span>
        </div>
      </dialog>
    </>
  );
}

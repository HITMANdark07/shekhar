"use client";

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { INITIAL_LINES, runCommand, type TerminalLine } from "./commands";

const LINE_CLASS: Record<TerminalLine["kind"], string> = {
  input: "text-fg",
  output: "text-fg-muted",
  error: "text-accent",
};

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(INITIAL_LINES);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const result = runCommand(value);
    if (value.trim()) history.current.unshift(value.trim());
    historyIndex.current = -1;
    setValue("");
    if (result.clear) return setLines([]);
    setLines((prev) => [...prev, ...result.lines]);
    if (result.open) window.open(result.open, "_blank", "noopener");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const h = history.current;
    if (e.key === "ArrowUp" && h.length > 0) {
      e.preventDefault();
      historyIndex.current = Math.min(historyIndex.current + 1, h.length - 1);
      setValue(h[historyIndex.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      historyIndex.current = Math.max(historyIndex.current - 1, -1);
      setValue(historyIndex.current === -1 ? "" : h[historyIndex.current]);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface font-mono text-sm">
      <div
        ref={logRef}
        role="log"
        aria-label="Terminal output"
        className="max-h-[60vh] min-h-64 space-y-1 overflow-y-auto whitespace-pre-wrap break-words p-4"
      >
        {lines.map((line, i) => (
          <p key={i} className={LINE_CLASS[line.kind]}>
            {line.kind === "input" && <span aria-hidden="true" className="text-accent">$ </span>}
            {line.text}
          </p>
        ))}
      </div>
      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-border px-4 py-3 focus-within:outline-2 focus-within:outline-accent"
      >
        <label htmlFor="terminal-input" className="text-accent">
          <span aria-hidden="true">$</span>
          <span className="sr-only">Command</span>
        </label>
        <input
          id="terminal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          placeholder="type a command and press enter"
          className="min-w-0 flex-1 bg-transparent text-fg placeholder:text-fg-meta focus-visible:outline-none"
        />
      </form>
    </div>
  );
}

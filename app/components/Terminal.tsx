"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { COMMANDS, escapeHtml } from "./terminalCommands";

type Line = { html: string; cls?: string };

const INITIAL: Line[] = [
  {
    html: `<span class="sys">Welcome to shekhar.os · type <b style="color:var(--accent)">help</b> for commands.</span>
Available: <span class="you">help · about · skills · projects · contact · social · resume · coffee · sudo · clear</span>`,
  },
];

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(INITIAL);
  const [value, setValue] = useState("");
  const historyRef = useRef<string[]>([]);
  const hIdxRef = useRef(-1);
  const outRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const append = (html: string, cls?: string) => {
    setLines((prev) => [...prev, { html, cls }]);
  };

  const handle = (cmd: string) => {
    const raw = cmd.trim();
    if (!raw) return;
    historyRef.current.unshift(raw);
    hIdxRef.current = -1;
    append(
      `<span style="color:var(--accent)">➜</span> <span style="color:var(--fg-dim)">shekhar.os</span> <span style="color:var(--accent)">$</span> <span class="you">${escapeHtml(
        raw,
      )}</span>`,
    );
    const [name] = raw.toLowerCase().split(/\s+/);
    if (name === "clear") {
      setLines([]);
      return;
    }
    const fn = COMMANDS[name];
    if (fn) {
      const res = fn();
      if (res !== null && res !== undefined) {
        append(`<span class="sys">${res}</span>`);
      }
    } else {
      append(
        `<span style="color:var(--accent-hot)">command not found:</span> ${escapeHtml(
          name,
        )} — type <span class="you">help</span>`,
      );
    }
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handle(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = historyRef.current;
      if (h.length === 0) return;
      hIdxRef.current = Math.min(hIdxRef.current + 1, h.length - 1);
      setValue(h[hIdxRef.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIdxRef.current = Math.max(hIdxRef.current - 1, -1);
      setValue(hIdxRef.current === -1 ? "" : historyRef.current[hIdxRef.current]);
    }
  };

  return (
    <>
      <div className="term-output" id="termOut" ref={outRef}>
        {lines.map((l, i) => (
          <div
            key={i}
            className={l.cls}
            dangerouslySetInnerHTML={{ __html: l.html }}
          />
        ))}
      </div>
      <div className="prompt-line">
        <span className="ps1">➜</span>
        <span className="host">shekhar.os</span>
        <span style={{ color: "var(--accent)" }}>$</span>
        <input
          id="termIn"
          autoComplete="off"
          spellCheck={false}
          placeholder="type a command and hit enter…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
        />
      </div>
    </>
  );
}

"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { COMMANDS, escapeHtml } from "./terminalCommands";

type Line = { html: string };

export default function HeroPrompt() {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const historyRef = useRef<string[]>([]);
  const hIdxRef = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const append = (html: string) => setLines((prev) => [...prev, { html }]);

  const handle = (cmd: string) => {
    const raw = cmd.trim();
    if (!raw) return;
    historyRef.current.unshift(raw);
    hIdxRef.current = -1;
    append(
      `<span class="usr">shekhar@kumar</span><span class="sym">:~$</span> <span style="color:var(--fg)">${escapeHtml(
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
        append(`<span style="color:var(--fg-dim)">${res}</span>`);
      }
    } else {
      append(
        `<span style="color:var(--accent-hot)">command not found:</span> ${escapeHtml(
          name,
        )} — type <span style="color:var(--accent)">help</span>`,
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

  const focusInput = () => inputRef.current?.focus();

  return (
    <>
      {lines.length > 0 && (
        <div
          className="hero-term-output"
          style={{
            marginTop: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            color: "var(--fg-dim)",
          }}
        >
          {lines.map((l, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: l.html }} />
          ))}
        </div>
      )}
      <div
        className="hero-prompt"
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "text",
        }}
        onClick={focusInput}
      >
        <span className="usr">shekhar@kumar</span>
        <span className="sym">:~$</span>
        <input
          ref={inputRef}
          autoComplete="off"
          spellCheck={false}
          placeholder="type help and hit enter…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: "transparent",
            border: 0,
            outline: "none",
            color: "var(--fg)",
            fontFamily: "var(--font-mono)",
            fontSize: "inherit",
            caretColor: "var(--fg)",
            padding: 0,
            minWidth: 0,
          }}
        />
        {!focused && value.length === 0 && <span className="cursor"></span>}
      </div>
    </>
  );
}

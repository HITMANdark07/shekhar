"use client";

import { useEffect, useRef, useState } from "react";

const LINES = [
  "SHEKHAR.OS v4.21  (c) 2026  Kumar Systems",
  "CPU: Neural Cortex @ 3.4 GHz · RAM: 4+ yrs shipping · DISK: 2x NVMe (scalable)",
  "",
  "Running POST...",
  "  checking system memory ..................... 4 YEARS OK",
  "  detecting stack ............................ NODE · NESTJS · PG OK",
  "  mounting /projects ......................... 4 DIRS MOUNTED",
  "  initializing AI subsystem .................. LANGCHAIN · RAG · MCP",
  "  loading personality module ................. LOW_DRAMA=TRUE",
  "  handshake coffee.daemon .................... [OK] HOT",
  "",
  "> boot complete. welcome, visitor.",
  "> launching shekhar.kumar.portfolio...",
];

export default function BootOverlay() {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);
  const skippedRef = useRef(false);

  useEffect(() => {
    let i = 0;
    let buf = "";
    let cancel = false;

    const finish = () => {
      if (cancel) return;
      setDone(true);
      setTimeout(() => setRemoved(true), 500);
    };

    const step = () => {
      if (cancel || skippedRef.current) return;
      if (i >= LINES.length) {
        setTimeout(finish, 400);
        return;
      }
      buf += LINES[i] + "\n";
      setText(buf);
      i++;
      setTimeout(step, Math.max(40, 90 + Math.random() * 80));
    };

    const start = setTimeout(step, 150);
    return () => {
      cancel = true;
      clearTimeout(start);
    };
  }, []);

  const skip = () => {
    skippedRef.current = true;
    setDone(true);
    setTimeout(() => setRemoved(true), 500);
  };

  if (removed) return null;

  return (
    <div
      className={`boot${done ? " done" : ""}`}
      id="boot"
      onClick={skip}
      role="button"
      tabIndex={0}
    >
      <pre
        id="bootLog"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--fg)",
          lineHeight: 1.6,
        }}
      >
        {text}
      </pre>
      <button
        className="boot-skip"
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
      >
        [ SKIP BOOT ▸ ]
      </button>
    </div>
  );
}

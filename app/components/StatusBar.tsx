"use client";

import { useEffect, useState } from "react";

type Theme = "green" | "amber" | "paper";
const THEMES: { key: Theme; label: string }[] = [
  { key: "green", label: "GRN" },
  { key: "amber", label: "AMB" },
  { key: "paper", label: "PPR" },
];

export default function StatusBar() {
  const [clock, setClock] = useState("--:--:--");
  const [uptime, setUptime] = useState("00:00");
  const [theme, setTheme] = useState<Theme>("green");

  useEffect(() => {
    const saved = (localStorage.getItem("shekhar-theme") as Theme) || "green";
    setTheme(saved);
    document.body.setAttribute("data-theme", saved);

    const started = Date.now();
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setClock(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
      const u = Math.floor((Date.now() - started) / 1000);
      setUptime(`${p(Math.floor(u / 60))}:${p(u % 60)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const choose = (t: Theme) => {
    setTheme(t);
    document.body.setAttribute("data-theme", t);
    localStorage.setItem("shekhar-theme", t);
  };

  return (
    <div className="statusbar">
      <div className="left">
        <span>SHEKHAR.OS v4.21</span>
        <span className="blink">_</span>
      </div>
      <div className="right">
        <span id="clock">{clock}</span>
        <span>
          UPTIME <b id="uptime">{uptime}</b>
        </span>
        <div className="theme-toggle" role="tablist" aria-label="color theme">
          {THEMES.map((t) => (
            <button
              key={t.key}
              data-theme-set={t.key}
              className={theme === t.key ? "active" : ""}
              onClick={() => choose(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

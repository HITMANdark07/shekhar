import { skills } from "@/content/about";
import { site } from "@/content/site";
import { getProjects } from "@/lib/projects";

export type TerminalLine = { kind: "input" | "output" | "error"; text: string };
export type CommandResult = { lines: TerminalLine[]; clear?: boolean; open?: string };

const MAX_ECHO = 200;

const COMMANDS: Record<string, { help: string; run: () => string | CommandResult }> = {
  help: { help: "list commands", run: () => helpText() },
  about: {
    help: "who is shekhar",
    run: () => `${site.name} · ${site.role} · ${site.focus}\n${site.headline}\nBased in ${site.location.city}, ${site.location.country}.`,
  },
  skills: {
    help: "what he builds with",
    run: () => skills.map((g) => `${g.name.padEnd(10)}: ${g.items.join(", ")}`).join("\n"),
  },
  projects: {
    help: "shipped work",
    run: () =>
      getProjects()
        .map((p, i) => `[${String(i + 1).padStart(2, "0")}] ${p.title} — ${p.tagline}`)
        .join("\n"),
  },
  contact: {
    help: "reach out",
    run: () => `email    : ${site.email}\ngithub   : ${site.links.github}\nlinkedin : ${site.links.linkedin}`,
  },
  resume: {
    help: "open the résumé",
    run: () => ({ lines: [{ kind: "output", text: "opening resume.pdf…" }], open: site.resume }),
  },
  clear: { help: "clear the screen", run: () => ({ lines: [], clear: true }) },
};

const EASTER_EGGS: Record<string, string> = {
  sudo: "shekhar is not in the sudoers file. this incident will be reported. (just kidding.)",
  whoami: "visitor · thanks for stopping by.",
  coffee: "brewing… done. stay caffeinated.",
};

export const COMMAND_NAMES = Object.keys(COMMANDS);

export const INITIAL_LINES: TerminalLine[] = [
  { kind: "output", text: "Welcome. Type 'help' to see commands." },
];

function helpText(): string {
  return COMMAND_NAMES.map((name) => `${name.padEnd(10)} ${COMMANDS[name].help}`).join("\n");
}

export function runCommand(raw: string): CommandResult {
  const input = raw.trim();
  if (!input) return { lines: [] };

  const echo: TerminalLine = {
    kind: "input",
    text: input.length > MAX_ECHO ? `${input.slice(0, MAX_ECHO)}…` : input,
  };
  const name = input.toLowerCase().split(/\s+/)[0];

  const command = COMMANDS[name];
  if (command) {
    const result = command.run();
    if (typeof result === "string") return { lines: [echo, { kind: "output", text: result }] };
    if (result.clear) return result;
    return { ...result, lines: [echo, ...result.lines] };
  }

  const egg = EASTER_EGGS[name];
  if (egg) return { lines: [echo, { kind: "output", text: egg }] };

  return {
    lines: [echo, { kind: "error", text: `command not found: ${echo.text} — type 'help'` }],
  };
}

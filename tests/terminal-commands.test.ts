import { describe, expect, it } from "vitest";
import { COMMAND_NAMES, runCommand } from "@/components/terminal/commands";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

const out = (raw: string) => runCommand(raw).lines.map((l) => l.text).join("\n");

describe("runCommand", () => {
  it("echoes the input as the first line", () => {
    expect(runCommand("about").lines[0]).toEqual({ kind: "input", text: "about" });
  });

  it("lists every command in help", () => {
    const help = out("help");
    for (const name of COMMAND_NAMES) expect(help).toContain(name);
  });

  it("is case-insensitive and trims", () => {
    expect(out("  ABOUT  ")).toContain(site.headline);
  });

  it("lists projects in registry order", () => {
    const text = out("projects");
    const positions = projects.map((p) => text.indexOf(p.title));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("shows email but never a phone number in contact", () => {
    const text = out("contact");
    expect(text).toContain(site.email);
    expect(text).not.toMatch(/\d{5}[\s-]?\d{5}/);
    expect(text.toLowerCase()).not.toContain("whatsapp");
  });

  it("opens the résumé", () => {
    expect(runCommand("resume").open).toBe(site.resume);
  });

  it("clears", () => {
    expect(runCommand("clear")).toEqual({ lines: [], clear: true });
  });

  it("ignores blank input", () => {
    expect(runCommand("   ").lines).toEqual([]);
  });

  it("reports unknown commands as plain text, including hostile input", () => {
    const hostile = '<img src=x onerror="alert(1)">';
    const res = runCommand(hostile);
    expect(res.lines.at(-1)?.kind).toBe("error");
    expect(res.lines.at(-1)?.text).toContain("<img");
  });

  it("truncates very long input in the echo", () => {
    const res = runCommand("x".repeat(5000));
    expect(res.lines[0].text.length).toBeLessThanOrEqual(201);
  });
});

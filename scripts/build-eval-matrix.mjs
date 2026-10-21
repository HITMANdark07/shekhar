#!/usr/bin/env node
// Usage: node scripts/build-eval-matrix.mjs [run-dir]
// Reads an mcp-evals run (results.json + traces.jsonl.gz) and writes the compact
// per-run data behind the eval-matrix demo to content/generated/eval-matrix.json.
// Trace events, prompts, answers and stderr are deliberately left out.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

// Default: the mcp-evals checkout next to this repo's parent folder (~/Desktop/mcp-evals beside ~/Desktop/portfolio/shekhar).
const DEFAULT = join(import.meta.dirname, "..", "..", "..", "mcp-evals", "data", "runs", "2026-10-16T11-09-26-158Z-3e36fe");
const dir = process.argv[2] ?? DEFAULT;

const results = JSON.parse(readFileSync(join(dir, "results.json"), "utf8"));
const lines = gunzipSync(readFileSync(join(dir, "traces.jsonl.gz"))).toString("utf8").split("\n").filter(Boolean);

const runs = lines.map((l) => {
  const r = JSON.parse(l);
  return {
    task: r.task,
    server: r.server,
    model: r.model,
    repeat: r.repeat,
    outcome: r.outcome,
    end: r.end,
    steps: r.steps,
    contextTokens: r.contextTokens,
    costUsd: Math.round(r.costUsd * 1e5) / 1e5,
    latencyMs: r.latencyMs,
  };
});

const uniq = (xs) => [...new Set(xs)];
const tasks = uniq(runs.map((r) => r.task));
const models = uniq(runs.map((r) => r.model));
const servers = ["neatcode", "filesystem"].filter((s) => runs.some((r) => r.server === s));
runs.sort(
  (a, b) =>
    tasks.indexOf(a.task) - tasks.indexOf(b.task) ||
    servers.indexOf(a.server) - servers.indexOf(b.server) ||
    models.indexOf(a.model) - models.indexOf(b.model) ||
    a.repeat - b.repeat,
);

const out = {
  runId: results.runId,
  startedAt: results.startedAt,
  suite: runs[0].suite ?? "code-navigation",
  tasks,
  servers,
  models,
  runs,
};
writeFileSync(new URL("../content/generated/eval-matrix.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`${runs.length} runs, ${tasks.length} tasks, ${servers.length} servers, ${models.length} models`);

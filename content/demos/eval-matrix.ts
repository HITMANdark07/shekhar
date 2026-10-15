/** Sample eval-matrix data showing the shape of an mcp-evals run. Not a real run. */

export type Outcome = "pass" | "fail" | "error";

export interface CellResult {
  task: string;
  model: string;
  outcome: Outcome;
  steps: number;
  toolTokens: number;
}

const TASKS = ["find-callers", "trace-flow", "pick-right-tool", "list-routes", "explain-module", "rename-impact"];
const MODELS = ["model-a", "model-b", "model-c", "model-d"];

// Deterministic sample outcomes: a fixed pattern, so the demo looks the same on every visit.
const PATTERN: Outcome[] = [
  "pass", "pass", "fail", "pass",
  "pass", "fail", "pass", "pass",
  "pass", "pass", "pass", "error",
  "fail", "pass", "pass", "pass",
  "pass", "pass", "fail", "pass",
  "pass", "fail", "pass", "fail",
];

export const evalRun = {
  label: "Sample run",
  tasks: TASKS,
  models: MODELS,
  results: TASKS.flatMap((task, t) =>
    MODELS.map((model, m): CellResult => {
      const i = t * MODELS.length + m;
      return {
        task,
        model,
        outcome: PATTERN[i],
        steps: 2 + ((i * 7) % 6),
        toolTokens: 600 + ((i * 337) % 2400),
      };
    }),
  ),
};

/** Order in which cells fill during replay: column by column, like models finishing tasks. */
export function replayOrder(run: typeof evalRun): number[] {
  const order: number[] = [];
  for (let m = 0; m < run.models.length; m++)
    for (let t = 0; t < run.tasks.length; t++) order.push(t * run.models.length + m);
  return order;
}

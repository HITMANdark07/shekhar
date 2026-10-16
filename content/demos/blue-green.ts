/** The production deploy from apps_go_backend's GitHub Actions workflow, as a step-by-step timeline. */

export type SlotStatus = "running" | "stopped" | "starting" | "unhealthy";

export interface DeployState {
  live: "blue" | "green";
  blue: SlotStatus;
  green: SlotStatus;
  version: { blue: string; green: string };
}

export interface DeployStep {
  id: "build" | "slot" | "upload" | "start" | "health" | "switch" | "keep" | "rollback";
  title: string;
  detail: string;
  trace: string;
  state: DeployState;
}

const BEFORE: DeployState = { live: "blue", blue: "running", green: "stopped", version: { blue: "v41", green: "v40" } };

export function deployTimeline(failHealth: boolean): DeployStep[] {
  const staged = { ...BEFORE, version: { blue: "v41", green: "v42" } };
  const steps: DeployStep[] = [
    {
      id: "build",
      title: "Build in CI",
      detail: "GitHub Actions builds one static Go binary for arm64 (CGO off, stripped) and the TypeScript AI service.",
      trace: "CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags=\"-s -w\" -o bin/apps-backend .",
      state: BEFORE,
    },
    {
      id: "slot",
      title: "Pick the idle slot",
      detail: "The server's current symlink points at blue, which is serving traffic, so green is the deploy target.",
      trace: "readlink /opt/apps-backend/current → blue   ⇒   target: green",
      state: BEFORE,
    },
    {
      id: "upload",
      title: "Upload and verify",
      detail: "The binary, configs and SQL migrations are copied into the green slot, and each upload is verified before the pipeline goes on.",
      trace: "scp bin/apps-backend config/ migrations/ → /opt/apps-backend/green   ✓ verified",
      state: staged,
    },
    {
      id: "start",
      title: "Start green next to blue",
      detail: "The green service starts on its own port while blue keeps serving every request.",
      trace: "systemctl start apps-backend-green   (port 8081; AI service on 3001)",
      state: { ...staged, green: "starting" },
    },
    {
      id: "health",
      title: failHealth ? "Health check fails" : "Health check passes",
      detail: failHealth
        ? "Green does not answer 200 on /health, so the pipeline never sends it traffic."
        : "Green answers 200 on /health, for both the Go backend and the TypeScript AI service.",
      trace: failHealth ? "curl localhost:8081/health → 500   ✗" : "curl localhost:8081/health → 200   ✓",
      state: { ...staged, green: failHealth ? "unhealthy" : "running" },
    },
  ];
  if (failHealth) {
    steps.push({
      id: "rollback",
      title: "Automatic rollback",
      detail: "The workflow's rollback step stops green and leaves blue serving. Users never see the failed build.",
      trace: "systemctl stop apps-backend-green   ·   current → blue (unchanged)",
      state: { ...staged, green: "stopped" },
    });
    return steps;
  }
  steps.push(
    {
      id: "switch",
      title: "Flip traffic",
      detail: "The current symlink moves to green and the nginx upstream is rewritten to port 8081; nginx -t validates the config before a reload.",
      trace: "ln -sfn green current   ·   upstream → 127.0.0.1:8081   ·   nginx -t && systemctl reload nginx",
      state: { ...staged, green: "running", live: "green" },
    },
    {
      id: "keep",
      title: "Keep blue for rollback",
      detail: "The old slot is stopped but stays on disk, so going back is one switch away.",
      trace: "systemctl stop apps-backend-blue   (kept for rollback)",
      state: { ...staged, green: "running", blue: "stopped", live: "green" },
    },
  );
  return steps;
}

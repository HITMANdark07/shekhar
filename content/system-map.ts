/** Hero diagram: the kinds of systems on the résumé, each node linking to the project where they were built. */

export interface MapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  project?: string;
}

export interface MapEdge {
  from: string;
  to: string;
}

export const systemMap = {
  width: 560,
  height: 320,
  nodes: [
    { id: "users", label: "users", x: 52, y: 160 },
    { id: "api", label: "APIs", x: 160, y: 160, project: "ivorie" },
    { id: "realtime", label: "real-time chat", x: 285, y: 62, project: "ivorie" },
    { id: "queue", label: "queues", x: 285, y: 160, project: "gpu-inference" },
    { id: "gpu", label: "GPU pods", x: 410, y: 160, project: "gpu-inference" },
    { id: "router", label: "LLM router", x: 285, y: 258, project: "genai-platform" },
    { id: "tools", label: "MCP tools", x: 410, y: 258, project: "genai-platform" },
    { id: "graph", label: "code graph", x: 512, y: 258, project: "neatcode" },
    { id: "agents", label: "agents", x: 512, y: 160, project: "fleet" },
    { id: "envs", label: "RL envs", x: 410, y: 62, project: "fleet" },
    { id: "evals", label: "evals", x: 512, y: 62, project: "mcp-evals" },
  ] satisfies MapNode[],
  edges: [
    { from: "users", to: "api" },
    { from: "api", to: "realtime" },
    { from: "api", to: "queue" },
    { from: "queue", to: "gpu" },
    { from: "api", to: "router" },
    { from: "router", to: "tools" },
    { from: "tools", to: "graph" },
    { from: "agents", to: "tools" },
    { from: "agents", to: "envs" },
    { from: "envs", to: "evals" },
  ] satisfies MapEdge[],
};

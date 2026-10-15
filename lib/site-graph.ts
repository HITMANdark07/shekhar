export type GraphGroup = "app" | "components" | "content" | "lib";

export interface GraphNode {
  id: string;
  label: string;
  group: GraphGroup | string;
  x: number;
  y: number;
  symbols: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  kinds: string[];
}

export interface SiteGraph {
  generatedAt: string;
  stats: { files: number; symbols: number; edges: number; indexSeconds: number };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphQuery {
  label: string;
  node: string;
  direction: "incoming" | "outgoing";
}

/** Preset structural questions, answered from the graph like NeatCode's query_graph. */
export const GRAPH_QUERIES: GraphQuery[] = [
  { label: "Who uses ProjectCard?", node: "components/project-card.tsx", direction: "incoming" },
  { label: "What does the home page depend on?", node: "app/page.tsx", direction: "outgoing" },
  { label: "Who reads content/site.ts?", node: "content/site.ts", direction: "incoming" },
];

export function neighbors(graph: SiteGraph, id: string): { incoming: string[]; outgoing: string[] } {
  const incoming: string[] = [];
  const outgoing: string[] = [];
  for (const e of graph.edges) {
    if (e.target === id) incoming.push(e.source);
    if (e.source === id) outgoing.push(e.target);
  }
  return { incoming: incoming.sort(), outgoing: outgoing.sort() };
}

/** Nodes and edge indexes to emphasise for a selected node (optionally one direction only). */
export function highlight(
  graph: SiteGraph,
  id: string | null,
  direction?: "incoming" | "outgoing",
): { nodes: Set<string>; edges: Set<number> } {
  const nodes = new Set<string>();
  const edges = new Set<number>();
  if (!id) return { nodes, edges };
  nodes.add(id);
  graph.edges.forEach((e, i) => {
    if (direction !== "incoming" && e.source === id) {
      nodes.add(e.target);
      edges.add(i);
    }
    if (direction !== "outgoing" && e.target === id) {
      nodes.add(e.source);
      edges.add(i);
    }
  });
  return { nodes, edges };
}

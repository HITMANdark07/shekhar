import type { DemoSource } from "@/components/demos/demo-frame";
import siteGraph from "./generated/site-graph.json";

export type DemoKey = "neatcode-graph" | "gpu-queue" | "fleet-episode" | "genai-flow" | "ivorie-flows" | "eval-matrix";

export interface CaseStudy {
  tldr: string[];
  context: string[];
  role: string;
  demo: { key: DemoKey; title: string; source: DemoSource; caption: string };
  how: { title: string; detail: string }[];
  decisions: { decision: string; alternative: string; why: string }[];
  outcomes: string[];
  next?: string[];
}

export const caseStudies: Record<string, CaseStudy> = {
  neatcode: {
    tldr: [
      "Indexes 131k lines of TypeScript in 3.8s and answers structural queries in under 300ms.",
      "11 deterministic MCP tools return 12–60× less context than a grep-and-read agent baseline.",
      "Open source on npm as @neatcodeai/cli, with 510 tests at a 0.68:1 test-to-code ratio.",
    ],
    context: [
      "Coding agents spend most of their context window rediscovering the codebase. Every turn they grep, open files, and read far more than they need, and they still miss the structural answer: who calls this, what renders that, where the event gets published.",
      "They also ignore the conventions a repo already follows, because nothing tells them what those conventions are until a reviewer complains.",
    ],
    role: "Author and maintainer: architecture, the parser and graph engine, the MCP server, the CLI, tests and npm releases (v0.1.4 published October 2026).",
    demo: {
      key: "neatcode-graph",
      title: "This website, indexed by NeatCode",
      source: "real",
      caption:
        "Built from the graph.db NeatCode produced for this site's own source. Each dot is a file; each line is an import, render or call between files. Pick a question or select a file to see what query_graph returns.",
    },
    how: [
      {
        title: "Parse with the TypeScript compiler",
        detail: "ts-morph walks every .ts/.tsx file, and the TypeChecker resolves calls across files, so edges point at the real symbol rather than a name match.",
      },
      {
        title: "Store a code graph in SQLite",
        detail: "Files and symbols become nodes; imports, calls, renders and containment become edges, each tagged EXTRACTED or INFERRED so the agent knows how much to trust it.",
      },
      {
        title: "Re-index only what changed",
        detail: "A content-hash sync layer re-parses only edited files, cutting re-index cost from 3.8s to 0.49s on an unchanged 1,821-file repository.",
      },
      {
        title: "Mine the repo's conventions",
        detail: "A heuristic miner proposes rules from patterns the code already follows; accepted rules live in .neatcode/skills.yaml and validate_diff checks planned changes against them.",
      },
      {
        title: "Serve it to agents over MCP",
        detail: "A stdio MCP server exposes 11 tools (query_graph, find_node, trace_flow, validate_diff and more), and `neatcode claude install` wires it into Claude Code in one command.",
      },
    ],
    decisions: [
      {
        decision: "Embedded SQLite for the graph",
        alternative: "A graph database or a hosted service",
        why: "Zero ops and local-first: the whole index ships inside an npm package and lives in the repo's .neatcode/ folder.",
      },
      {
        decision: "Deterministic graph queries, no LLM in the hot path",
        alternative: "Embedding search over code chunks",
        why: "Structural questions have exact answers. Graph edges are reproducible, cost nothing per query, and never hallucinate a caller.",
      },
      {
        decision: "stdio MCP transport",
        alternative: "An HTTP server",
        why: "Editors spawn the server as a local process: no ports, no auth, no daemon to babysit.",
      },
      {
        decision: "TypeScript first",
        alternative: "Shallow multi-language parsing from day one",
        why: "The TypeChecker gives precise cross-file call graphs. Depth on one language beats guesses across five; other languages are on the roadmap.",
      },
    ],
    outcomes: [
      "131k LOC indexed in 3.8s (~35k LOC/s, single-threaded ts-morph with batched transactions).",
      "Structural queries answered in under 300ms; 12–60× less context than a grep-and-read baseline for the same query.",
      `This portfolio's own ${siteGraph.stats.files} source files indexed in ${siteGraph.stats.indexSeconds}s to power the demo above.`,
      "510 tests at a 0.68:1 test-to-code ratio, full suite green in 12s.",
    ],
    next: [
      "v0.2: Cursor and Codex installers, import-forbidden and edge-forbidden rule mining, agent-proposed rules.",
      "v0.3: watcher mode, JavaScript indexing, TypeScript LSP integration.",
      "Later: Python and Go, with multi-language graphs joined by import-edge inference.",
    ],
  },

  "gpu-inference": {
    tldr: [
      "Real-time speech-to-image generation orchestrated across multiple GPU-backed pods.",
      "Requests are routed into parallel queues; each worker executes exactly one ComfyUI workflow at a time.",
      "Capacity scales by adding pods to the pool rather than packing more work onto each GPU.",
    ],
    context: [
      "The product turns a spoken request into a generated image while the user waits. Each request runs a ComfyUI workflow: a heavy, long-running GPU job, very different from a typical millisecond API call.",
      "Running several workflows on one GPU at once makes every one of them slower and less predictable, so the pipeline needed to spread work across a fleet of GPU pods without overloading any single one.",
    ],
    role: "Architected the pipeline: request routing, the queueing model and the worker execution model.",
    demo: {
      key: "gpu-queue",
      title: "Route the render queue",
      source: "illustrative",
      caption:
        "A seeded simulation of the pattern, not production data. Jobs arrive, the router sends each to the least-loaded live pod, and every pod runs one job at a time. Kill a pod to watch its queue reroute, or change the load.",
    },
    how: [
      { title: "Speech request arrives", detail: "The client sends the transcribed request; the API turns it into a generation job with its ComfyUI workflow." },
      { title: "Router picks a queue", detail: "The router places the job on one of several parallel queues, each feeding a single GPU worker." },
      { title: "Single-concurrency workers", detail: "Each worker pulls one job, runs its workflow on its own GPU, and only then takes the next one." },
      { title: "Results flow back", detail: "The finished image returns to the client, and the worker is immediately free for the next job in its queue." },
    ],
    decisions: [
      {
        decision: "One job per worker at a time",
        alternative: "Several concurrent workflows per GPU",
        why: "Generation jobs compete for GPU memory and compute; isolating them keeps each job's latency predictable.",
      },
      {
        decision: "Parallel queues behind a router",
        alternative: "One shared queue for every worker",
        why: "Per-worker queues make placement explicit and let the pool grow horizontally by adding pods.",
      },
    ],
    outcomes: [
      "A real-time pipeline orchestrating multiple GPU-backed pods.",
      "Scalable parallel inference: throughput grows with the number of workers instead of degrading under contention.",
    ],
  },

  fleet: {
    tldr: [
      "Led development of an agent evaluation and reinforcement-learning platform.",
      "Recreated production applications such as GitHub and Booking.com as interactive UI environments.",
      "Agents execute multi-step tasks, observe application state, and receive task-level feedback.",
    ],
    context: [
      "To train and evaluate agents that operate real software, you need environments that behave like that software: real pages, real state changes, real multi-step tasks.",
      "Live websites can't give you that safely or repeatably, so Fleet rebuilds the applications themselves as environments agents can act in and be scored on.",
    ],
    role: "Led development of the platform.",
    demo: {
      key: "fleet-episode",
      title: "Scrub an agent's episode",
      source: "synthetic",
      caption:
        "A synthetic episode on a GitHub-like environment, shaped like a Fleet run. Each step pairs what the agent observed, what it did, and the feedback it earned; the curve shows cumulative reward.",
    },
    how: [
      { title: "Recreate the application", detail: "Apps such as GitHub and Booking.com are rebuilt as interactive UI environments with their own state." },
      { title: "Define a task", detail: "Each task describes a multi-step goal an agent must accomplish inside the environment." },
      { title: "Observe and act", detail: "The agent observes the application state, takes an action in the UI, and observes again, step by step." },
      { title: "Feedback from state", detail: "The environment checks its own state to produce task-level feedback used for reinforcement learning and evaluation." },
    ],
    decisions: [
      {
        decision: "Rebuild the applications as environments",
        alternative: "Point agents at the live websites",
        why: "Owned environments can expose their state for scoring and be run again and again without touching real users or accounts.",
      },
      {
        decision: "Task-level feedback from application state",
        alternative: "Judging transcripts after the fact",
        why: "Whether the repository is starred or the booking exists is a fact the environment can check directly.",
      },
    ],
    outcomes: [
      "Environments recreating applications such as GitHub and Booking.com for agent training and evaluation.",
      "Agents can execute multi-step tasks, observe state, and receive task-level feedback for reinforcement learning.",
    ],
  },

  "genai-platform": {
    tldr: [
      "A production-grade LangChain platform with model routing across multiple fine-tuned models.",
      "Categorised prompt orchestration, conversation context management and tool calling, including a custom MCP server for real-time web search.",
      "RAG pipelines over vector databases improved response relevance and accuracy by 25%.",
    ],
    context: [
      "Different kinds of questions need different models, prompts and context. A single general prompt to a single model left answers generic and, for anything time-sensitive, out of date.",
      "The platform needed to send each request to the right model with the right context, let models call tools for fresh information, and ground answers in the company's own data.",
    ],
    role: "Architected the platform and its retrieval pipelines.",
    demo: {
      key: "genai-flow",
      title: "Life of a request",
      source: "illustrative",
      caption: "Step through one request as it moves through the platform. The trace snippets are illustrative, written to show each stage's job; they are not production logs.",
    },
    how: [
      { title: "Model routing", detail: "Each request is classified and routed to one of several fine-tuned models." },
      { title: "Prompt orchestration", detail: "Categorised prompt templates combine with managed conversation context for that model." },
      { title: "Tool calling over MCP", detail: "Models call tools through a custom MCP server, including real-time web search, with room to plug in new tools." },
      { title: "Retrieval-augmented generation", detail: "Answers are grounded in relevant chunks retrieved from vector databases before the response streams back." },
    ],
    decisions: [
      {
        decision: "Route across multiple fine-tuned models",
        alternative: "One general-purpose model for everything",
        why: "Matching request categories to specialised models and prompts keeps answers on-topic for each kind of question.",
      },
      {
        decision: "A custom MCP server for tools",
        alternative: "Hard-coding each tool into the application",
        why: "MCP gives tools a standard interface, so new integrations plug in without changing the orchestration code.",
      },
      {
        decision: "Ground answers with RAG",
        alternative: "Relying on what the model already knows",
        why: "Retrieval over the company's own data is what moved response relevance and accuracy by 25%.",
      },
    ],
    outcomes: ["+25% response relevance and accuracy from the RAG pipelines.", "Extensible tool integration through MCP, starting with real-time web search."],
  },

  ivorie: {
    tldr: [
      "Designed and owned the backend of a wedding-planning marketplace serving 5k+ users.",
      "Real-time chat and notifications handling 10k+ messages a day.",
      "Stripe Connected Account payments, AWS media uploads and an automated multi-tenant migration system.",
    ],
    context: [
      "Ivorie connects couples with wedding vendors. That means three hard backend problems at once: people messaging each other in real time, money moving between customers, the platform and vendors, and a growing product that has to keep shipping safely.",
    ],
    role: "Designed and owned the backend architecture across NestJS APIs, an Expo React Native app and a Next.js admin dashboard.",
    demo: {
      key: "ivorie-flows",
      title: "Follow a message, follow the money",
      source: "illustrative",
      caption: "Two flows through the backend, step by step. Illustrative of the architecture; no real messages, accounts or amounts.",
    },
    how: [
      { title: "Clear service boundaries", detail: "NestJS APIs with well-defined boundaries and database schemas behind the mobile app and the admin dashboard." },
      { title: "Real-time messaging", detail: "Chat and notifications built for live delivery, handling 10k+ messages a day." },
      { title: "Payments with Stripe Connect", detail: "Customer payments flow through Stripe Connected Account payment flows to vendors." },
      { title: "Event-driven async work", detail: "Asynchronous, event-driven workflows keep slow work off the request path." },
      { title: "Automated multi-tenant migrations", detail: "Schema and feature changes propagate safely across tenants through an automated migration system." },
    ],
    decisions: [
      {
        decision: "Event-driven async workflows",
        alternative: "Doing everything inside the request",
        why: "Kept data consistent and requests fast while the product grew.",
      },
      {
        decision: "Stripe Connected Accounts",
        alternative: "Collecting payments and paying vendors manually",
        why: "Marketplace payments with vendor accounts handled by Stripe instead of custom money movement.",
      },
      {
        decision: "Automated multi-tenant migrations",
        alternative: "Migrating tenants by hand",
        why: "Made schema and feature rollouts low-risk and repeatable across every tenant.",
      },
    ],
    outcomes: ["5k+ users on the marketplace.", "10k+ messages a day through real-time chat and notifications.", "Scalable growth with reliable data consistency and low-risk feature iteration."],
  },

  "mcp-evals": {
    tldr: [
      "An open-source harness that runs the same tasks across models and MCP servers, grades the results, and records every step.",
      "Measures task success, tool-selection accuracy, context tokens returned per tool call, steps, latency and cost.",
      "Milestone 1 is merged: the core runner, deterministic graders, an offline mock provider and fake MCP server, and the `run` CLI.",
    ],
    context: [
      "Everyone building MCP servers and agent tools claims their tool helps agents. Almost nobody measures it the same way twice.",
      "mcp-evals makes the comparison fair and repeatable: same tasks, same prompts, same limits, pinned models and fixtures, with every tool call traced. Its first headline comparison is NeatCode against a file-reading MCP server on the same code-navigation tasks.",
    ],
    role: "Author: design spec, architecture and implementation.",
    demo: {
      key: "eval-matrix",
      title: "The eval matrix",
      source: "sample",
      caption: "Sample data showing the shape of a run: tasks down the side, models across the top. Cells fill as the run replays; select one for its trace summary. Real results will replace this once the first full run lands.",
    },
    how: [
      { title: "Suites as YAML", detail: "Tasks, graders, servers and models are declared in a suite file, validated with zod, with pinned model IDs and fixture commits." },
      { title: "Fresh server per task", detail: "Every task run starts a fresh MCP server process and a fresh copy of the fixture, so runs can't affect each other." },
      { title: "Own agent loop on the MCP SDK", detail: "A minimal loop sends the prompt, executes tool calls over MCP, and stops at the step, time or budget limit." },
      { title: "Graders and recorder", detail: "Deterministic graders check answers and tool use; a recorder traces every model call, tool call and token count." },
      { title: "One results contract", detail: "A versioned results.json feeds the CLI, a GitHub Action regression gate, a public leaderboard and this portfolio." },
    ],
    decisions: [
      {
        decision: "Own agent loop on the official MCP SDK",
        alternative: "An agent framework or a plugin for an existing eval tool",
        why: "Full control of measurement and fairness; framework behaviour would muddy the numbers.",
      },
      {
        decision: "Deterministic graders first, LLM judge only when needed",
        alternative: "Judging everything with a model",
        why: "Cheap, reproducible checks wherever an answer can be verified; a pinned judge with a stored verdict only where it can't.",
      },
      {
        decision: "Infrastructure failures never count against a model",
        alternative: "Treating every failed run as a model failure",
        why: "Server crashes, rate limits and timeouts are retried and reported as an error rate, so rankings measure models, not flaky infrastructure.",
      },
    ],
    outcomes: [
      "Milestone 1 merged: runner, mock provider, fake MCP server, deterministic graders, and `run` printing a results table.",
      "Public repository: github.com/HITMANdark07/mcp-evals.",
    ],
    next: [
      "M2: real runs through OpenRouter with token and cost accounting, repeats with confidence intervals, `compare`, and the first NeatCode vs. filesystem run.",
      "M3: a GitHub Action with PR comments and a CI gate for NeatCode.",
      "M4–M5: a public leaderboard and the live embed on this page.",
    ],
  },
};

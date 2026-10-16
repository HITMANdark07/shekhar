import type { DemoSource } from "@/components/demos/demo-frame";
import siteGraph from "./generated/site-graph.json";

export type DemoKey = "neatcode-graph" | "gpu-queue" | "fleet-episode" | "genai-flow" | "ivorie-flows" | "eval-matrix" | "tenant-platform";

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
        detail: "Files and symbols become nodes; imports, calls, renders and containment become edges, each tagged EXTRACTED, INFERRED or AMBIGUOUS so the agent knows how much to trust it.",
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
        why: "Zero ops and local-first: the engine ships as an npm package, and the index is a single file in the repo's .neatcode/ folder.",
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
      `This portfolio indexed in ${siteGraph.stats.indexSeconds}s to power the demo above (${siteGraph.stats.files} linked files shown).`,
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
      "Live narration in, illustrated story panels out: someone tells a story and its characters and scenes are drawn as it unfolds.",
      "Each scene fans out across parallel GPU pods as competing candidates, rendered in about one job's time, with progress streamed live to the browser.",
      "Designed and built end to end: the Python FastAPI + Celery rewrite, the pod router, the live story pipeline and the AWS GPU deployment, with 115 tests.",
    ],
    context: [
      "The product turns a spoken story into illustrations in real time. Audio streams in (Hindi is translated to English on the fly), a language model decides which characters exist and what each scene shows, and image models draw character portraits and multi-character scene panels that stay consistent from panel to panel.",
      "The render tier is the hard part. ComfyUI workflows are heavy, long-running GPU jobs, nothing like a millisecond API call. The system needed one job per GPU at a time, several candidates per scene so the best one can be kept, progress people can actually watch, and a GPU fleet that can be switched on and off to control cost.",
    ],
    role: "Designed and built it: the architecture, the migration from a NestJS/BullMQ stack to Python FastAPI + Celery, the queue router and workers, the live story pipeline, and the AWS deployment and operations scripts.",
    demo: {
      key: "gpu-queue",
      title: "How each GPU is wired",
      source: "illustrative",
      caption:
        "Watch a request travel the real wiring: the FastAPI producer puts tasks on Redis queues, each Celery worker drains exactly one queue and drives exactly one ComfyUI GPU over HTTP and WebSocket, results land in MinIO and progress streams back to the client. Switch to a portrait request, step through the story pipeline, or run the render-queue simulation. Illustrative, not production data.",
    },
    how: [
      {
        title: "Stream the narration",
        detail: "The browser captures microphone audio with an AudioWorklet (16 kHz PCM) and streams it over a WebSocket to a FastAPI session; Sarvam's streaming API turns the speech, including Hindi, into English text.",
      },
      {
        title: "An LLM directs each scene",
        detail: "An utterance buffer flushes complete thoughts to a scene director (OpenAI gpt-4o-mini or a self-hosted Qwen3 on vLLM) that registers new characters and decides when a scene is ready to draw.",
      },
      {
        title: "The producer fans out",
        detail: "FastAPI writes job rows to PostgreSQL and dispatches Celery tasks: character portraits go to a single text-to-image queue, and each scene panel fans out as one candidate per image-to-image pod, each with its own seed and the characters' reference images.",
      },
      {
        title: "An in-flight-aware router",
        detail: "A Redis-backed router counts in-flight jobs per pod and orders pods least-busy first, rotating ties, so back-to-back requests land on different GPUs and adding a pod adds a candidate automatically.",
      },
      {
        title: "One job per GPU, never lost",
        detail: "Each Celery worker drives exactly one ComfyUI pod with concurrency 1, prefetch 1 and acks_late, so a crashed worker's job is redelivered rather than dropped. Reference images are deduplicated per pod by content hash, and results land in MinIO.",
      },
      {
        title: "Progress you can watch",
        detail: "Workers publish progress on Redis pub/sub; the API streams it to the browser over SSE and WebSocket events, multiplexing every candidate in a batch into one stream.",
      },
      {
        title: "A GPU fleet on AWS",
        detail: "A central EC2 instance runs the API and workers behind an ALB; four GPU instances on private subnets run only ComfyUI from a pinned AMI. Scripts start the fleet and warm every model, and on shutdown drain Celery before stopping the GPUs.",
      },
    ],
    decisions: [
      {
        decision: "One queue per pod, behind an in-flight-aware router",
        alternative: "One shared queue every worker pulls from",
        why: "A scene's candidates must land on different GPUs to render in parallel; per-pod queues make placement explicit, and the router keeps load even.",
      },
      {
        decision: "Concurrency 1, prefetch 1, acks_late",
        alternative: "Several workflows per GPU, acknowledged on receipt",
        why: "Heavy workflows compete for GPU memory, so one at a time keeps each job predictable; acknowledging late means a crash redelivers the job instead of losing it.",
      },
      {
        decision: "Fan candidates out in parallel",
        alternative: "Rendering one image at a time",
        why: "Three idle pods produce three options in about one job's wall-clock time, at three times the GPU cost, and the best one is kept.",
      },
      {
        decision: "Push progress over Redis pub/sub and SSE",
        alternative: "Clients polling job status",
        why: "People watch panels fill in live, and one batch stream carries every candidate.",
      },
      {
        decision: "Rewrite in FastAPI + Celery, keeping the schema",
        alternative: "Extending the NestJS/BullMQ stack",
        why: "The existing PostgreSQL schema and storage layout were preserved, and the new stack used its own Redis database, so the cutover could run alongside the old one.",
      },
      {
        decision: "GPU hosts run only ComfyUI",
        alternative: "Celery workers on every GPU machine (the earlier topology)",
        why: "GPU machines stay stateless, so the whole fleet can be started, warmed, drained and stopped by script to control cost.",
      },
    ],
    outcomes: [
      "A live narration-to-illustration pipeline: speech in, character portraits and scene panels out.",
      "Scene candidates rendered in parallel across GPU pods in about one job's time.",
      "Production on AWS: four 96 GB RTX PRO 6000 GPU instances behind a central API and worker host, started, warmed and drained by script.",
      "115 tests across the producer, the workers and the image-generation package.",
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
        "A synthetic episode on a GitHub-like environment. Each step pairs what the agent observed with what it did; the task-level reward arrives only when the environment confirms the task is complete.",
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
      "Real-time chat and notifications handling 10k+ messages a day over Socket.IO, with Redis-backed presence and push for offline users.",
      "Stripe Connect payments: milestone installments, scheduled invoices, and vendor payouts released after funds settle.",
    ],
    context: [
      "Ivorie is a three-sided marketplace. Couples planning a wedding look for vendors; recently married couples recommend the vendors they used and earn rewards; vendors get booked and paid.",
      "That makes the backend three products at once: a real-time messaging system between all three sides, a payments system that moves money between couples, the platform and vendors, and a fast-moving product that has to keep shipping safely across a mobile app, a web admin and a vendor portal.",
    ],
    role: "Designed and owned the backend architecture across NestJS APIs, an Expo React Native app and a Next.js admin dashboard.",
    demo: {
      key: "ivorie-flows",
      title: "Follow a message, follow the money",
      source: "illustrative",
      caption: "Two real flows from the codebase, step by step: how a chat message is delivered, and how a booking payment reaches a vendor. No real messages, accounts or amounts.",
    },
    how: [
      {
        title: "One monorepo, three apps",
        detail: "A Turborepo holds the NestJS API, the Expo app and the Next.js admin and vendor portal, sharing one Prisma database package and zod-typed contracts, so a schema change is type-checked everywhere at once.",
      },
      {
        title: "Real-time chat over Socket.IO",
        detail: "The gateway authenticates each socket with a JWT. Redis maps every user session to its live sockets and tracks presence, so delivery works across devices and outside any single process.",
      },
      {
        title: "Persist, then deliver",
        detail: "A message is written to PostgreSQL first. Online sessions receive it instantly; anyone offline gets an Expo push notification instead, and scheduled jobs send digest emails for messages left unread. Typing indicators and read receipts ride the same socket.",
      },
      {
        title: "Milestone payments on a schedule",
        detail: "Bookings are paid in milestones. Scheduled, timezone-aware jobs generate Stripe invoices ahead of due dates and send reminder and overdue emails, so nobody chases payments by hand.",
      },
      {
        title: "Payouts after settlement",
        detail: "Once ACH funds settle, scheduled transfers send each vendor's share to their Stripe Connect account, linked to the original charge, while the platform fee stays with the platform. Recommendation commissions are credited to recently married couples as in-app rewards they can cash out.",
      },
      {
        title: "The boring infrastructure",
        detail: "Auth0 with role guards for couples, vendors and admins; secrets loaded from AWS SSM; media uploaded straight to S3 through presigned URLs; templated email through SES and SMS through Twilio; and an automated multi-tenant migration system for safe schema and feature rollouts.",
      },
    ],
    decisions: [
      {
        decision: "Persist the message before delivering it",
        alternative: "Emitting first and saving afterwards",
        why: "The database is the conversation's source of truth, so every device and every offline user sees the same history.",
      },
      {
        decision: "Presence and session mapping in Redis",
        alternative: "An in-memory map inside the API process",
        why: "Who is online, and on which sockets, lives outside any one server process, which is what makes push-or-deliver decisions reliable.",
      },
      {
        decision: "Pay vendors from settled funds, linked to the source charge",
        alternative: "Paying out the moment a customer pays",
        why: "Bank (ACH) payments take time to settle; transferring only after settlement, and against the original charge, keeps payouts from outrunning the money.",
      },
      {
        decision: "Scheduled jobs for invoices and reminders",
        alternative: "Manual invoicing and follow-ups",
        why: "Installments, reminders and overdue notices run on the couple's timezone without anyone tracking dates by hand.",
      },
    ],
    outcomes: [
      "5k+ users on the marketplace.",
      "10k+ messages a day through real-time chat and notifications.",
      "Three apps (mobile, admin, vendor portal) shipping from one typed monorepo.",
      "Live: the iOS app is on the App Store, with the web experience and vendor sign-up at planwithivorie.com.",
    ],
  },

  "ai-apps-platform": {
    tldr: [
      "One backend platform for several consumer apps: a Go API and a TypeScript AI service shared by every app, with each tenant's data isolated by app ID.",
      "AI as a shared service: multi-provider LLM chat (OpenAI, Gemini, xAI) with RAG over pgvector, conversation memory, SSE streaming, and token and coin billing.",
      "Shipped with blue-green CI/CD on GitHub Actions: build, verify, health-check the idle slot, flip nginx, and roll back automatically on failure.",
    ],
    context: [
      "Every new consumer app, whether an AI character chat app or an Android payments app, needs the same plumbing: users and auth, subscriptions and plans, rate limits, notifications, AI billing, observability and a safe way to deploy. Rebuilding it per app is slow and multiplies the places things break.",
      "This platform builds it once. Apps plug in as tenants: they share the common modules and the AI service, add their own routes on top, and can never see each other's data.",
    ],
    role: "Lead developer (about 80% of 289 commits): the multi-tenant Go platform, the TypeScript AI service, and the CI/CD pipeline and server setup.",
    demo: {
      key: "tenant-platform",
      title: "Follow a tenant request · ship it",
      source: "illustrative",
      caption:
        "Two views of the real system. Follow a request from the AI companion app or NotifyPay through the shared middleware into its own tenant's data (or watch one without X-App-ID get rejected), then step through the production blue-green deploy, including what happens when a health check fails.",
    },
    how: [
      {
        title: "Tenant from the first byte",
        detail: "Every request carries X-App-ID. Middleware validates it against the apps table (cached in Redis), stores it in the request context, and rejects requests without one; only global admin routes are exempt.",
      },
      {
        title: "Isolation in the schema",
        detail: "Every table has an indexed app_id (except the root apps table and global admins), UUID keys and soft deletes, and every query filters by app_id. PostgreSQL through GORM, with SQL migrations.",
      },
      {
        title: "Shared modules, app-specific routes",
        detail: "Users, auth, subscriptions and notifications live once in common modules; each app (an AI companion app, NotifyPay) adds its own routes, handlers and YAML config on top. A new app is a new tenant, not a new backend.",
      },
      {
        title: "A middleware chain every app gets",
        detail: "Gin middleware for request IDs, OpenTelemetry tracing, logging tagged with the app ID, timeouts, panic recovery, JWT auth with sessions, Redis-backed distributed rate limiting with an in-memory fallback, and plan checks against cached subscription state.",
      },
      {
        title: "An AI service in TypeScript",
        detail: "Express with LangChain.js and LangGraph orchestrates OpenAI, Gemini and xAI models: RAG over documents stored in pgvector, memory extracted from conversations, replies streamed over SSE, and token quotas and coins enforced with Redis caching.",
      },
      {
        title: "Observable, and shuts down cleanly",
        detail: "OpenTelemetry traces, metrics and logs go to SigNoz, and every component stops in an ordered graceful shutdown.",
      },
      {
        title: "Blue-green CI/CD",
        detail: "GitHub Actions builds a static arm64 Go binary and the TypeScript service, uploads both into the idle slot with configs and migrations (verifying each upload), starts it, health-checks it, flips the current symlink and the nginx upstream, and rolls back automatically if anything fails. Dev deploys on every push to the dev branch; production deploys on demand.",
      },
    ],
    decisions: [
      {
        decision: "One shared schema with app_id on every row",
        alternative: "A database or schema per tenant",
        why: "One migration path and one connection pool serve every app, with isolation enforced at the door by middleware and in every query.",
      },
      {
        decision: "Go for the platform, TypeScript for AI",
        alternative: "One language for everything",
        why: "Each side uses the ecosystem it needs: a fast, typed Go core for the API, and TypeScript for LangChain.js, LangGraph and the provider SDKs.",
      },
      {
        decision: "Blue-green deploys behind a health-gated switch",
        alternative: "Restarting the service in place",
        why: "The new version runs and proves itself on the idle slot before nginx sends it a single request, and the previous slot stays on disk for an instant rollback.",
      },
      {
        decision: "Distributed rate limiting with an in-memory fallback",
        alternative: "Per-process limits only",
        why: "Limits hold across instances through Redis, and the API keeps protecting itself if Redis is unavailable.",
      },
      {
        decision: "A static arm64 binary built in CI",
        alternative: "Building on the server",
        why: "CI produces one self-contained, stripped binary that runs on the arm64 VM with no toolchain installed there.",
      },
    ],
    outcomes: [
      "Two apps on one backend: an AI companion app (Expo mobile + Next.js web) and NotifyPay (an Android app).",
      "Multi-provider AI with RAG, memory, streaming and billing, shared by every tenant.",
      "Blue-green deploys for both services: dev on every push, production on demand, with automatic rollback.",
    ],
  },

  "mcp-evals": {
    tldr: [
      "An open-source harness that runs the same tasks across models and MCP servers, grades the results, and records every step.",
      "Designed to measure task success, tool-selection accuracy, context tokens returned per tool call, steps, latency and cost (cost and real-model runs are planned for M2).",
      "Milestone 1 is merged: the core runner, deterministic graders, an offline mock provider and fake MCP server, and the `run` CLI.",
    ],
    context: [
      "MCP servers and agent tools are easy to claim value for and hard to compare: results depend on the model, the prompt, the limits and the task.",
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
      { title: "One results contract", detail: "A versioned results.json feeds the CLI today; a GitHub Action regression gate, a public leaderboard and this portfolio's embed are planned to read the same file." },
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

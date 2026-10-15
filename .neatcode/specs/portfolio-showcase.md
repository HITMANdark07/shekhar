# Portfolio refactor — Parts 2 + 3: Case studies and live demos

Status: building · 2026-10-15 · builds on `portfolio-foundation.md` (merged to `main`)

The user asked to "enhance it as much as you can so it looks cool, think creative; don't keep anything 'coming soon' — complete it or add more detail". This note records the design so the build stays honest.

## Principles (carried from the research)

- **Animation explains a system, never decorates.** Each project gets one small interactive model of how it works (Sam Rose / Ben Dicken style), inside the calm "ink & paper" shell.
- **Honesty labels.** Real data is labelled real ("This site, indexed by NeatCode"). Everything else is labelled *illustrative* or *synthetic*. No number appears that isn't on the résumé or measured from a real artefact.
- **Guardrails.** Client islands only for demos; server-rendered text and a static first frame (no CLS). Real `<button>`/`<input type="range">` controls. `prefers-reduced-motion` → demos start paused on a meaningful frame. Anything that auto-plays has a pause control. No new runtime dependencies.

## What gets built

| Project | Interactive model | Data |
|---|---|---|
| NeatCode | Code graph of **this website** built from NeatCode's own `graph.db`; click a file or pick a query ("who renders ProjectCard?") to light up its neighbours, like `query_graph` | **Real** — exported by `scripts/export-site-graph.py` from `.neatcode/graph.db` |
| GPU inference | Router feeding parallel per-pod queues with one job per worker; toggle pods, kill a pod and watch queued jobs reroute; live wait/throughput counters | Illustrative, seeded simulation (`lib/sim/gpu-queue.ts`) |
| Fleet | Scrub a synthetic agent episode on a mock GitHub UI: observation → action → reward, with cumulative-reward curve | Synthetic episode |
| Generative AI platform | "Life of a request" stepper: router → prompt orchestration → MCP web-search tool call → RAG retrieval → answer, each with a trace snippet | Illustrative trace |
| Ivorie | Two views: follow a chat message (client → WebSocket gateway → Postgres → fan-out → push) and follow a payment (Stripe Connect split) | Illustrative flow; no invented fee numbers |
| mcp-evals (new, *Building*) | Eval matrix: tasks × models cells fill from a replayed sample run | Sample data, labelled as such |

## Case studies (replaces "Full write-up coming soon")

Typed content in `content/case-studies.ts` (a TS registry, not MDX: no new build plugins, compile-time checked, testable). Sections per project: TL;DR, context, my role, how it works (ordered architecture steps), key decisions (decision / alternatives / why), outcomes (résumé numbers only), and what's next where a real roadmap exists (NeatCode README, mcp-evals milestones).

Work-project rationale ("why") is inferred from the résumé's own descriptions and flagged to the user for review before publishing.

## Visual upgrades

- Procedural SVG cover art per project (ink + cobalt motifs matching each demo), replacing the gradient placeholders until Nano Banana art exists.
- Home: featured NeatCode card embeds the real site graph; a "Now building" strip for mcp-evals.
- Subtle scroll reveals via CSS scroll-driven animations inside `@supports`, disabled under reduced motion.
- About: "Currently" section with dated, real facts.

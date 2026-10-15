# Portfolio refactor — Part 1: Foundation

Status: draft for review · 2026-10-15
Repo: `github.com/HITMANdark07/shekhar` · Next 16.2.4 · React 19.2.4

## 1. Goal

Rebuild Shekhar Kumar's portfolio so it reads as a **Senior Software Engineer, backend + AI infrastructure** in one 30-second recruiter scan, while laying the structure for creative, interactive project showcases later.

The refactor is split into three sub-projects, each with its own spec → plan → build cycle:

| Part | Scope |
|---|---|
| **1. Foundation (this spec)** | Accurate content model, design system, new home page, `/about`, `/projects`, stub case studies, `/terminal` easter egg, SEO, a11y, assets, static export + deploy |
| 2. Case studies | MDX bodies for each project (template: TL;DR, problem, constraints, role, architecture, decisions, results, next) |
| 3. Live demos | One interactive simulation per project (NeatCode graph, GPU queue router, Fleet episode scrubber, …), mounted in the `demo` slot defined here |

### Success criteria

- Every claim on the site matches the August 2026 résumé (`~/Desktop/mvp/apply/resume/src/ai-infra.html` / `backend.html`).
- Lighthouse Accessibility = 100 and SEO = 100 on `/`, `/about`, `/projects`, one `/projects/[slug]`.
- LCP < 2 s (mobile, simulated), CLS < 0.05.
- No horizontal scroll at 360 px; usable at 360 / 768 / 1280 px in both themes.
- Adding a project = one entry in `content/projects.ts` (+ optional cover image).
- `pnpm build` produces a fully static `out/` deployable to Vercel or Cloudflare Pages unchanged.

### Source of research

Decisions here come from two research reports produced on 2026-10-15 (refactor audit; animated-portfolio + stack research) and this brainstorming session.

## 2. Decisions locked in brainstorming

| Topic | Decision |
|---|---|
| Direction | Calm editorial shell now; live demos per project in Part 3 |
| Terminal theme | Removed as the UI. Kept only as `/terminal`, linked from the footer ("prefer a shell?") |
| Implementation | Rebuild in place in the existing Next 16 app (no starter kit, no Astro) |
| Visual system | **"Ink & paper"** — Instrument Serif display headings, Geist body, JetBrains Mono for eyebrows/metrics/tags, single cobalt accent. Light-first, dark supported |
| Hero | Text-only. Portrait lives on `/about` |
| Facts | Résumé is the single source of truth (see §4) |
| Contact | Email, GitHub, LinkedIn, résumé. **Phone/WhatsApp removed** |
| Generated assets | Nano Banana for decorative art only (project covers, OG background, monogram icon). **Never** for diagrams, screenshots, metrics visuals, or the portrait |
| Hosting | `output: 'export'`; deploy to the existing Vercel project; Cloudflare Pages remains a drop-in alternative |

## 3. Architecture

```
app/
  layout.tsx               fonts, metadataBase, title template, theme init script,
                           skip link, <SiteHeader/>, <main id="main">, <SiteFooter/>, JSON-LD Person
  page.tsx                 home (Server Component)
  about/page.tsx
  projects/page.tsx
  projects/[slug]/page.tsx generateStaticParams + dynamicParams = false; stub case study
  projects/[slug]/opengraph-image.tsx   per-project OG, rendered at build time
  terminal/page.tsx        easter egg (client island)
  opengraph-image.tsx      site OG, rendered at build time
  icon.svg  apple-icon.png  sitemap.ts  robots.ts  not-found.tsx
  globals.css              Tailwind v4 import + @theme tokens + base styles
components/
  site-header.tsx  site-footer.tsx  theme-toggle.tsx (client)  section.tsx
  featured-project.tsx  project-card.tsx  metric.tsx  badge.tsx  experience-list.tsx
  terminal/terminal.tsx (client)  terminal/commands.ts
content/
  site.ts  experience.ts  projects.ts  skills.ts
lib/
  projects.ts              getProjects(), getProject(slug), getFeatured()
  json-ld.ts               personJsonLd(site) → escaped JSON string
public/
  resume.pdf               rendered from résumé ai-infra variant
  about/portrait.webp      ~40 KB, from public/assets/shekhar.png
  projects/<slug>/cover.webp   Nano Banana art, decorative
tests/
  content.test.ts  build-output.test.ts
```

### Rules

- **All facts live in `content/`.** Pages, `/terminal` commands, metadata, sitemap and JSON-LD import from there. No literal facts in JSX.
- Pages are Server Components. Client JS on content pages is limited to `theme-toggle`. `/terminal` is the only other client island.
- `next.config.ts`: `output: 'export'`, `images: { unoptimized: true }`, `trailingSlash: false`. No `redirects`/`headers`/`rewrites` (unsupported by static export).
- Images are pre-sized WebP files rendered with `next/image` (`unoptimized`) or `<img>` with explicit `width`/`height`.
- Before writing each Next-specific file, read the matching guide in `node_modules/next/dist/docs/` (per `AGENTS.md`). Known 16.x points: `params` is a `Promise` (`const { slug } = await props.params`); use `PageProps<'/projects/[slug]'>`; `next/image` `priority` is deprecated (use `preload`/`fetchPriority`); `next lint` is removed (`"lint": "eslint"` stays).

### Removed

`app/components/BootOverlay.tsx`, `StatusBar.tsx`, `StatValue.tsx`, `HeroPrompt.tsx`; the old `app/page.tsx` markup; CRT/scanline/flicker/marquee/theme-variant CSS; the VT323 font; `public/{file,globe,next,vercel,window}.svg`; `public/assets/shekhar.png` (replaced by WebP); `public/assets/Shekhar_Kumar_Resume.pdf` (replaced by `public/resume.pdf`); the default `app/favicon.ico`; README boilerplate (replaced by a short project README).

`Terminal.tsx` and `terminalCommands.ts` move to `components/terminal/` and are rewritten to read from `content/` and to render text nodes instead of `dangerouslySetInnerHTML` HTML strings.

## 4. Content model and inventory

### Types (`content/projects.ts`)

```ts
export type ProjectKind = 'open-source' | 'work' | 'side';
export type ProjectStatus = 'shipped' | 'active' | 'building' | 'archived';

export interface Metric { value: string; label: string; howMeasured?: string }

export interface Project {
  slug: string;
  title: string;
  tagline: string;            // one outcome-focused line (cards)
  summary: string;            // ≤ 160 chars: meta description + OG text
  kind: ProjectKind;
  status: ProjectStatus;
  featured?: boolean;         // exactly one project is featured
  order: number;              // ascending sort
  period: { start: string; end?: string };   // 'YYYY-MM'
  role: string;
  org?: string;
  confidential?: boolean;     // shows "client details abstracted" note
  stack: string[];
  metrics: Metric[];          // first 3 shown on cards
  links?: { repo?: string; npm?: string[]; demo?: string; docs?: string };
  cover?: { src: string };    // decorative, rendered with alt=""
  diagram?: { src: string; alt: string };    // real diagrams only (Part 2)
  demo?: string;              // Part 3: key into a demo-component registry
}
```

`content/site.ts` holds name, role, tagline, sub-headline, location, email, GitHub, LinkedIn, résumé path, site URL. `content/experience.ts` holds `Employer { name, location, period, roles: { title, period }[], highlights: string[] }`. `content/skills.ts` holds grouped skill lists (no percentages).

### Inventory (facts from the résumé only)

**Site**
- Name: Shekhar Kumar · Role: Senior Software Engineer · Focus: Backend & AI infrastructure · Location: Bengaluru, IN
- H1: "I build the backend systems AI products run on."
- Sub: "4+ years shipping production systems in TypeScript, Go and PostgreSQL. Recently: NeatCode, GPU inference across pods, and Fleet for agent evaluation."
- Email: shekharkumar235838@gmail.com · GitHub: github.com/HITMANdark07 · LinkedIn: linkedin.com/in/shekhar-kumar1

**Projects (in order)**

| # | slug | Title | Kind / status | Metrics shown |
|---|---|---|---|---|
| 1 | `neatcode` (featured) | NeatCode | open-source / active · `@neatcodeai/cli` | 3.8 s for 131k LOC · < 300 ms queries · 3.8 s → 0.49 s incremental re-index · (also: 11 MCP tools, 12–60× less context vs grep-and-read, 510 tests, 3 npm packages) |
| 2 | `gpu-inference` | Distributed GPU inference pipeline | work / shipped · Pure Billion | None yet (résumé has no numbers) — card shows stack + description only |
| 3 | `fleet` | Fleet | work / shipped · led · Pure Billion | None yet — description: GitHub and Booking.com recreated as UI environments for agent evaluation and RL |
| 4 | `genai-platform` | Generative AI platform | work / shipped · Pure Billion | +25% response relevance (RAG) |
| 5 | `ivorie` | Ivorie | work / shipped · Pure Billion | 5k+ users · 10k+ messages/day · Stripe Connect |

Cards with no metrics render without the metrics row (no placeholder numbers). `stack` entries use only technologies the résumé ties to that project (e.g. GPU pipeline: ComfyUI, Docker, GPU pods, queues; Ivorie: NestJS, Expo React Native, Next.js, Stripe Connect, AWS). The GPU pipeline description keeps the résumé's "speech-to-image" framing.

**Experience**
- Pure Billion Technologies — Senior Software Engineer — Aug 2022 – present — Mumbai, IN · Remote. Highlights include LLM-assisted testing (+35% coverage) and weather.com A/B experiments.
- Invest With Tribe — Software Engineer I — Feb 2022 – Aug 2022 — Chandigarh, IN · Remote. Stocks platform, 1k+ users, AWS SQS + Twilio WhatsApp notifications.

**About page extras:** education (BCA, Techno Main Salt Lake, 2020–2023), achievements (Inc42 Top 30 Startups 2022 for EV Charging App; mentored 50+ students at PrepBytes), skills grouped as AI & ML / Languages / Backend / Data / Cloud / Frontend.

**Dropped (not on the résumé):** 99.9% uptime, 12 services, p50 420 ms, "4 fine-tuned models", 6000+ users, the four "eras" timeline, ID card, skill meters, coffee stat, fake "now" log, "no frameworks" footer.

## 5. Visual system ("Ink & paper")

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#fbfbf8` | `#101114` |
| `--surface` (cards) | `#ffffff` | `#17181c` |
| `--border` | `#e4e4de` | `#26272d` |
| `--fg` | `#111214` | `#ebebef` |
| `--fg-muted` (body secondary) | `#52525b` | `#a1a1aa` |
| `--fg-meta` (labels, captions) | `#60606a` | `#8f8f99` |
| `--accent` | `#1d4ed8` | `#8ab4ff` |
| `--accent-fg` (text on accent) | `#ffffff` | `#0a1630` |

- Fonts via `next/font/google`: Instrument Serif (400, display headings h1–h3 and card titles), Geist (400/500/600, body/UI), JetBrains Mono (400/500, eyebrows, metrics, tags, `/terminal`).
- Every text/background pair is verified ≥ 4.5:1 (body pairs target ≥ 7:1) by a contrast check during implementation. Any token failing is adjusted, and the table is updated.
- Type scale: body 15–16 px, meta ≥ 13 px, h1 clamp(2.25rem, 5vw, 3.25rem).
- Layout: single column, max-width 960 px content, 16 px side gutters on mobile; selected-work grid is 2 columns ≥ 768 px, 1 column below.
- Theme: `data-theme` on `<html>`; default follows `prefers-color-scheme`; toggle persists to `localStorage` (wrapped in try/catch). An inline `<head>` script applies the stored theme before first paint.
- Motion: none by default except hover/focus transitions ≤ 200 ms on `transform`/`opacity`/colour; disabled under `prefers-reduced-motion`.

## 6. Pages

**Home `/`** — header (name · Work · About · Résumé ↗ · theme toggle) → hero (mono eyebrow, serif H1, sub, CTAs: "NeatCode case study →", "Résumé", "Email") → **Featured** (wide NeatCode card: tag line, title, description, 3 metrics, links, static graph poster SVG in the slot Part 3 will replace) → **Selected work** (projects 2–5 as cards: cover, tag, title, tagline, stack, link to case study) → **Experience** (two-row compact list + "Full résumé ↗") → footer (email · GitHub · LinkedIn · "prefer a shell? → /terminal").

**`/about`** — portrait (WebP), short bio, full experience with highlights, skills by group, achievements, education.

**`/projects`** — all projects as cards with kind + status badges.

**`/projects/[slug]`** — stub case study: title, tagline, kind/status/role/period/org, metrics, stack, links, confidential note when set, "Full write-up coming soon" block. Static params from the registry; unknown slugs 404.

**`/terminal`** — existing terminal UX (help, about, skills, projects, contact, social, resume, clear; `sudo`/`coffee` jokes may stay) fed from `content/`; labelled input, `aria-live="polite"` output, no phone number, `noindex`.

**`not-found`** — short message + links home/projects.

## 7. SEO and metadata

- Root `metadata`: `metadataBase` (site URL from `content/site.ts`), `title: { default: 'Shekhar Kumar — Senior Software Engineer, Backend & AI Infrastructure', template: '%s — Shekhar Kumar' }`, description from site bio, Open Graph + Twitter card.
- `generateMetadata` per project from `summary`.
- `opengraph-image.tsx` (site) and `projects/[slug]/opengraph-image.tsx` rendered at build time with `next/og`; fonts read from local files. Verify PNGs exist in `out/`; if static export cannot emit them, fall back to pre-rendered PNGs in `public/og/` referenced from metadata.
- `sitemap.ts`, `robots.ts` (allow all; `/terminal` excluded from sitemap).
- JSON-LD `Person` (name, jobTitle, url, worksFor, address locality, `sameAs` GitHub + LinkedIn) in root layout, `<` escaped as `<`.

## 8. Assets

| Asset | Source | Spec |
|---|---|---|
| Portrait | `public/assets/shekhar.png` | resize to 640 px wide WebP, ≤ 60 KB, for `/about` |
| Résumé | `~/Desktop/mvp/apply/resume/SHEKHAR_KUMAR_ai_infra.pdf` | copied to `public/resume.pdf` |
| Project covers ×5 | Nano Banana | abstract, cobalt/ink palette, no text, no fake UI/diagrams; 1200×630 source → WebP ≤ 80 KB; `alt=""` |
| OG background | Nano Banana | same palette; name/role text overlaid by `next/og`, never baked into the image |
| Icon | hand-made SVG "SK" monogram (Nano Banana only for exploration) | `app/icon.svg` + 180 px `apple-icon.png` |

## 9. Error handling and edge cases

- Unknown project slug → `notFound()`; `dynamicParams = false` makes the build reject anything outside the registry.
- `localStorage` unavailable (private mode) → theme falls back to system preference; no errors thrown.
- No JavaScript → full content and navigation work; only the theme toggle and `/terminal` are inert.
- Project without metrics / links / cover → the corresponding UI is omitted, never shown empty.

## 10. Testing

- **vitest** (`tests/content.test.ts`): slugs unique and URL-safe; exactly one `featured`; `order` unique; `summary` ≤ 160 chars; every `metrics[].value` non-empty; every `cover.src`/`diagram.src` file exists in `public/`; no phone-number pattern anywhere in `content/`.
- **Build output** (`tests/build-output.test.ts`, runs after `pnpm build`): `out/` contains `index.html`, `about/`, `projects/`, every `projects/<slug>`, `terminal/`, `sitemap.xml`, `robots.txt`, OG images, `resume.pdf`.
- **Lint + typecheck**: `pnpm lint`, `tsc --noEmit`.
- **Browser (Playwright MCP)**: screenshots at 360/768/1280 in light and dark; reduced-motion emulation; keyboard-only pass (skip link, focus rings, toggle).
- **Lighthouse**: a11y/SEO = 100, LCP < 2 s, CLS < 0.05 on the four page types.
- **Fact check**: manual diff of rendered text against the résumé.

## 11. Out of scope for Part 1

MDX case-study bodies, architecture diagrams, interactive demos/simulations, Motion/d3/asciinema dependencies, `/writing`, `/now`, analytics, custom domain, Cloudflare migration.

## 12. Open items (non-blocking)

- Production site URL for `metadataBase` — default to the current Vercel URL (`https://shekhar-fawn.vercel.app`) until a custom domain exists.
- GPU pipeline and Fleet have no numbers on the résumé; Part 2 collects them (throughput, p95, env/task counts).

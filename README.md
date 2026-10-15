# shekhar — portfolio

Personal site of Shekhar Kumar, Senior Software Engineer (backend & AI infrastructure).

- **Stack:** Next.js 16 (App Router, static export), React 19, Tailwind CSS v4, TypeScript.
- **Content:** every fact lives in `content/` (`site.ts`, `experience.ts`, `about.ts`, `projects.ts`). To add a project, add one entry to `content/projects.ts`; optionally add `public/projects/<slug>/cover.webp`.
- **Design spec:** `.neatcode/specs/portfolio-foundation.md`.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit + render tests
pnpm test:build   # next build + checks on out/
pnpm lint && pnpm typecheck
```

`pnpm build` writes a fully static site to `out/`, deployable to Vercel or Cloudflare Pages.

# AGENTS.md — smart-job-applier

## Commands
- Use Bun as the package manager; the committed lockfile is `bun.lockb`.
- Dev server: `bun run dev` starts Next.js with Turbopack.
- Production check: `bun run build`.
- Focused verification: `bun run lint` and `bun run typecheck`.
- Formatting: `bun run format` only writes `**/*.{ts,tsx}`; it does not format CSS, JSON, or Markdown.
- No test runner is configured; do not claim tests ran unless you add/configure one.

## App Structure
- This is a single Next.js 15 App Router app, not a monorepo.
- Route entrypoint: `app/page.tsx` renders the landing page.
- Root layout: `app/layout.tsx` wires fonts, metadata, global CSS, and `components/theme-provider.tsx`.
- API routes live under `app/api/...` and use Next.js Route Handlers (`route.ts`).
- Backend logic is in `services/`, `models/`, and `lib/`.

## Styling And UI
- Tailwind CSS v4 is configured through `app/globals.css` and `@tailwindcss/postcss`; there is no `tailwind.config.*`.
- shadcn is configured by `components.json` with style `radix-mira`, icon library `tabler`, CSS variables enabled, and aliases such as `@/components`, `@/components/ui`, and `@/lib/utils`.
- Prefer shadcn UI components from `@/components/ui`; add new ones with the shadcn CLI instead of hand-rolling common primitives.
- Use `@/lib/utils` `cn()` for class merging.
- Use `@tabler/icons-react` for icons. Do not introduce emoji icons or inline SVGs unless a required brand asset has no Tabler equivalent.
- Theme switching uses `next-themes` with `class` on `<html>`.

## Conventions
- TypeScript is strict and uses `@/*` as an alias to the repository root.
- Avoid `any`; model data with explicit interfaces/types in the feature area or a shared module when reused.
- Keep feature code grouped by feature where possible.
- Prettier settings are 2 spaces, no semicolons, double quotes, trailing commas where valid, and LF line endings.

## Tech Stack
- **Frontend:** Next.js 15 App Router, React 19, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js API Routes, Mongoose (MongoDB)
- **AI:** Anthropic Claude (resume classification, ATS scoring, document generation)
- **Job Sources:** Adzuna API, JSearch API (RapidAPI), LinkedIn public job scraping (cheerio)
- **Package Manager:** Bun

## Important Notes
- Environment variables are defined in `.env.example`. Never commit real secrets.
- `lib/db.ts` uses a singleton Mongoose connection pattern for Next.js.
- Auth is JWT-based; token stored in `localStorage` and sent via `Authorization: Bearer` header.
- Resume parsing supports PDF and DOCX via `pdf-parse` and `mammoth`.
- The old React/Vite/Express code is archived in `.legacy/`.

## How to Run
1. `bun install`
2. Copy `.env.example` to `.env` and fill values (MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY).
3. `bun run dev`

## Agent Rules
- Do not install new dependencies unless necessary; prefer built-ins or existing stack.
- Keep API routes thin; business logic lives in `services/`.
- Always preserve `.env.example` when adding new env vars.
- Run `bun run build` before committing to ensure it compiles.

# AGENTS.md — smart-job-applier

## Commands
- Use Bun as the package manager; the committed lockfile is `bun.lock`.
- Dev server: `bun run dev` starts Next with Turbopack.
- Production check: `bun run build`.
- Focused verification: `bun run lint` and `bun run typecheck`.
- Formatting: `bun run format` only writes `**/*.{ts,tsx}`; it does not format CSS, JSON, or Markdown.
- No test runner is configured; do not claim tests ran unless you add/configure one.

## App Structure
- This is a single Next.js App Router app, not a monorepo.
- Route entrypoint: `app/page.tsx` renders `features/landing-page/pages/landing-page.tsx`.
- Root layout: `app/layout.tsx` wires fonts, metadata, global CSS, and `components/theme-provider.tsx`.
- Landing-page sections live under `features/landing-page/components/`; shared landing types/hooks/utils live beside them in `features/landing-page/`.
- The `features/landing-page/api/` files are placeholders returning empty arrays; visible landing content is currently hard-coded in components.

## Styling And UI
- Tailwind CSS v4 is configured through `app/globals.css` and `@tailwindcss/postcss`; there is no `tailwind.config.*`.
- shadcn is configured by `components.json` with style `radix-mira`, icon library `tabler`, CSS variables enabled, and aliases such as `@/components`, `@/components/ui`, and `@/lib/utils`.
- Prefer shadcn UI components from `@/components/ui`; add new ones with the shadcn CLI instead of hand-rolling common primitives.
- Use `@/lib/utils` `cn()` for class merging; Prettier is configured to sort Tailwind classes in `cn` and `cva` calls.
- Use `@tabler/icons-react` for icons. Do not introduce emoji icons or inline SVGs unless a required brand asset has no Tabler equivalent.
- Theme switching uses `next-themes` with `class` on `<html>`; `ThemeProvider` also binds the `d` key as a light/dark hotkey outside typing fields.

## Conventions
- TypeScript is strict and uses `@/*` as an alias to the repository root.
- Avoid `any`; model data with explicit interfaces/types in the feature area or a shared module when reused.
- Keep feature code grouped by feature, following `features/landing-page/{components,pages,hooks,utils,api}` rather than spreading feature-specific files into global folders.
- Prettier settings are 2 spaces, no semicolons, double quotes, trailing commas where valid, and LF line endings.
- Client-only landing interactions use `'use client'`, `useScrollAnimation()`, `.animate-on-scroll`, and `staggerDelay()`; keep new scroll-animated sections consistent with that pattern.

## Skills
- Before frontend design work, load the `frontend-design` skill from `anthropics/skills`; if missing, install with `npx skills add anthropics/skills@frontend-design -g -y`.
- Before React/Next implementation work, load `vercel-react-best-practices` from `vercel-labs/agent-skills`; if missing, install with `npx skills add vercel-labs/agent-skills@vercel-react-best-practices -g -y`.
- Before shadcn/UI work, load the `shadcn` skill from `shadcn/ui`; if missing, install with `bunx --bun skills add shadcn/ui -g -y`.

# Project Map: Corgi Butt

_Last updated: 2026-10-26_

## Overview
- **Project Type**: Next.js 15 (App Router) web app, React 19 + TypeScript
- **Purpose**: A household chore/maintenance tracker. Users organize their home into Rooms → Areas → Tasks, each task has a recurrence frequency, and a weighted status system rolls task completion up into Area and Room "health" indicators (complete/soon/due/overdue).
- **Tech Stack**: Next.js 15 (Turbopack), React 19, TypeScript, Tailwind CSS 4, Supabase (auth + Postgres backend), Framer Motion, react-rnd (drag/resize for floorplan view), lucide-react icons.

## Directory Structure
```
corgi-butt/
├── config/              # App-wide config (theme)
├── public/              # Static assets (images, icons)
├── src/
│   ├── app/             # Next.js App Router pages & layouts
│   ├── components/      # Shared UI components & v2 design system + custom icon sets
│   ├── hooks/           # React hooks
│   ├── lib/             # Supabase client, misc utils
│   ├── types/           # Shared TS types (floorplan/Room/Area/Task)
│   └── utils/           # Status-calculation logic (task/area/room) + icon config
├── node_modules/         # Dependencies (excluded from scan)
├── .next/, out/          # Build output (excluded from scan)
└── [config files at root: next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs]
```

## Key Files
- **package.json** — Next.js 15 app, scripts: `dev`/`build` (both use `--turbopack`), `start`, `lint`
- **next.config.ts** — Disables image optimization only in production (`images.unoptimized`)
- **tsconfig.json** — Path alias `@/*` → `src/*`; includes specific dynamic route pathing
- **README.md** — Documents the status-calculation cascade and icon-adding conventions
- **.env.local** — Contains Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, etc.)

## Dependencies (grouped)
### UI / Components
- framer-motion — animations
- lucide-react — icon set
- react-rnd — draggable/resizable elements (used in floorplan grid view)
- clsx, tailwind-merge — className/variant utilities

### Data / Backend
- @supabase/supabase-js — Supabase client

### Dev tooling
- typescript, eslint + eslint-config-next — linting/types
- tailwindcss 4 + @tailwindcss/postcss, autoprefixer — styling pipeline
- @svgr/cli — SVG → React component generation

## Source Structure
- **`src/app/`** — Route-based pages:
  - `page.tsx` — Landing page; redirects to `/dashboard` if authenticated, otherwise leads to `/login`
  - `layout.tsx` — Root layout; loads fonts and navigation context
  - `dashboard/` — Main dashboard view (room/area/task hierarchy, health indicators)
  - `login/`, `create-account/` — Custom authentication flows
  - `calendar-view/` — Filterable task feed/list using Postgres RPC (`get_user_tasks_with_tags`)
  - `floorplan/` — Interactive floorplan layout with draggable/resizable elements via `react-rnd`
- **`src/components/`** — Shared UI components, v2 component architecture, icon sets, and interactive modals.
- **`src/utils/`** — Status calculation utilities (`areastatus.ts`, `roomstatus.ts`, `taskstatus.ts`), icon configurations.
- **`src/lib/`** — Supabase browser/server client initialization and helper utilities.

## Notable Patterns & Architecture
- **Status Cascade**: Tasks have recurrence rules and override status flags (`forced_marked_incomplete`, `forced_completion_status`). Task statuses roll up into Area statuses, which roll up into Room statuses.
- **Custom Auth**: Hand-built form authentication calling `supabase.auth.signInWithPassword` and `signUp` directly in login/create-account pages.
- **Status Mode & Interactions**: Interactive modes allowing manual status overrides, long-press-to-complete gestures (`CardContainer`), and multi-purpose modal forms for creating/editing rooms, areas, and tasks.

## Open Questions / Gaps
- Review any remaining edge cases on advanced area detail routes or Supabase RPC integrations.

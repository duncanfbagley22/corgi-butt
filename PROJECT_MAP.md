# Project Map: Corgi Butt

_Last updated: 2026-06-20_

## Overview
- **Project Type**: Next.js 15 (App Router) web app, React 19 + TypeScript
- **Purpose**: A household chore/maintenance tracker. Users organize their home into Rooms → Areas → Tasks, each task has a recurrence frequency, and a weighted status system rolls task completion up into Area and Room "health" indicators (complete/soon/due/overdue).
- **Tech Stack**: Next.js 15 (Turbopack), React 19, TypeScript, Tailwind CSS 4, Supabase (auth + Postgres backend), Radix UI primitives, Framer Motion, react-rnd (drag/resize for floorplan view), lucide-react icons.

## Directory Structure
```
corgi-butt/
├── config/              # App-wide config (theme)
├── public/              # Static assets (images, icons)
├── src/
│   ├── app/             # Next.js App Router pages & layouts
│   ├── components/      # Shared UI components + custom icon sets
│   ├── hooks/           # React hooks (useAuth)
│   ├── lib/             # Supabase client, misc utils
│   ├── types/           # Shared TS types (floorplan/Room/Area/Task)
│   └── utils/           # Status-calculation logic (task/area/room) + icon config
├── .github/              # GitHub config (CI/workflows, not deeply scanned)
├── node_modules/         # Dependencies (excluded from scan)
├── .next/, out/          # Build output (excluded from scan)
└── [config files at root: next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs, components.json]
```

## Key Files
- **package.json** — Next.js 15 app, scripts: `dev`/`build` (both use `--turbopack`), `start`, `lint`
- **next.config.ts** — Disables image optimization only in production (`images.unoptimized`)
- **tsconfig.json** — Path alias `@/*` → `src/*`; notably includes a specific dynamic route path explicitly in `include`
- **README.md** — Mostly boilerplate create-next-app text, but has a **critical "Current setup" section** documenting the status-calculation cascade (see Notable Patterns below) and icon-adding conventions
- **notes.txt** — Scratch notes describing an *earlier/alternate* version of the status-weighting scheme (item → subsection → room, different thresholds than what's actually implemented — see Open Questions)
- **.env.local** — Contains `NEXT_PUBLIC_SUPABASE_URL` and (per `supabase.ts`) `NEXT_PUBLIC_SUPABASE_ANON_KEY` (values not read/recorded)

## Dependencies (grouped)
### UI / Components
- @radix-ui/react-dialog, react-label, react-slot — accessible primitives (used via components.json, likely shadcn-style setup)
- framer-motion — animations
- lucide-react — icon set
- react-rnd — draggable/resizable elements (used in floorplan grid view)
- class-variance-authority, clsx, tailwind-merge — className/variant utilities

### Data / Backend
- @supabase/supabase-js, @supabase/ssr — Supabase client + SSR helpers
- @supabase/auth-ui-react, @supabase/auth-ui-shared — prebuilt auth UI (may or may not be actively used — worth checking login2/create-account pages)

### Dev tooling
- typescript, eslint + eslint-config-next — linting/types
- tailwindcss 4 + @tailwindcss/postcss, autoprefixer, tw-animate-css — styling pipeline
- @svgr/cli — SVG → React component generation (matches the custom icon folders pattern)

## Source Structure
- **`src/app/`** — Route-based pages:
  - `page.tsx` — Landing page; redirects to `/dashboard2` if already authenticated, otherwise shows a "Get Started" CTA → `/login2`
  - `layout.tsx` — Root layout; loads Geist/Geist Mono/Poppins fonts, wraps app in `NavigationProvider`
  - `template.tsx` — (not read in detail — likely page-transition wrapper, common Next.js pattern)
  - `dashboard2/` — Main app, **the active dashboard version** (name implies a `dashboard` v1 may have existed/been replaced)
    - `page.tsx` — Lists all Rooms in grid or list view, handles add/edit/delete room, computes per-room status via `getRoomStatusFromAreas`
    - `[roomId]/page.tsx` — Lists Areas within a Room. Same CRUD + edit-mode pattern as the rooms list. Fetches statuses via `getMultipleAreaStatuses`, sorts areas overdue-first. Has its own local `getAreaStatusColor` (3rd copy of the same status→color switch, see Notable Patterns)
    - `[roomId]/areas/[areaId]/page.tsx` — Lists Tasks within an Area. Same CRUD/edit-mode pattern, plus two extra features not seen elsewhere:
      - **Status Mode**: a third FAB action (`UndoDot` icon) that lets the user cycle each task through a manual status override (default → soon → due → overdue) by tapping, shown as a pill badge, then bulk-saves all overrides to `forced_marked_incomplete`/`forced_completion_status` on "done"
      - **Long-press to complete**: tasks support a press-and-hold gesture (via `CardContainer`'s `enableLongPress`/`onLongPress`) as a faster alternative to opening the task detail page
      - Has its own 4th copy of the status→color switch (`getStatusColor`) plus a 2nd switch for override-pill colors (`getForcedPillStatusColor`)
    - `[roomId]/areas/[areaId]/tasks/[taskId]/page.tsx` — Task detail/read view: name, description, frequency (formatted as Daily/Weekly/Bi-weekly/Monthly/Quarterly/"Every N days"), last completed date + by whom, tags, and current status. Single edit FAB opens the same shared `Modal` in edit mode. Fetches "last completed by" user's display name separately. Computes status client-side via `getTaskStatusFromData`
  - `login2/page.tsx` — Custom email/password sign-in form using `supabase.auth.signInWithPassword` directly (no `@supabase/auth-ui-react` involved). "Forgot password" button always shows a generic success message regardless of whether reset actually sends anything (see Notable Patterns/bugs)
  - `create-account/page.tsx` — Custom sign-up form using `supabase.auth.signUp` with first/last name in user metadata; redirects to `/login2` on success
  - `calendar-view/page.tsx` — Actually a **task list/feed view** (not a calendar UI), filterable by status (daily/soon/due/overdue) and by room/tag/assignee via `FilterTaskSidebar`. Pulls tasks through a Postgres RPC (`get_user_tasks_with_tags`) rather than a direct table query — the only page that does this. Handles inline task completion with a dissolve animation + toast. Linked from dashboard's NavBar via a ListTodo icon button
  - `contexts/NavigationContext.tsx` — App-wide navigation context, wraps the whole app in `layout.tsx`
- **`src/components/`**
  - `v2/` — Main component library, organized by type:
    - `headings/` — `PageTitle`, `TextDisplay` (icon + label/value row, used heavily on the task detail page), `TagDisplay`
    - `images/` — `LandingImage`
    - `other/` — `Loader`, `MainBackground`, and the floorplan/grid-view system: `Floorplan2` (grid canvas) → `RoomGrid2` (maps `RoomData[]` to positioned rooms) → `Room2` (individual draggable/resizable room box, almost certainly built on `react-rnd` per the dependency list — not read in full, but its props match react-rnd's drag/resize callback shape used by `handleUpdate` in `dashboard2/page.tsx`)
    - `ui/buttons/` — `PrimaryButton`, `IconButton`, `ChevronButton`, `FloatingActionButton` (the multi-option FAB used on every list page), `CalendarSelect` (status-filter pill selector used in `calendar-view`)
    - `ui/cards/` — `CardContainer` (the shared card shell powering **all** room/area/task grid cards — owns the press/hover/edit-wiggle/delete-button behavior), `CardInfo`, `CardText`, `TaskCard` (a distinct, more detailed card used only in `calendar-view`)
    - `ui/inputs/` — `Input`, `Dropdown`, `FrequencySelector` (day-count picker feeding the task frequency field)
    - `ui/modals/` — `Modal` (the single shared add/edit modal for all three levels: room/area/task — see Notable Patterns), `ProfileSideBar`, `FilterTaskSideBar` (room/tag/assignee filter UI for `calendar-view`)
    - `ui/navigation/` — `NavBar`
  - `icons/custom/` — Generated SVG icon components split into `room-icons/`, `area-icons/`, `task-icons/` (paired with `iconConfig.ts` and the README's icon-adding workflow)
- **`src/lib/`**
  - `supabase/supabase.ts` — Single Supabase client instance, reads URL/anon key from env
  - `getIconComponent.ts` — Icon resolution helper (separate from the inline version duplicated in `dashboard2/page.tsx`)
  - `utils.ts` — Generic helpers (likely `cn()` className merger, not read in detail)
- **`src/hooks/useAuth.ts`** — Fetches authenticated user + profile row from `users` table; redirects to `/login2` on failure
- **`src/types/floorplan.ts`** — Core domain types: `Task`, `Area`, `RoomData`, plus `CustomIcons` (merged icon exports) and `IconOption`
- **`src/utils/`** — **The core business logic of the app**, see Notable Patterns below:
  - `taskstatus.ts` → `areastatus.ts` → `roomstatus.ts` (each layer imports/depends on the one below it)
  - `iconConfig.ts` — Maps icon names to components per section (room/area/task)

## Entry Points
- App entry: `src/app/page.tsx` (landing) → `/login2` (auth) → `/dashboard2` (main app)
- Each Room → `/dashboard2/[roomId]` → Areas → `/dashboard2/[roomId]/areas/[areaId]/tasks/[taskId]`
- Supabase client singleton: `src/lib/supabase/supabase.ts`, imported throughout `app/` and `utils/`

## Configuration & Environment
- **Env vars** (names only): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **`config/theme.ts`** — Central theme/color config, imported by pages for `theme.colors.*` (primary, secondary, accent, background, cardGreen/Yellow/Red/DarkRed/White — these map directly to status colors)
- **`components.json`** — Present, suggests shadcn/ui-style component scaffolding conventions even though not all UI is shadcn

## Notable Patterns / Conventions
- **Three-tier weighted status cascade** (the most important domain logic, lives in `src/utils/`):
  1. **Task status** (`taskstatus.ts`): based on `(today - last_completed) / frequency` as a %, compared against thresholds (complete ≤75%, soon ≤90%, due ≤95%, else overdue). Tasks with `frequency > 60` days get a relaxed "complete" threshold of 85%. A `forced_completion_status` + `forced_marked_incomplete` flag can override the calculation entirely. Never-completed tasks return `"neutral"`.
  2. **Area status** (`areastatus.ts`): averages task statuses using weights (complete=1.0, soon=0.75, due=0.5, overdue=0.0, neutral=0.5), then compares the resulting % against area thresholds (complete ≥90%, soon ≥70%, due ≥40%, else overdue).
  3. **Room status** (`roomstatus.ts`): same pattern one level up — averages *area* statuses (same weight values) against the same threshold shape (90/70/40).
  - ⚠️ **`notes.txt` describes a different, older scheme** (item/subsection/room terminology, different thresholds: done@75%, soon 75–85%, due 85–100%, overdue >100%; status weights done=1/soon=.9/due=.5/overdue=.4). This does **not** match the current code — treat `notes.txt` as stale/historical, not authoritative.
- **Naming convention**: Several routes/files carry a `2` suffix (`dashboard2`, `login2`, `Floorplan2`, `RoomGrid2`, `CardInfo`/`CardText`/`CardContainer` under `v2/`) — indicates a full redesign layer living alongside (or replacing) an original version. No `dashboard` (v1) route currently exists in `src/app/`, so v2 appears to be the sole active version.
- **Icon system**: SVGs generated into component form per-section (`room-icons/`, `area-icons/`, `task-icons/`), registered in `iconConfig.ts`, and merged into one `CustomIcons` object in `types/floorplan.ts`. Adding an icon requires touching 3 places (README documents this).
- **Status → color mapping is duplicated three times**: `getRoomStatusColor` in `dashboard2/page.tsx`, `getAreaStatusColor` in `dashboard2/[roomId]/page.tsx`, and presumably a task-level equivalent feeding `TaskCard` in `calendar-view/page.tsx`. All three switch on the same five status values with the same theme colors — a strong candidate for extracting into one shared `getStatusColor(status)` helper in `src/lib/` or `src/utils/`.
- **Auth is fully custom**, not using the installed `@supabase/auth-ui-react`/`auth-ui-shared` packages. `login2/page.tsx` and `create-account/page.tsx` call `supabase.auth.signInWithPassword` / `signUp` directly with hand-built forms. The auth-ui dependencies appear to be **unused dead weight** — candidate for removal unless something elsewhere depends on them.
- **Possible bug**: in `login2/page.tsx`, `handleResetPassword` always sets `"If this email exists, a reset link has been sent."` without actually calling any Supabase password-reset method (no `resetPasswordForEmail` call) — the button currently does nothing but display a false-positive message.
- **`calendar-view` is misleadingly named** — it's a filterable task list/feed, not a calendar UI. It's also the only page using a Postgres RPC (`get_user_tasks_with_tags`) instead of direct table queries, likely because it needs a joined view across rooms/areas/tags that's awkward to express via Supabase's nested select syntax elsewhere in the app.
- **`Modal` is a single shared component for room/area/task add+edit**, branching internally via the `level` prop (`"room" | "area" | "task"`) — only the `task` branch renders Room/Area dropdowns, description, tags, and frequency fields. It also owns its own tag-fetching, icon carousel (+ "view all" sub-modal), and a 14-character name limit with a custom tooltip warning. This is a large, multi-purpose component — changes to one level's form risk affecting the others since they share so much state/layout.
- **Possible bug**: `Modal`'s tag-fetch query uses `.eq("household.users.id", currentUserId)` on a query that nested-selects through `household:household_id → users`. This relies on Supabase/PostgREST's embedded-resource filtering working as written; if the relationship/embed isn't configured to support filtering on a doubly-nested field this way, the tag dropdown could silently return no tags. Worth verifying against actual Supabase behavior if tag selection seems broken for some users.
- **Status Mode** (in `[areaId]/page.tsx`) is a distinct interaction from the Edit Mode wiggle-and-delete pattern used elsewhere: it lets a user manually force a task's status (overriding the frequency-based calculation) by cycling default→soon→due→overdue per task, with changes only persisted when the mode is exited (via the cancel/done button on the FAB). This directly writes to the same `forced_marked_incomplete`/`forced_completion_status` fields that `taskstatus.ts` checks first — so Status Mode is the primary way those override fields get set in the UI.
- **Long-press-to-complete** is a reusable gesture built into `CardContainer` (400ms delay + 1000ms hold, with a circular progress ring and optional toast), used on task cards in `[areaId]/page.tsx` as a quick-complete shortcut alongside the normal tap-to-navigate behavior.

## Open Questions / Gaps
- `notes.txt` conflicts with the implemented thresholds in `utils/` — confirm whether it's obsolete or whether the code needs to be reconciled with it.
- Not yet mapped in detail: `src/app/dashboard2/[roomId]/areas/[areaId]/**` (area detail + task list/detail pages), and all `components/v2/ui/*` subfolders (buttons, cards, inputs, modals, navigation — names suggest standard pieces, but internals unconfirmed).
- `.github/` workflows not inspected — unclear if there's CI/CD configured.
- Confirm whether `handleResetPassword` in `login2/page.tsx` is an intentional stub (e.g. feature flagged off) or an unfinished/broken feature before relying on it.

# Mana Advisory · Executive Dashboard

A custom JavaScript management dashboard for the Mana Advisory Group, integrating Jira, Zoho Books, and a Postgres+Redis backend, with a brand-matched UI (Pearl & Champagne / Onyx Gold themes).

## Stack

- **Next.js 15** (App Router) + **React 18** + **TypeScript** + **Tailwind**
- **Auth.js v5** with credentials provider (bcrypt) + Drizzle adapter
- **Postgres** (Neon/Supabase/Railway) via **Drizzle ORM**
- **Upstash Redis** for caching + Zoho token storage
- **@dnd-kit** for drag-and-drop kanban with Jira write-back
- **Recharts** + custom Framer Motion animations
- **SheetJS (xlsx)** + **@react-pdf/renderer** for exports
- **Inngest** + **Hono** for background sync jobs

## Quick start (guest mode demo — no setup)

```bash
pnpm install
NEXT_PUBLIC_GUEST_MODE=true pnpm dev
```

Open http://localhost:3000 — you'll get a read-only super-admin view with mock data.

## Full setup (production)

1. Copy `.env.example` → `.env.local` and fill in:
   - `DATABASE_URL` — Postgres connection
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`
   - `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ORG_ID`
   - `CRON_SECRET` — random string for cron-protected endpoints

2. Push schema and seed:
   ```bash
   pnpm db:push
   pnpm db:seed
   pnpm db:provision    # generates passwords for all 17 users — SAVE THE OUTPUT
   ```

3. Trigger an initial sync:
   ```bash
   pnpm sync:jira
   pnpm sync:zoho
   ```

4. Deploy to Railway:
   ```bash
   railway up
   ```

## People (17 employees)

All employees from the business cards are pre-seeded with roles, modules, and permissions. See `src/lib/mock-data.ts`.

| Person | Role | Module |
|---|---|---|
| MM (Mohammad Al Mazrooei) | Chairman & MD · super_admin | Mana |
| Nash | Group COO · super_admin | Mana |
| Aaraiz Faisal | BD Manager · manager | Marine (KHA) |
| Charles Bas | BD Manager · manager | Interior (Suofeiya) |
| Sunil Kumar | Group Financial Manager · admin | Engineering (Jupiter) |
| Mohammed Ghally | Senior SWE · admin (Mana) | Mana |
| Merlyn Francis | SWE | Mana |
| + 10 more employees | various | various |

## Permissions

- **super_admin** (MM, Nash): everything across all modules.
- **admin**: scoped to specific modules (`scopedModules`).
- **manager**: own module only.
- **employee**: own assigned tasks in own module only.
- **Guest mode**: read-only super-admin view (no auth) for demos.

## Modules / verticals

- **Marine** — KHA Marine (Fiberglass / Steel)
- **Interior & Fitout** — Montaigne, Suofeiya, Buildtech, DNAKE
- **Mana** — Real Estate / Consulting / Back Office
- **Engineering** — Jupiter Engineering (Civil / MEP / Structural)

## Data structures (real, integrated)

Located in `src/lib/ds/`. Not toys — each one powers a real feature:

- **DoublyLinkedList** → foundation for the LRU cache.
- **SinglyLinkedList** → FIFO queue for the sync pipeline (recursive reverse() for event replay).
- **LRUCache** (`src/lib/cache/memory-cache.ts`) → O(1) get/set with TTL, in front of Redis.
- **Trie** → prefix-search autocomplete in the task search bar.
- **MinHeap + topK()** → stale-task detection (7+ days idle) and top-K workload ranking.
- **SegmentTree** → O(log n) range-sum queries for revenue analytics.

## Exports

- `GET /api/export/tasks` — multi-sheet XLSX (Tasks / Employees / Financials / Revenue Trend).
- `GET /api/export/dashboard` — branded executive PDF.
- `GET /api/export/employee/[id]` — per-employee performance PDF.

## Sync endpoints

- `POST /api/jira/sync` (cron) — incremental Jira pull via `updated >= <last>` JQL.
- `POST /api/jira/webhook` — webhook receiver, triggers incremental sync.
- `POST /api/zoho/sync` (cron) — monthly Zoho P&L → financial_snapshot.

Protect cron endpoints with `X-Cron-Secret: $CRON_SECRET` header.

## Themes

- **Pearl & Champagne** (light, default): cream + warm gold; readable in daylight on MM's phone.
- **Onyx Gold** (dark): matches the Mana business cards exactly.

Toggle via the moon/sun icon in the header. Persists in `localStorage`.

## Open items (from the meeting)

1. Final column names for Kanban (currently: Lead → To Do → In Progress → Finished).
2. Confirm Auth.js v5 (chosen here; alternatives: Clerk, custom JWT).
3. Merlyn's capacity for v1.
4. Delivery timeline.
5. Real Jira project keys (assumed `MAR`/`INT`/`MAN`/`ENG` — change in `src/lib/jira/client.ts:mapProject`).
6. Real Zoho org ID + which 3 of ~15 metrics to surface (defined by Sunil).
7. Password rotation flow on first login (currently: provision script prints plaintext).

## Scripts

```bash
pnpm dev               # next dev
pnpm build             # production build
pnpm start             # production server
pnpm typecheck         # tsc --noEmit
pnpm db:push           # push schema to Postgres
pnpm db:studio         # Drizzle studio
pnpm db:seed           # seed 17 employees
pnpm db:provision      # generate bcrypt passwords
pnpm sync:jira         # one-off Jira sync
pnpm sync:zoho         # one-off Zoho sync
```

# FLOW Rebaseline System Decisions

Status: REBASELINE AUTHORITY

Decision vocabulary:

- `KEEP` — current implementation remains authoritative with normal hardening.
- `SALVAGE` — retain useful code/data model but change integration or ownership boundaries.
- `REWRITE` — replace capability authority while preserving useful UI/domain knowledge where appropriate.
- `DROP` — remove after no production consumer depends on it.
- `HISTORICAL` — preserve as evidence, never treat as active implementation authority.

| Area | Decision | Reason |
| --- | --- | --- |
| Next.js App Router | KEEP | Canonical Vercel runtime and current route composition |
| Vinext optional target | SALVAGE | May remain as an explicit secondary build; must not own default production scripts |
| Auth.js Credentials boundary | KEEP | Server-owned authentication with bounded JWT session |
| AccessContext resolver | KEEP | Explicit tenant/branch/membership authority |
| Route/command RBAC | KEEP | Database-backed permission evaluation and freshness |
| Transaction-local DB context | KEEP | Correct foundation for RLS defense in depth |
| Customer signed capability | KEEP | Clean separation from staff identity |
| Customer-data server module | KEEP | Durable storefront/cart/order authority already exists |
| Operational order server module | KEEP + HARDEN | Durable implementation is valuable; shared concurrency boundary required |
| Historical migrations | HISTORICAL/KEEP | Never rewrite applied lineage to make naming cleaner |
| Generated Kysely types | KEEP | Database/source drift contract |
| pgTAP RLS/integrity tests | KEEP | Database acceptance evidence |
| Stable Quality Gates | KEEP + EXPAND | Useful quality control; source classification was incomplete |
| Phase/Round specs | HISTORICAL | Evidence only; not current progression authority |
| Phase/Round GitHub gate | DROP | Enforces obsolete delivery model |
| `src/data/demo` | SALVAGE then DROP | Useful fixture/design evidence but not production authority |
| `src/store` FoodFlow state | SALVAGE then DROP | Keep until each consumer has durable replacement |
| `src/services/repositories` in-memory business mutations | REWRITE/DROP | Name implies persistence but mutates browser state; duplicates server authority |
| Legacy `src/domain` models | SALVAGE | Retain reusable domain vocabulary; move durable contracts to capability-owned modules over time |
| Customer local UI submission | REWRITE | Must use customer-data HTTP commands and durable cart/order aggregates |
| Staff durable order workspace | KEEP + PREMIUM POLISH | Correct authority, improve UX without weakening command boundaries |
| Staff non-order demo tabs | SALVAGE | UI knowledge useful; backend authority must be replaced capability by capability |
| Kitchen local board | SALVAGE | UI workflow useful; durable kitchen-ticket plane exists in schema but needs server integration |
| Cashier local app | SALVAGE | UX/domain knowledge useful; durable payment authority requires server implementation |
| Admin/owner local app | SALVAGE | UI information architecture useful; data must come from server-owned aggregates |
| Browser-only role simulation | DROP after cutover | Production authority must come from Auth/RBAC, not an active demo role |

## Non-negotiable architecture decisions

1. The browser is never authoritative for business workflow state.
2. PostgreSQL is the durable source of truth for transactional FoodFlow state.
3. Every internal mutation is authorized server-side and executed inside a transaction carrying tenant/branch/actor context.
4. RLS remains defense in depth even when application predicates are correct.
5. Customer capability and staff identity are separate security boundaries.
6. Every order mutation acquires one common per-order fail-fast concurrency lock before observing or mutating business state.
7. Historical migrations are immutable; corrections are forward migrations.
8. User-facing production screens must identify whether data is live/durable or preview/demo; demo state may not be labelled live.
9. Default `npm run build` and `npm run start` represent the production Vercel Next.js runtime.
10. A capability is complete only when data model, service boundary, authorization, isolation, UI, and acceptance evidence are connected.

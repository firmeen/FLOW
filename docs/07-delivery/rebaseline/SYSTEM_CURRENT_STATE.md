# FLOW System Current State

Status: REBASELINE AUTHORITY

Baseline input: `b03a7bda9dcd8a36f1b274f25d19143ba43e09a4`

This document records what the repository actually contains at the post-P04/R06 merge cut. Historical Phase/Round documents remain evidence only; they are not current planning authority.

## Runtime topology

FLOW currently contains two application authorities in the same Next.js application:

1. A durable server plane under `src/modules/*` backed by PostgreSQL/Supabase, Auth.js, transaction-scoped database roles, RBAC, RLS, idempotent customer commands, and operational order command services.
2. A legacy/demo plane under `src/store`, `src/services/repositories`, `src/domain`, and `src/data/demo` that mutates `FoodFlowState` in the browser.

The rebaseline objective is not to delete the legacy plane blindly. Each capability is cut over to a durable server authority first, verified, and only then may its demo authority be retired.

## Current capability truth

| Capability | Current authority | State |
| --- | --- | --- |
| Internal authentication | Auth.js Credentials + database credential boundary | Durable foundation |
| Workspace selection | Database membership/role/branch resolution | Durable foundation |
| RBAC | Database permission evaluation plus route/command guards | Durable foundation |
| Tenant/branch isolation | Transaction context + RLS | Durable foundation |
| Customer QR capability | Signed customer capability | Durable foundation |
| Customer storefront reads | PostgreSQL customer-data module | Durable backend; UI cutover required |
| Customer cart/order commands | PostgreSQL + idempotent HTTP commands | Durable backend; UI cutover required |
| Staff order queue/detail | PostgreSQL operational-order read plane | Durable |
| Staff order decisions/lifecycle/exceptions/production controls | PostgreSQL operational command plane | Durable with a shared-concurrency defect to close during this rebaseline |
| Staff non-order tabs | `useFoodFlow()` | Demo/local |
| Kitchen | `useFoodFlow()` | Demo/local |
| Cashier | `useFoodFlow()` | Demo/local |
| Admin/owner surfaces | `useFoodFlow()` | Demo/local |
| Menu configuration | Durable schema exists; production UI still local | Partial |
| Service requests | Durable schema exists; production UI still local | Partial |
| Kitchen tickets | Durable schema exists; production UI still local | Partial |
| Payments | Durable schema exists; production UI still local | Partial |
| Merchant payments | Provider boundary not production-enabled | Missing/blocked by implementation |
| SaaS billing | Feature flag only | Missing/blocked by implementation |

## Database truth

The generated Kysely database contract contains the `app`, `foodflow`, `payments`, and `audit` schemas, including organizations, restaurants, branches, memberships, permissions, menu structures, carts, orders, order events, kitchen tickets, service requests, table sessions, payments, allocations, and payment events.

Historical migrations are immutable evidence. Rebaseline work must add forward migrations for schema changes rather than rewriting an already-applied migration. The zero-byte first migration is retained as historical evidence until an explicit classification says otherwise.

## Security truth

Internal routes use Auth.js and route-level permission guards. Database business transactions set `flow_runtime` with transaction-local `app.tenant_id`, `app.branch_id`, and `app.actor_id`. Customer commands use a separate customer capability boundary. RLS remains defense in depth and must not be bypassed by browser-side authority.

The management shell previously required branch selection even though `/admin` permission scope is tenant-wide. Rebaseline aligns the shell with tenant authority while preserving route permission evaluation.

## Reliability truth

Operational order commands previously did not share one per-order concurrency boundary. Individual repositories used exact-state updates and some local row locks, allowing cross-plane races such as decision versus cancellation to both succeed in sequence. Rebaseline introduces a common fail-fast row lock before every operational order mutation so a competing command maps to the existing domain conflict contract.

## CI truth

Repository Integrity and Stable Quality Gates are technically useful and remain. The Phase/Round gate is obsolete governance and is replaced by source-authority delivery policy. Database-quality classification must include identity and operational server modules, not only customer-data modules. Browser acceptance becomes an explicit release gate for user-facing cutovers.

## Deployment truth

Next.js on Vercel is the canonical production runtime. Vinext remains an optional secondary build target only until separately justified; default `build` and `start` commands must represent the Vercel production path.

## Rebaseline completion condition

The source-code rebaseline is complete when the repository has one explicit architecture authority, historical database lineage is classified, critical concurrency/security invariants are green, production routes do not silently claim demo state as live state, the durable customer path is cut over, quality gates exercise database and browser boundaries, and the remaining demo capabilities are isolated behind an explicit backlog rather than being mistaken for production authority.

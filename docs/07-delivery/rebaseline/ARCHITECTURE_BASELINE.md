# FLOW Architecture Baseline

Status: REBASELINE AUTHORITY

## 1. Platform shape

FLOW is a multi-tenant SaaS platform with a shared foundation and product verticals. FoodFlow is the first production beachhead. CareFlow and JobFlow reuse shared tenancy, identity, permissions, billing, audit, notification, and deployment primitives rather than copying FoodFlow internals.

## 2. Canonical application runtime

- Framework: Next.js App Router.
- Hosting target: Vercel.
- Server runtime owns authentication, authorization, business reads, and business mutations.
- Client components own interaction state only: open/closed panels, filters, draft form values, optimistic presentation, focus, and animation.
- Vinext is a non-authoritative optional target until separately approved.

Default commands:

- `npm run build` -> production Next.js build.
- `npm run start` -> production Next.js server.

## 3. Capability ownership

New durable code is capability-owned under `src/modules/<capability>`.

A mature capability should expose:

- shared serializable contracts where required,
- server repositories for database access,
- server services for business orchestration,
- authorization at the service/command boundary,
- HTTP/route adapters that are intentionally thin,
- tests at unit, integration/database, RLS, and browser levels as appropriate.

Cross-capability imports must target public contracts or explicit server entry points. UI components must not import server-only modules.

## 4. Data authority

PostgreSQL/Supabase is the durable transactional source of truth.

Browser state must never create a second business authority. Local state may cache or optimistically represent a server aggregate, but server responses reconcile the authoritative state.

Historical migrations are immutable. Schema corrections use new forward migrations. Generated Kysely types are regenerated from a clean migration bootstrap and committed only when they match the schema.

## 5. Database schemas

- `app` — tenants/organizations, restaurants, branches, users, memberships, roles, permissions, shared configuration.
- `foodflow` — restaurant operational data: menu, tables, sessions, carts, orders, kitchen, service requests.
- `payments` — merchant payment records, allocations, events, reconciliation-oriented evidence.
- `audit` — cross-capability audit evidence.
- `private` — security/helper functions not exposed as product data.

Schema boundaries are logical ownership boundaries, not a license to bypass tenant isolation.

## 6. Identity and authorization

Internal users:

`Auth.js session -> actor identity -> workspace selection -> AccessContext -> route permission -> command permission -> transaction-local DB context -> RLS`.

Customer users:

`QR/direct entry -> signed customer capability -> scoped CustomerContext -> customer database transaction -> customer-specific RLS/ownership boundary`.

Customer capability is never staff authority. A staff session is never inferred from browser role selection.

## 7. Transaction and concurrency boundary

Every business mutation that changes an order aggregate must execute in one database transaction. Before observing mutable order state, the service acquires the shared order row with `FOR UPDATE NOWAIT` using the trusted tenant/branch/order identity.

Outcomes:

- missing scoped row -> domain not-found,
- row already held by another mutation -> domain conflict,
- valid lock -> business state is observed and mutated once,
- event evidence is inserted in the same transaction,
- event failure rolls back the aggregate mutation.

This lock is shared by decision, lifecycle, exception, and production-control planes; repositories may retain narrower locks, but they do not define cross-plane concurrency authority.

## 8. RLS and grants

Application predicates and RLS are both required. The server connects through the configured database URL, enters the appropriate restricted role inside a transaction, sets transaction-local tenant/branch/actor settings, and performs scoped operations. No browser credential may bypass the server command boundary for domain data.

Tenant-scoped management permission must not require a branch unless the capability itself is branch-bound.

## 9. API design

Mutation routes:

- same-origin checks where browser commands are expected,
- bounded request bodies,
- strict allowed fields,
- idempotency keys for replay-prone customer/payment commands,
- stable domain error codes,
- no trust in tenant/branch/actor identifiers supplied by the client.

Read routes use trusted context resolved server-side and return serializable view contracts rather than raw database rows.

## 10. UI authority and premium UX

Production UI surfaces render durable server data. A legacy/demo surface must be explicitly identified as preview until cut over.

Premium UX means operational clarity, not decorative complexity:

- restrained monochrome/off-white FLOW brand foundation,
- deliberate spacing and typography,
- soft elevation only where hierarchy needs it,
- rounded controls with large touch targets,
- clear primary action per context,
- strong empty/loading/error/conflict states,
- responsive behavior designed for the role's device,
- reduced-motion and keyboard/focus accessibility,
- no false `Live` labels for local demo state.

## 11. External side effects

Payment provider calls, notifications, emails, and other non-database side effects must become retry-safe. Long-term authority is an outbox/job boundary with idempotent consumers, correlation IDs, observable attempts, and reconciliation. A database commit must not depend on an untracked external call succeeding exactly once.

## 12. Deployment environments

Development, Preview, and Production are separate trust environments. They require separate secrets and should not share a mutable Production database. `DATABASE_URL` is the runtime pooled connection; direct/session database access is tooling-only unless a deployment step explicitly requires it.

## 13. Definition of production capability

A capability is production-ready only when all applicable layers are green:

`schema -> migration -> generated types -> repository -> service -> authorization -> RLS -> API -> UI -> unit/integration/pgTAP -> browser acceptance -> deployment configuration`.

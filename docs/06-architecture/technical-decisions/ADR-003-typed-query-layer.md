---
title: "ADR-003: Typed Query Layer for Supabase Postgres"
document_id: FLOW-ADR-003
status: proposed
owner: Architecture
last_reviewed: 2026-08-14
---

# ADR-003: Typed Query Layer for Supabase Postgres

## Status

Proposed. The packages are not installed, no database migration exists, and no target-runtime transaction/RLS test has passed. This decision must not be described as implemented or production-ready.

## Context

FLOW uses Auth.js as identity authority and Supabase Postgres as the operational source of truth. The browser must not query domain tables directly. Server commands require parameterized SQL, transaction-local actor/tenant/branch context, composite tenant ownership, RLS, and atomic state/audit/outbox writes.

The current FoodFlow repository interfaces accept and return a whole in-memory `FoodFlowState`; they are not an asynchronous database port and do not provide tenant isolation, transactions, or concurrency. SQL migrations must remain reviewable and independent from an ORM migration history.

## Decision

Use **Kysely** as the typed query builder over the **`pg`** Node.js driver for the pilot server data layer.

- Supabase CLI SQL migrations in `supabase/migrations` remain the only schema source of truth.
- Kysely does not create or modify production schema at application startup.
- Database types are generated from a clean migrated database with `kysely-codegen`, reviewed, and committed. Generation drift is a CI failure.
- Domain repositories expose purpose-specific asynchronous query/command ports. Kysely row types never cross into UI DTOs directly.
- Raw SQL is permitted for Postgres features that a query builder cannot express clearly, including transaction context, advisory/row locks, partial indexes, and selected reporting queries. It must remain parameterized and covered by integration tests.
- `@supabase/supabase-js` is not used for browser access to domain tables. It may be introduced later only for an approved Supabase product with a separate exposure/RLS decision.

## Connection and transaction contract

1. Next.js Node-runtime server code owns one bounded, module-scoped pool per runtime instance.
2. Runtime traffic uses the approved Supabase transaction-pooler connection. Migration/type-generation tooling uses the separately protected direct connection.
3. Driver prepared-statement behavior, pool size, connection/statement timeouts, SSL, and runtime compatibility are validated against the current Supabase connection guidance before acceptance.
4. Every tenant-owned command runs through one transaction helper that:
   - accepts only server-resolved actor, organization, and branch context;
   - uses parameterized `select set_config('app.actor_id', $1, true)`-style calls;
   - optionally changes to the non-bypass application role according to the reviewed role model;
   - executes the command and state/audit/outbox writes;
   - commits or rolls back before returning.
5. A transaction handle, not the global database handle, is passed into command repositories. External provider calls never run while the transaction is open.
6. Queries include explicit tenant/branch predicates even where RLS also applies. RLS is defense in depth, not a reason to omit application scoping.

## Type and validation boundaries

- Generated database types describe stored rows; application command/input schemas independently reject unknown or unsafe fields.
- `bigint` money is mapped to a safe domain minor-unit type and serialized as a validated safe integer or decimal string, never an unhandled JavaScript `bigint` or floating-point source of truth.
- Provider payloads are parsed into provider adapter types and never inserted as trusted domain rows.
- Database errors are mapped to stable application errors without exposing SQL, schema details, or cross-tenant existence.

## Security consequences

- Kysely type safety does not replace RLS, permissions, parameterization, constraints, or runtime validation.
- The runtime database role must be `NOBYPASSRLS`, must not own business tables, and receives only required schema/table/function privileges.
- `service_role`, database owner, and migration credentials are not general request credentials and never enter the browser.
- Private helper functions use fixed `search_path`, narrow execute grants, and explicit review; `SECURITY DEFINER` is exceptional.

## Alternatives considered

| Alternative | Reason not selected for the pilot |
|---|---|
| Plain `pg` with handwritten row types | Minimal runtime, but higher query/type drift and mapping burden across a broad schema |
| Drizzle ORM | Strong TypeScript schema, but risks a second schema/migration representation beside Supabase SQL migrations |
| Prisma | Heavier generated client and less direct fit for transaction-local context, custom schemas, RLS, and hand-reviewed Postgres SQL |
| Supabase Data API/client for all domain access | Conflicts with the server-mediated Auth.js baseline and would require a separate JWT/RLS authority design |
| Continue synchronous browser repositories | Cannot provide shared source of truth, transactions, isolation, or trusted authorization |

## Validation before acceptance

- Clean Supabase migration and generated-type drift checks pass.
- A real Next.js server command proves pooled transaction context is cleared after commit/rollback.
- Same-tenant allow and cross-tenant/wrong-branch/deactivated-membership denial tests run through Kysely and the application role.
- Concurrent idempotency/version tests pass.
- Connection count, timeouts, cold start, and deployment bundle pass on the approved Node.js/Vercel runtime.
- No production route imports the browser demo repository as a fallback.

## Related documents

- [Application Architecture](../application-architecture.md)
- [Data Model](../data-model.md)
- [Architecture Security](../security.md)
- [ADR-001: Technology Stack](ADR-001-technology-stack.md)


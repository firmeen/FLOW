# FLOW Database Runtime — Phase 3

This directory is the server-only PostgreSQL runtime boundary for FLOW. Phase 3 adds infrastructure only; the existing FoodFlowProvider/FoodFlowState/localStorage operational runtime remains unchanged until later migration phases.

## Connection contracts

- `DATABASE_URL` — normal Next.js server runtime connection. Production target is the Supabase transaction pooler.
- `DATABASE_DIRECT_URL` — migration, schema tooling and Kysely code generation only. Normal requests must not use it.

Database configuration is lazy. Importing this directory must not require a database URL or create a connection during `next build`. A database-backed operation fails explicitly only when invoked without runtime configuration.

## Runtime path

```text
trusted Next.js server caller
  -> withTenantTransaction(context, callback)
  -> lazy reusable pg Pool
  -> Kysely
  -> BEGIN
  -> SET LOCAL ROLE flow_runtime
  -> set_config(app.tenant_id, ..., true)
  -> set_config(app.branch_id, ..., true)
  -> set_config(app.actor_id, ..., true)
  -> typed callback
  -> COMMIT / ROLLBACK
  -> PostgreSQL RLS
```

`flow_runtime` is the Phase 2 `NOLOGIN NOBYPASSRLS` effective role. The role authenticated by `DATABASE_URL` must be provisioned by the deployment environment with permission to `SET ROLE flow_runtime`. The connection login role is not the authorization model for domain queries.

## Request context

`DatabaseRequestContext` contains a required verified tenant UUID and optional branch/actor UUIDs. Phase 3 validates UUID structure but does not establish identity authority. Phase 4 must derive these values from verified Auth.js identity, membership and authorization rather than directly trusting browser input.

Branch and actor settings are preserved now so Phase 4 can add branch/permission-aware policies without replacing the transaction boundary. Current Phase 2 RLS is tenant isolation only.

## Pool lifecycle

The runtime creates one lazy `pg.Pool` / `Kysely` pair per Node execution environment and reuses it. It does not create or destroy a pool per request. Conservative defaults are used and can be overridden through validated server-only environment variables:

- `DATABASE_POOL_MAX` — default 4, maximum 20.
- `DATABASE_CONNECTION_TIMEOUT_MS` — default 5000.
- `DATABASE_IDLE_TIMEOUT_MS` — default 10000.

A process/serverless singleton is an optimization only; application correctness must never depend on one process living forever.

## Database types

SQL migrations remain schema authority. Kysely database types are generated from a freshly migrated local PostgreSQL/Supabase database using `kysely-codegen` and committed under `generated/database.ts`. Future migration changes must regenerate this file and CI must reject schema/type drift.

Database rows intentionally retain database naming and representation: snake_case columns, UUID strings, bigint-compatible minor-unit values and database timestamps. Domain objects under `src/domain` remain separate and future repositories will map between these representations.

## Money

PostgreSQL financial facts are `BIGINT` minor units. FLOW does not globally configure the `pg` int8 parser to return JavaScript `number`. Common helpers require an explicit minor-unit scale and reject unsafe JavaScript-number conversion. They do not replace `calculateBill()` or any business calculation.

## Health

`checkDatabaseHealth()` performs a non-tenant `SELECT 1` and returns only `{ healthy }`. It does not expose connection information and is not wired to a public HTTP endpoint in Phase 3.

## Scope boundaries

Phase 3 does not migrate Cart, Session, Order, Kitchen, Service or Payment repositories; does not add dual writes or fallback; and does not implement Auth.js, Realtime, Omise/Stripe provider integration, customer UI changes or Voice Ordering.

# FLOW Supabase Database

Phase 2 establishes the versioned PostgreSQL/Supabase structural baseline for FLOW/FoodFlow. The application is **not connected to this database yet**; `apps/web/next-flow` continues to use the current FoodFlowProvider/FoodFlowState/localStorage demo runtime until later phases.

## Schemas

- `app` — tenant, restaurant, branch, settings and identity/RBAC foundations.
- `foodflow` — restaurant tables/sessions, menu, draft carts, orders, kitchen and service requests.
- `payments` — merchant-facing FoodFlow payment ledger baseline and normalized order allocations.
- `audit` — append-oriented business/security audit events.
- `private` — non-exposed context and trigger helpers.
- `billing`, `careflow`, `jobflow` — reserved namespaces only in Phase 2; their product/provider tables are deferred.

Domain schemas are intentionally absent from `supabase/config.toml` `[api].schemas`. Browser access to domain tables is not part of this baseline.

## Migration policy

`supabase/migrations/20260814071654_phase1_tenant_audit_baseline.sql` is a historical no-op and remains untouched because its migration version may already exist outside this repository.

Phase 2 uses forward-only new migrations. Do not rewrite an applied migration. Production deployment is not part of this phase; do **not** run `supabase db push`, `supabase migration repair`, or `supabase db reset --linked` against a production project as part of Phase 2 validation.

## Local setup and reset

The project pins the Supabase CLI in `apps/web/next-flow` devDependencies. From the repository root, run it through the package runner used by your environment, or from `apps/web/next-flow` with paths adjusted as needed.

The supported local workflow requires Docker or another compatible container runtime:

```bash
npx supabase start
npx supabase db reset --local
npx supabase test db --local
npx supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```

`db reset` recreates the local database, applies migrations in order, then loads `supabase/seed.sql` because `config.toml` enables the seed.

## Seed semantics

`supabase/seed.sql` contains deterministic synthetic fixtures only: Tenant A/B, one restaurant/branch/table per tenant, and minimal menu/modifier records. It contains no production credentials, no live provider references, no raw capability tokens and no real customer data.

## Tenant context contract

Phase 2 establishes the context expected by later server-side transactions:

```text
SET LOCAL app.tenant_id = '<verified tenant uuid>'
SET LOCAL app.branch_id = '<verified branch uuid>'
SET LOCAL app.actor_id = '<verified actor uuid>'
```

`private.current_tenant_id()`, `private.current_branch_id()` and `private.current_actor_id()` read those settings with `current_setting(..., true)` so missing context resolves to null instead of throwing.

The `flow_runtime` role is `NOLOGIN NOBYPASSRLS`. Phase 3 will decide connection/pool integration; Phase 4 will add identity-, membership-, permission- and branch-aware authorization. Current RLS is intentionally the tenant isolation foundation only.

## RLS baseline

Tenant-owned tables enable and force RLS. `flow_runtime` receives tenant-filtered policies. Without `app.tenant_id`, tenant-owned queries return no rows and writes fail policy checks. Cross-tenant `tenant_id` writes are denied.

`app.users`, `app.permissions` and `app.role_permissions` are identity/catalog foundations and are not exposed to `flow_runtime` in Phase 2. `audit.events` grants runtime only `SELECT` and `INSERT`, not normal `UPDATE`/`DELETE`.

## Relational integrity

Structural protection includes composite tenant/restaurant/branch foreign keys, one active-like table session per table, order submission-key uniqueness, active service-request deduplication, draft-cart quantity checks and normalized join/child tables rather than demo ID arrays.

Draft carts deliberately allow missing required modifiers. Final required-modifier completeness remains an application/domain invariant from Phase 1.

Kitchen tables deliberately do not enforce one ticket per order, preserving Phase 7 multi-station compatibility.

## Money

Persisted monetary facts use integer minor units (`bigint`, e.g. `base_price_minor`, `unit_price_minor`, `total_minor`). Currency is constrained to uppercase three-character codes. Percentage/rate metadata uses integer basis points where persisted (`1000 = 10.00%`). The current TypeScript demo still uses `number`; conversion is a Phase 3/5 boundary.

## Database tests

`supabase/tests/database/phase2_database_baseline.test.sql` uses pgTAP and covers schema presence, RLS, money/currency constraints, draft-cart behavior, active-session uniqueness, order idempotency and tenant RLS isolation. Later phases should extend this suite rather than replacing it.

## Deferred responsibilities

- Phase 3: Kysely/`pg`, server-only pool and transaction/context helper.
- Phase 4: Auth.js identity mapping, memberships/permissions, branch-aware RLS authorization.
- Phase 5: customer table session/cart/order persistence and transactional idempotency handling.
- Phase 6: realtime/multi-device service operations.
- Phase 7: multi-station kitchen runtime and persistence integration.
- Phase 8: Omise provider attempts/webhooks/refunds/disputes/reconciliation and richer merchant account model.

This directory is a structural database foundation, not a claim that FoodFlow application persistence is production-ready.

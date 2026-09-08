# FLOW Delivery Policy

Status: ACTIVE AFTER REBASELINE MERGE

This policy supersedes Phase/Round progression for new FLOW work. Historical PXX/RXX specifications and implementation branches remain evidence only.

## 1. Work unit

The unit of delivery is a **Capability Change**: the smallest independently reviewable change that moves one production capability forward while keeping repository invariants green.

A Capability Change should normally have one primary objective, such as fixing order concurrency, cutting the customer cart UI to durable commands, or adding the kitchen read plane. Large product milestones are achieved through multiple Capability Changes rather than artificial six-round sequences.

## 2. Branching

- Start from current `main` unless an explicitly approved dependency branch is required.
- Use descriptive branches such as `rebaseline/order-mutation-lock`, `foodflow/customer-cart-cutover`, or `platform/tenant-admin-context`.
- Do not chain long-lived implementation branches as a substitute for integrating verified work.
- A PR targets `main` unless its purpose explicitly requires another base.

## 3. Pull requests

Every implementation PR must state:

- objective and user/business impact,
- source-of-truth boundary changed,
- security/tenant/branch impact,
- database/migration impact,
- demo/local authority retired or still remaining,
- validation executed and exact blockers,
- rollback/recovery considerations for risky changes.

PRs may be draft while evidence is incomplete. A PR becomes ready only when its applicable acceptance gates are green or the remaining blocker is explicitly external and approved.

## 4. Merge authority

A merge is an integration decision, not a scheduling step. The repository owner retains final merge authority unless a separate repository policy explicitly enables safe auto-merge. Creating or updating a PR does not imply merge authorization.

## 5. Acceptance gates

Applicable gates are selected by changed capability, not by phase number.

### Always

- repository integrity,
- dependency integrity when package state changes,
- lint,
- typecheck,
- unit/integration tests,
- production Next.js build.

### Database/security changes

- fresh local Supabase bootstrap,
- all migrations from zero,
- pgTAP/RLS tests,
- database lint,
- generated Kysely type drift,
- DB runtime integration tests,
- tenant/branch/customer negative isolation tests.

### Concurrent transactional changes

- deterministic one-winner race tests,
- rollback evidence when event/audit insertion fails,
- no lost update or two-success outcome for mutually exclusive commands.

### User-facing runtime cutovers

- Playwright browser acceptance,
- loading/empty/error/conflict/retry behavior,
- responsive viewport coverage,
- accessibility/focus behavior for primary workflows,
- proof that the UI is reading/writing the intended durable authority.

### Payment/external side effects

- idempotency/replay tests,
- webhook authentication,
- duplicate/out-of-order event tests,
- reconciliation path,
- explicit sandbox before production enablement.

## 6. Source authority rule

A production screen may not silently fall back to demo/local business state. If a durable backend is not ready, the capability must be explicitly marked preview or remain unavailable. `useFoodFlow()` may exist temporarily only for isolated legacy/demo consumers listed in the rebaseline backlog.

## 7. Database migration rule

Never rewrite an applied migration to correct production history. Add a forward migration. Historical phase/round names do not justify renaming migrations. Fresh bootstrap must remain deterministic.

## 8. Documentation rule

Code and executable database/CI behavior are the evidence for current state. Documentation is updated with the change that alters an architectural or product truth. Old documents are marked historical instead of being silently treated as active.

## 9. Defect policy

A reproduced invariant defect is fixed at the smallest correct authority boundary. Tests that expose a valid invariant are not weakened to make CI green. Temporary skips require an explicit external blocker and a backlog item.

## 10. Completion

A Capability Change is complete when the changed authority is internally consistent, all applicable gates are green, documentation reflects the new truth, and no hidden follow-up is required to prevent the feature from misleading users about durability or security.

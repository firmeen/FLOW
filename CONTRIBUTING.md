# Contributing to FLOW

FLOW uses capability-based delivery. The historical Phase/Round model is preserved as repository evidence but is no longer the active planning or progression authority.

## Source authority

Use these rebaseline documents as the delivery authority:

- `docs/07-delivery/rebaseline/SYSTEM_CURRENT_STATE.md`
- `docs/07-delivery/rebaseline/SYSTEM_GAP_MATRIX.md`
- `docs/07-delivery/rebaseline/SYSTEM_DECISIONS.md`
- `docs/07-delivery/rebaseline/PRODUCT_BEACHHEAD.md`
- `docs/07-delivery/rebaseline/ARCHITECTURE_BASELINE.md`
- `docs/07-delivery/rebaseline/DELIVERY_POLICY.md`
- `docs/07-delivery/rebaseline/REBASELINE_BACKLOG.md`

`main` is the integration authority. Historical PXX/RXX specifications, branches, PRs and migrations remain evidence only unless a rebaseline decision explicitly salvages a technical invariant from them.

## Change workflow

1. Select one capability-sized change from the ordered rebaseline backlog.
2. Branch from the current trusted `main` unless an approved active work item explicitly requires another parent.
3. Keep the PR focused on one coherent capability boundary and document data/security/runtime impact.
4. Preserve historical migrations; schema corrections use forward migrations.
5. Do not introduce browser-owned business-state authority. Transactional state belongs to the durable server/database plane.
6. Do not weaken authorization, tenant/branch isolation, RLS, idempotency, concurrency, or acceptance tests to force a green build.
7. Run all applicable repository, application, database and browser gates.
8. Keep the PR unmerged until applicable gates are green and the owner accepts the change.

## Merge authority

Implementation is delivered through pull requests. Direct pushes to `main` are prohibited. Automatic merge must not be enabled by development agents. The repository owner retains final merge authority.

## Quality expectations

A production capability is not complete merely because a screen renders. The accepted boundary includes the relevant data model, service/API ownership, authorization, isolation, concurrency/idempotency rules, UI state, failure behavior, tests and production runtime contract.

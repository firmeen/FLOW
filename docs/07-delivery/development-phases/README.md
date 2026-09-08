# FLOW Historical Phase/Round Specifications

Status: `HISTORICAL`  
Active progression authority: **NONE in this directory**

This directory preserves the former FLOW Phase/Round development model, its executable specifications, templates, acceptance records and implementation lineage as historical engineering evidence.

As of the post-R06 source-code rebaseline on 2026-09-08, **Phase/Round is no longer the active planning, scheduling, branching or implementation progression model.** Do not create P05 or later work from these documents and do not use a historical `Next:` field as permission to continue development.

## Current authority

Use the source-code rebaseline documents instead:

- `../rebaseline/SYSTEM_CURRENT_STATE.md`
- `../rebaseline/SYSTEM_GAP_MATRIX.md`
- `../rebaseline/SYSTEM_DECISIONS.md`
- `../rebaseline/PRODUCT_BEACHHEAD.md`
- `../rebaseline/ARCHITECTURE_BASELINE.md`
- `../rebaseline/DELIVERY_POLICY.md`
- `../rebaseline/REBASELINE_BACKLOG.md`

Current work is selected by capability dependency, risk and acceptance evidence. The active implementation branch normally starts from the current trusted `main` unless an approved capability explicitly declares another parent.

## What remains valid here

Historical specifications may still contain useful evidence about:

- intended business invariants;
- database constraints and RLS expectations;
- authorization boundaries;
- state transitions;
- concurrency/idempotency requirements;
- acceptance scenarios;
- migration provenance;
- branch/PR lineage and earlier implementation decisions.

Those details are evidence to classify as `KEEP`, `SALVAGE`, `REWRITE`, `DROP` or `HISTORICAL`; they are **not automatically current implementation authority**.

## Preservation rule

Do not delete, rename or rewrite historical specifications and migrations merely to remove Phase/Round naming or old workflow language. A migration that may have been applied remains immutable; schema corrections use forward migrations.

Historical branches and PRs may also remain available as evidence until an explicit cleanup decision says they can be retired.

## Former naming pattern

Files named like the following are historical records:

```text
FLOW_P{PHASE}_R{ROUND}_IMPLEMENTATION_SPEC.md
```

Templates, merge policy documents and prior acceptance records in this directory are likewise historical unless an active rebaseline document explicitly incorporates a technical invariant from them.

## Delivery rule now

For new implementation work:

```text
READ CURRENT MAIN + REBASELINE AUTHORITY
→ SELECT ONE CAPABILITY-SIZED BACKLOG ITEM
→ CREATE A FOCUSED BRANCH
→ IMPLEMENT DURABLE SOURCE AUTHORITY
→ RUN ALL APPLICABLE REPOSITORY / APPLICATION / DATABASE / BROWSER GATES
→ OPEN OR UPDATE PR
→ OWNER MERGE DECISION
```

No Phase/Round schedule, branch chain, six-round completion count, or `Previous`/`Next` metadata controls the successor workflow.

## Safety

If a historical Phase/Round document conflicts with verified current source, tests or active rebaseline decisions, record the drift and follow the active rebaseline authority. Do not weaken security, RLS, concurrency, idempotency or acceptance invariants merely because an older progression document says a round was complete.

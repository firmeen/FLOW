# FLOW Historical Round Branch and Merge Policy

Status: `HISTORICAL`  
Former scope: Phase/Round implementation work

This file preserves the merge/progression policy used by the former FLOW Phase/Round delivery model. It is retained as historical evidence for earlier branches, pull requests and specifications.

**It is not the active delivery policy after the post-R06 source-code rebaseline.**

The successor policy is:

- `../rebaseline/DELIVERY_POLICY.md`
- `../rebaseline/REBASELINE_BACKLOG.md`
- root `CONTRIBUTING.md`

## Historical model

The former model separated specification authority on `main` from implementation lineage on the latest round branch:

```text
MAIN
= former policy / executable specification authority

LATEST ROUND BRANCH
= former implementation parent

OWNER
= PR merge decision
```

It used hard gates such as `NO SPEC ON MAIN = NO DEVELOPMENT`, six rounds per phase, Phase/Round metadata, scheduled round slots and branch progression through `pXX-rXX-*` lineages.

These mechanics no longer authorize new work. In particular:

- do not create P05 or later Phase/Round branches;
- do not infer the next implementation from a historical `Next:` field;
- do not use the latest legacy round branch as the default parent for new rebaseline work;
- do not require six rounds, scheduled slots or Phase/Round metadata for successor capability delivery;
- do not reactivate the removed Phase/Round CI gate.

## What is still preserved

Historical round specifications and this policy remain useful for reconstructing:

- earlier branch and PR lineage;
- the scope intended for a historical implementation round;
- validation evidence and known blockers at that time;
- security/database invariants that may later be classified as reusable;
- why a migration or source change exists.

Historical wording does not override verified current source, tests, accepted architecture decisions or the active rebaseline documents.

## Merge ownership that remains applicable

One governance principle survives the old model and is restated by the active delivery policy:

- implementation is proposed through pull requests;
- development agents do not push implementation directly to `main`;
- development agents do not enable automatic merge;
- the repository owner retains the final merge decision.

This surviving rule is authoritative because it is repeated in the active rebaseline policy, not because this historical document remains active.

## Historical migration/specification preservation

Do not rewrite historical migrations or specifications solely to modernize their naming or progression language. If a historical migration may have been applied, corrections use a new forward migration. Historical branches and records remain evidence until explicitly classified for cleanup.

## Current successor workflow

```text
CURRENT TRUSTED MAIN
→ CAPABILITY-SIZED BACKLOG ITEM
→ FOCUSED BRANCH / PR
→ DURABLE SOURCE IMPLEMENTATION
→ APPLICABLE REPOSITORY + APP + DB + BROWSER ACCEPTANCE
→ OWNER MERGE DECISION
```

When uncertain whether an old Phase/Round instruction still applies, treat it as historical and consult `docs/07-delivery/rebaseline/` before making implementation decisions.

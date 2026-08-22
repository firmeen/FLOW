# FLOW Round Branch and Merge Policy

Status: `ACTIVE`  
Applies to: FLOW phase/round implementation work.

## Purpose

FLOW separates implementation progression from integration into `main`.

The controlling model is:

```text
MAIN
= policy and executable specification authority

LATEST ROUND BRANCH
= implementation lineage

OWNER
= PR merge decision
```

The development agent creates and validates round branches and opens PRs. It does not merge implementation PRs.

## Hard Gates

The active FLOW development gates are:

```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```

These gates are fail-closed.

## Authority Source

Before every round, the development agent must read current `main` and use only `main` for:

- `docs/07-delivery/development-phases/README.md`;
- this policy;
- `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`;
- the exact `FLOW_P{PHASE}_R{ROUND}_IMPLEMENTATION_SPEC.md`;
- repository instructions such as `CONTRIBUTING.md` / `AGENTS.md` when present;
- applicable nested instructions.

An implementation branch, previous round branch, PR description, historical result, or remembered state must not become the specification authority.

## Round Branch Lineage

Each round creates a new dedicated branch.

The new round branch must be created from the latest round implementation branch in the active chain, not from `main`, unless there is no prior round implementation branch for that chain.

Example:

```text
main
  \
   p02-r01-core
        \
         p02-r02-auth
              \
               p02-r03-order
```

Recommended branch naming pattern:

```text
p{phase}-r{round}-{short-description}
```

The description should be short, lower-case, and specific.

Examples:

```text
p02-r01-core
p02-r02-auth
p02-r03-order
```

The agent must inspect only the latest round branch as the implementation parent for the next round. Earlier round branches remain history/evidence but are not alternate development bases.

## Round Entry Eligibility

A round may begin only when all applicable conditions are true:

1. The exact executable specification exists on current `main`.
2. The specification status is `READY`.
3. Phase/Round/Previous/Next metadata is valid.
4. The declared planned execution slot is due when applicable.
5. The previous round branch exists as the latest implementation parent, unless this is the first round in the active chain.
6. Required validation inherited by the new round is not failed or unresolved when the specification requires it.
7. No unresolved blocker prevents starting the exact scope.

The previous round implementation PR does not need to be merged before the next round branch is created.

## Required Checks

Required checks are determined from the exact round specification and current repository workflows.

The agent must not fabricate PASS, weaken checks, rename required checks, suppress failures, or treat an unrun required check as PASS.

Validation result vocabulary remains exactly:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

Typical contexts include, when applicable:

```text
Phase/Round Gate
Repository Integrity
Dependency Integrity
Next Flow Quality
Supabase Database Quality
Vercel
```

Round-specific checks named by the executable specification remain required even when not listed above.

A failed required validation means the round branch is not ready for owner integration, but it does not authorize hiding or bypassing the failure.

## PR Policy

For each implementation round, the agent must create or update exactly one implementation PR for that round when a PR is requested by the workflow.

The PR must include:

- Phase / Round;
- exact specification filename;
- implementation parent branch and SHA;
- implementation head SHA;
- actual validation results;
- inherited blockers;
- scope declarations;
- next-spec handoff.

The agent must stop after branch implementation, validation, and PR creation/update.

## Merge Ownership

Implementation PR merges are owner-controlled.

The development agent must not:

- merge an implementation PR;
- enable automatic merge for an implementation PR;
- treat a successful check run as permission to merge on behalf of the owner;
- require a merge before creating the next round branch;
- push implementation changes directly to `main`.

The owner may choose which PR to merge and when to merge it.

## Branch Progression vs Main Integration

Branch progression and `main` integration are intentionally independent:

```text
ROUND PROGRESSION
latest round branch
→ new round branch
→ next new round branch

INTEGRATION
owner-selected PR
→ owner merge decision
→ main
```

A later round may therefore contain the accumulated commits of earlier unmerged round branches because it descends from the latest round branch.

This is expected behavior for the branch chain.

## One Scheduled Slot = At Most One Round

One scheduled execution may create or update at most one round branch.

It must never cascade through multiple rounds in the same slot.

## Historical Specification Precedence

Historical specifications may contain previous merge/progression wording such as:

```text
Automatic merge allowed: YES
Automatic merge allowed: NO
Owner/manual merge required
Validated automatic merge
NO SUCCESSFUL MERGE = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
```

After this policy is present on `main`, those phrases are superseded only for:

- who performs the merge;
- whether merge is required before the next branch;
- branch progression mechanics;
- phase implementation-chain completion mechanics.

They do not change:

- implementation scope;
- database/security boundaries;
- required tests;
- required CI;
- Phase/Round/Previous/Next metadata;
- scheduled execution authority;
- prohibitions unrelated to merge mechanics.

Historical specifications do not need to be rewritten solely to update old merge language.

## Future Specification Contract

New executable specifications should avoid coupling development progression to PR merge state.

They should declare the implementation parent expectation and preserve:

```text
Authority source: main
Implementation parent: latest round branch
Owner merge control: YES
Agent merge allowed: NO
```

## Security and Failure Discipline

The agent must not:

- disable or weaken checks;
- rename checks to evade a gate;
- fabricate validation results;
- use secrets in source, PR text, issues, or logs;
- broaden implementation scope beyond the exact spec on `main`;
- use an older round branch when a newer round branch is the current implementation parent;
- use an unmerged spec branch as authority;
- merge implementation PRs.

The safe default for ambiguity is `STOP`.
# FLOW Development Phase Specifications

This directory is the source of truth for phase/round implementation specifications used to control FLOW development progression.

## Location

```text
docs/07-delivery/development-phases/
```

## File naming pattern

Every executable development round must have exactly one specification file using this pattern:

```text
FLOW_P{PHASE}_R{ROUND}_IMPLEMENTATION_SPEC.md
```

Examples:

```text
FLOW_P01_R01_IMPLEMENTATION_SPEC.md
FLOW_P01_R02_IMPLEMENTATION_SPEC.md
FLOW_P01_R03_IMPLEMENTATION_SPEC.md
FLOW_P01_R04_IMPLEMENTATION_SPEC.md
FLOW_P01_R05_IMPLEMENTATION_SPEC.md
FLOW_P01_R06_IMPLEMENTATION_SPEC.md
FLOW_P02_R01_IMPLEMENTATION_SPEC.md
```

Rules:

- `P01`, `P02`, ... identify the phase.
- `R01` through `R06` identify the development round inside that phase.
- One phase contains 6 rounds.
- The normal cadence is 2 days per phase and 3 rounds per day.
- The normal round times are 04:00, 12:00, and 20:00 Asia/Bangkok.
- One scheduled slot may execute at most one round.
- Do not rename a specification after development for that round has started.
- Do not reuse a phase/round filename for a different scope.

## Authority and implementation lineage

FLOW uses two separate sources for control and code lineage:

```text
MAIN
= policy / specification authority

LATEST ROUND BRANCH
= implementation parent
```

Every scheduled round must read the controlling policy and exact executable specification from current `main` only. A round branch, previous round branch, PR body, remembered state, or unmerged documentation branch must never replace `main` as the authority source.

Implementation branches follow a branch chain. Each new round creates a new dedicated short-lived round branch from the latest round implementation branch, not from `main`, unless there is no prior round branch in the active chain.

Example:

```text
main                  (authority only)
  \
   p02-r01-core
        \
         p02-r02-auth
              \
               p02-r03-order
```

Recommended short branch pattern:

```text
p{phase}-r{round}-{short-description}
```

Examples:

```text
p02-r01-core
p02-r02-auth
p02-r03-order
```

The description should be short and specific.

## Development gate

FLOW development must follow these hard gates:

```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```

Before starting any round, verify all of the following:

1. The exact current-round specification exists on `main`.
2. The specification is `READY` and has valid Phase/Round/Previous/Next metadata.
3. The planned execution slot is due when the specification declares one.
4. The previous round branch exists and is the latest implementation parent, unless this is the first round in the active branch chain.
5. Required validation for the previous round branch passed when the current specification depends on that validation.
6. The current implementation scope is taken only from the specification on `main`; agents must not invent the next round when no specification exists.

A previous round does not need to be merged into `main` before the next round branch is created. Branch progression is based on the latest round branch, while specification authority remains on `main`.

If any required entry gate fails, stop before implementation and report the exact blocker.

## Branch and PR policy

For every implementation round:

```text
READ POLICY + EXACT SPEC FROM MAIN
→ IDENTIFY LATEST ROUND BRANCH
→ CREATE A NEW ROUND BRANCH FROM THAT BRANCH
→ IMPLEMENT EXACT SPEC
→ RUN REQUIRED VALIDATION ON THE NEW ROUND BRANCH
→ OPEN OR UPDATE THE ROUND PR
→ STOP
```

The development agent must not merge implementation PRs. PR merge timing and selection remain owner-controlled.

Direct push to `main` remains prohibited.

A round PR may target `main` or another owner-selected integration branch according to the current repository workflow, but creating the next round branch does not depend on that PR being merged.

## Specification precedence

Executable specifications remain authoritative for implementation scope, security boundaries, required validation, Phase/Round metadata, and non-merge prohibitions.

If a historical specification contains merge-mechanics language such as:

```text
Automatic merge allowed: YES
Automatic merge allowed: NO
Owner/manual merge required
Stop for owner review
No successful merge = no next round
```

current `FLOW_MERGE_POLICY.md` and this README supersede those phrases only for branch progression, PR ownership, and merge mechanics. They do not broaden or reduce implementation scope.

Historical completed-round specs do not need to be rewritten solely to modernize old workflow wording.

## Required specification structure

Each round specification should cover the complete implementation surface needed for that round, including at minimum:

1. Metadata
2. Phase objective
3. Phase scope
4. Current round objective
5. Preconditions
6. Architecture scope
7. Existing files and current behavior
8. Files to create
9. Files to modify
10. Files to move
11. Files to remove
12. Database changes
13. Backend changes
14. Frontend changes
15. Authentication and authorization
16. Security requirements
17. Failure and recovery paths
18. Dependencies
19. Tests
20. Validation commands
21. PR requirements
22. Definition of Done
23. Handoff to the next round

Use `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md` in this directory as the starting template.

## Required metadata and continuation marker

Every executable specification must make progression deterministic. Include fields equivalent to:

```text
Phase: 01
Round: 01
Status: READY
Previous: NONE
Next: FLOW_P01_R02_IMPLEMENTATION_SPEC.md
Planned execution: YYYY-MM-DD HH:mm Asia/Bangkok
```

The final round of a phase points to the first round of the next phase:

```text
Next: FLOW_P02_R01_IMPLEMENTATION_SPEC.md
```

If the referenced next file is not present on `main`, the development workflow must stop before starting the next phase branch.

## Upload workflow

For a new round specification:

1. Copy `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`.
2. Rename it using `FLOW_P{PHASE}_R{ROUND}_IMPLEMENTATION_SPEC.md`.
3. Fill every section required by the scope.
4. Confirm `Previous` and `Next` are correct.
5. Confirm workflow metadata follows `FLOW_MERGE_POLICY.md`.
6. Open a PR targeting `main`.
7. Merge the specification to `main` before that development round is allowed to start.

The repository state on `main` is the authoritative source for whether a specification exists and whether development may continue.
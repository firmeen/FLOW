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
- One scheduled slot may execute at most one round, even when that round merges successfully before the slot ends.
- Do not rename a specification after development for that round has started.
- Do not reuse a phase/round filename for a different scope.

## Development gate

FLOW development must follow these hard gates:

```text
NO SPEC = NO DEVELOPMENT
FAILED REQUIRED CI = NO MERGE
NO SUCCESSFUL MERGE = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
NO NEXT PHASE SPEC = STOP
```

Before starting any round, verify all of the following:

1. The previous round PR is merged, unless this is the first round of the first phase.
2. Required CI/checks for the previous round have passed.
3. The current round specification exists on `main` at this directory.
4. The specification follows the required naming pattern.
5. The specification identifies the previous and next specification explicitly.
6. The current implementation scope is taken from the specification; agents must not invent the next round when no specification exists.

If any required entry gate fails, stop before implementation and report the exact blocker.

## Validated automatic merge policy

The default FLOW merge model is **validated automatic merge after required checks pass**.

The authoritative merge policy is:

```text
FLOW_MERGE_POLICY.md
```

For every implementation round:

```text
IMPLEMENT EXACT SPEC
→ OPEN OR UPDATE EXACTLY ONE IMPLEMENTATION PR TO MAIN
→ WAIT FOR ALL REQUIRED CHECKS
→ VERIFY ALL REQUIRED CHECKS PASS
→ VERIFY PR IS MERGEABLE / NON-CONFLICTING
→ MERGE TO MAIN
→ VERIFY MERGE SHA AND CURRENT MAIN
→ STOP UNTIL THE NEXT SCHEDULED SLOT
```

An implementation PR must not merge while a required check is failed, pending, queued, cancelled, blocked, timed out, or otherwise incomplete. A failed or incomplete merge gate stops progression and must be reported rather than bypassed.

Direct push to `main` remains prohibited.

### Legacy specification merge wording

Specifications authored before `FLOW_MERGE_POLICY.md` may contain historical merge-only language such as:

```text
Automatic merge allowed: NO
Owner/manual merge required
Stop for owner review
```

Once the validated automatic merge policy is present on `main`, `FLOW_MERGE_POLICY.md` and this README supersede those legacy phrases **only for the actor/mechanics of merging**. The executable specification remains authoritative for implementation scope, security boundaries, required validation, Phase/Round metadata, and all non-merge prohibitions.

Historical completed-round specs do not need to be rewritten solely to modernize old merge wording.

A future specification may explicitly require manual approval for a concrete high-risk reason. Such an exception must be declared clearly in that round's metadata and is not inferred from legacy wording.

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
Automatic merge allowed: YES
Merge condition: ALL REQUIRED CHECKS PASS
Owner approval required before merge: NO
```

The final round of a phase points to the first round of the next phase:

```text
Next: FLOW_P02_R01_IMPLEMENTATION_SPEC.md
```

If the referenced next file is not present on `main`, the development workflow must stop after the current round is completed and merged.

## Upload workflow

For a new round specification:

1. Copy `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`.
2. Rename it using `FLOW_P{PHASE}_R{ROUND}_IMPLEMENTATION_SPEC.md`.
3. Fill every section required by the scope.
4. Confirm `Previous` and `Next` are correct.
5. Confirm merge metadata follows `FLOW_MERGE_POLICY.md` unless the round explicitly documents a manual-approval exception.
6. Open a PR targeting `main`.
7. Merge the specification before that development round is allowed to start.

The repository state on `main` is the authoritative source for whether a specification exists and whether development may continue.
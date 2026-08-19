# FLOW Validated Automatic Merge Policy

Status: `ACTIVE`  
Effective from: `2026-08-19 Asia/Bangkok`  
Applies to: FLOW phase/round implementation PRs from P01/R05 onward and any still-open implementation PR governed after this policy reaches `main`.

## Purpose

FLOW development runs on fixed scheduled slots. A completed round should not wait for a separate manual merge action when repository evidence already proves the round is safe to merge.

This policy replaces the former default of:

```text
IMPLEMENT
→ OPEN PR
→ PASS CI
→ WAIT FOR OWNER MANUAL MERGE
```

with:

```text
IMPLEMENT
→ OPEN OR UPDATE EXACTLY ONE IMPLEMENTATION PR
→ WAIT FOR ALL REQUIRED CHECKS
→ VERIFY ALL REQUIRED CHECKS PASS
→ VERIFY PR IS MERGEABLE AND NON-CONFLICTING
→ MERGE TO MAIN
→ VERIFY MERGE SHA ON MAIN
→ STOP UNTIL THE NEXT SCHEDULED SLOT
```

## Hard Gates

The active FLOW development gates are:

```text
NO SPEC = NO DEVELOPMENT
FAILED REQUIRED CI = NO MERGE
NO SUCCESSFUL MERGE = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
NO NEXT PHASE SPEC = STOP
```

These gates are fail-closed.

## Merge Eligibility

An implementation PR may be merged only when all of the following are true at the time of merge:

1. The exact executable specification exists on the PR base `main`.
2. The specification status is `READY`.
3. Phase/Round/Previous/Next metadata is valid and matches the PR metadata.
4. The previous round is merged and its required checks passed, except for the first allowed round.
5. The PR contains only the authorized round scope or explicitly documented unavoidable supporting changes permitted by that specification.
6. Every required check applicable to the round has completed successfully.
7. No required check is pending, queued, failed, cancelled, timed out, blocked, neutral where success is required, or otherwise incomplete.
8. The PR is mergeable and has no unresolved merge conflict.
9. No unresolved blocker owned by the current round remains.
10. The current `main` and specification still authorize the merge when re-read immediately before merging.

If any condition is not satisfied:

```text
DO NOT MERGE
DO NOT START THE NEXT ROUND
REPORT THE EXACT BLOCKER
```

## Required Checks

Required checks are determined from the exact round specification and current repository workflows. The agent must not invent a PASS or treat an unrun required check as PASS.

Typical contexts include, when applicable:

```text
Phase/Round Gate
Dependency Integrity
Next Flow Quality
Supabase Database Quality
Vercel
```

Round-specific checks named by an executable specification remain required even when they are not listed above.

Validation result vocabulary remains exactly:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

`NOT RUN`, `BLOCKED`, or `NOT APPLICABLE` may be truthful evidence, but they do not satisfy a check that the specification marks as required to pass.

## Merge Method

FLOW uses a controlled validated merge performed only after the merge-eligibility gate passes.

The repository may use any merge method currently allowed by repository settings. The automation must use an allowed method and must provide the expected PR head SHA when the merge API supports it so a moved head cannot be merged accidentally.

GitHub native Auto-Merge is not required for this policy. The scheduled agent may verify the completed checks and then invoke the repository merge operation directly.

Direct pushes to `main` remain prohibited.

## One Scheduled Slot = At Most One Round

A successful merge does not authorize another round inside the same scheduled execution.

Example:

```text
12:00 slot
→ execute R05
→ PR
→ checks
→ merge R05
→ verify main
→ STOP

20:00 slot
→ re-read current main
→ verify exact R06 spec and all entry gates
→ only then execute R06
```

The automation must never cascade through multiple rounds in one slot.

## Legacy Specification Precedence

Specifications written before this policy may contain merge-mechanics language such as:

```text
Automatic merge allowed: NO
No auto-merge
Owner/manual merge required
Stop for owner review
Waiting for owner merge
```

After this policy is merged to `main`, those legacy phrases are superseded **for merge mechanics only** by this file and the current `development-phases/README.md`.

This precedence does **not** change:

- implementation scope;
- database/security boundaries;
- required tests;
- required CI;
- Phase/Round/Previous/Next metadata;
- Definition of Done other than the final merge actor/mechanism;
- prohibitions unrelated to merge mechanics.

Historical specifications for already-completed rounds should not be rewritten solely to modernize old merge wording. Their repository history remains evidence of the policy that existed when those rounds executed.

## Future Specification Contract

New executable specifications should declare merge policy explicitly:

```text
Automatic merge allowed: YES
Merge condition: ALL REQUIRED CHECKS PASS
Owner approval required before merge: NO
```

A future specification may require manual owner approval only when it explicitly opts out for a concrete high-risk reason. Such an exception must be visible in metadata and must override this default only for that round.

## PR Evidence After Merge

Before merge, the implementation PR should record:

```text
MERGE_ELIGIBLE: YES | NO
REQUIRED_CHECKS_COMPLETE: YES | NO
REQUIRED_CHECKS_PASS: YES | NO
PR_MERGEABLE: YES | NO
UNRESOLVED_ROUND_BLOCKER: NONE | <exact blocker>
```

After a successful merge, the scheduled run must verify and report:

```text
PR_MERGED: YES
MERGE_SHA: <actual merge/result SHA>
MAIN_SHA_AFTER_MERGE: <actual current main SHA>
ROUND_STATUS: COMPLETE
NEXT_SPECIFICATION: <exact Next value>
NEXT_ROUND_STARTED_THIS_SLOT: NO
```

## Security and Failure Discipline

Validated automatic merge must never be used to bypass repository safety controls.

The automation must not:

- disable or weaken checks to make a PR mergeable;
- rename required checks to evade a gate;
- merge with unresolved conflicts;
- fabricate validation results;
- use secrets in source, PR text, issues, or logs;
- merge implementation scope that is not authorized by the exact spec;
- continue to the next round after a failed merge;
- start another round in the same slot after a successful merge.

The safe default for ambiguity is `STOP`.
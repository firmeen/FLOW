# FLOW Main Branch Protection Runbook

Status: `TARGET CONTRACT — R06 VERIFICATION REQUIRED`

This document defines the external GitHub protection contract required by FLOW Phase 01 / Round 06. Repository documentation is not proof that GitHub-hosted settings are active; actual branch/ruleset state must be read back from GitHub before R06 can be declared complete.

## Target branch

```text
main
```

Normal development changes must enter `main` through pull requests. Direct development pushes to `main` are not an accepted FLOW delivery path.

## Required repository-owned checks

The R05 baseline establishes these stable contexts on pull requests to `main`:

```text
Phase/Round Gate
Repository Integrity
Dependency Integrity
Next Flow Quality
Supabase Database Quality
```

The three heavier contexts must remain present even when their scope is not applicable; in that case they must report through their explicit successful not-applicable path rather than disappear because of workflow-level path filtering.

Vercel is deployment evidence. It is not part of the required branch-protection set unless a later reviewed governance decision proves that the external context is stable on every relevant PR and deliberately promotes it to a merge gate.

## Target protection behavior

The effective GitHub branch protection or ruleset must provide behavior equivalent to:

```text
PULL REQUEST REQUIRED: YES
REQUIRED STATUS CHECKS:
  - Phase/Round Gate
  - Repository Integrity
  - Dependency Integrity
  - Next Flow Quality
  - Supabase Database Quality
STRICT / BRANCH CURRENT WITH MAIN: YES where supported and operationally workable
ADMIN / OWNER BYPASS OF REQUIRED CHECKS: NO where supported
ALLOW FORCE PUSHES: NO
ALLOW BRANCH DELETION: NO
REQUIRED APPROVAL COUNT: 0 by default for the current sole-owner workflow
CODEOWNER REVIEW REQUIRED: NO by default for the current sole-owner workflow
REVIEW CONVERSATION RESOLUTION: YES when supported without deadlock
LINEAR HISTORY REQUIRED: NO
SIGNED COMMITS REQUIRED: NO
MERGE QUEUE REQUIRED: NO
REQUIRED DEPLOYMENT: NO
```

## Review-policy compatibility

Current repository ownership is defined by `.github/CODEOWNERS` as:

```text
* @firmeen
```

Do not configure a mandatory independent approval or CODEOWNER approval count that prevents the current sole owner / PR author from merging a fully compliant PR. Phase 01 relies on the PR path, mandatory checks, and no-bypass enforcement rather than an impossible self-review rule.

If another eligible independent reviewer is added later, approval requirements may be introduced only through an explicit reviewed governance change.

## Branch freshness

When GitHub supports strict required-check freshness without creating a deadlock, the PR head must be current with `main` before merge. If the branch is stale, update the branch and allow required checks to run again. Do not bypass freshness to complete a round.

## Verification procedure

Before claiming `MAIN_PROTECTED = YES`:

1. Fetch the current `main` branch and protection/ruleset state from GitHub.
2. Confirm the PR path is required.
3. Confirm the exact five repository-owned required contexts above.
4. Confirm strict/current-main behavior if selected.
5. Confirm administrator/owner bypass is disabled where GitHub supports it.
6. Confirm force pushes are disabled.
7. Confirm branch deletion is disabled.
8. Confirm the review policy does not create a self-review deadlock.
9. Re-check the active R06 implementation PR remains legally mergeable after all required checks pass.

Never infer protection from this file, a PR checklist, or an owner statement alone.

## Connector / automation limitation

If the active GitHub connector can read protection state but cannot mutate branch protection or rulesets:

```text
OWNER_ACTION_REQUIRED = YES
```

The owner must apply the target contract through GitHub Settings or another authorized GitHub API path. The implementation agent must then re-fetch the hosted state and verify it before R06 can continue to final acceptance.

Do not fabricate a protection mutation and do not claim success before read-back verification.

## Recovery from misconfiguration

If protection causes a deadlock, correct only the misconfigured rule while preserving the intended PR + required-check boundary. Common recovery cases:

- remove an impossible self-review requirement;
- correct a stale or misspelled required context name;
- update the PR branch and rerun checks when strict freshness blocks merge;
- remove an external deployment context from the required set if it is not reliably reported;
- restore admin/no-bypass enforcement if it was disabled accidentally.

Do not solve a configuration problem by disabling all branch protection or reopening unrestricted direct pushes.

## Updating the required-check set

Future changes to required checks must be made through a reviewed Phase/Round or governance change that:

1. proves the new context name is stable;
2. proves the context reports on every relevant PR;
3. updates repository workflow/documentation contracts together;
4. changes GitHub-hosted protection settings;
5. reads back and verifies the resulting external state.

## Repository files versus hosted settings

Repository files define the expected FLOW contract. GitHub branch protection/rulesets are externally hosted enforcement state. Both must agree, but only GitHub read-back can prove enforcement is active.

## Phase / Round Metadata

Specification: FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md
Phase: XX
Round: XX
Previous: FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md | NONE
Previous PR: #
Related Issue: #
Next Specification: FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md | NONE

## Summary

Describe what changed and why.

## Implemented Scope

- 

## Explicitly Out of Scope

- 

## Changed Areas

- [ ] Application
- [ ] Tests
- [ ] Dependencies / lockfile
- [ ] Database / migrations
- [ ] Runtime configuration
- [ ] GitHub Actions / infrastructure
- [ ] Documentation

## Base / Head Evidence

SPEC_BASE_SHA:
IMPLEMENTATION_BASE_SHA:
IMPLEMENTATION_HEAD_SHA:
IMPLEMENTATION_BRANCH:

## Validation Results

Use only: PASS / FAIL / NOT RUN / BLOCKED / NOT APPLICABLE.

- PHASE_ROUND_GATE:
- DEPENDENCY_INTEGRITY:
- LINT:
- TYPECHECK:
- UNIT:
- INTEGRATION:
- BUILD_NEXT:
- NEXT_FLOW_QUALITY:
- SUPABASE_DB_QUALITY:
- VERCEL_STATUS:

## Database / Migration Impact

DATABASE_SCHEMA_CHANGED: NO
PRODUCTION_DB_MODIFIED: NO

Describe any applicable database effect.

## Environment / Configuration Impact

Describe variables, toolchain, configuration, or deployment impact. Never include secret values.

## Security Impact

Describe authorization, validation, tenant isolation, workflow-permission, secret-handling, or other security effects.

## Failure / Recovery Validation

Describe failure cases exercised and the expected recovery path.

## Known Limitations

- 

## Deferred Scope

- 

## Required Scope Declarations

AUTH_IMPLEMENTED: NO
BUSINESS_PERSISTENCE_IMPLEMENTED: NO
REALTIME_IMPLEMENTED: NO
KITCHEN_REDESIGN: NO
OMISE_IMPLEMENTED: NO
STRIPE_IMPLEMENTED: NO
CUSTOMER_REDESIGN: NO
VOICE_IMPLEMENTED: NO

## Branch Protection / Repository Evidence

MAIN_PROTECTED:
CURRENT_REQUIRED_CHECKS:
OWNER_ACTION_REQUIRED:

## Merge Eligibility

- [ ] Required round checks completed.
- [ ] Every required round check passed.
- [ ] Inherited failures are recorded truthfully.
- [ ] No unresolved blocker owned by this round remains.
- [ ] No required scope is silently deferred.
- [ ] No sensitive information is included.
- [ ] PR is mergeable and non-conflicting.
- [ ] Current `main` and the exact executable specification still authorize the merge.

MERGE_ELIGIBLE: NO
REQUIRED_CHECKS_COMPLETE: NO
REQUIRED_CHECKS_PASS: NO
PR_MERGEABLE: NO
UNRESOLVED_ROUND_BLOCKER: NOT EVALUATED

## Merge Result

Before merge:

PR_MERGED: NO
MERGE_SHA: NOT APPLICABLE
MAIN_SHA_AFTER_MERGE: NOT APPLICABLE
ROUND_STATUS: IMPLEMENTED / WAITING FOR VALIDATED MERGE

After validated merge, report the actual values from GitHub and stop the scheduled slot before any next round starts.

Merge policy: `docs/07-delivery/development-phases/FLOW_MERGE_POLICY.md`
Validated automatic merge: YES — only after all required checks pass.
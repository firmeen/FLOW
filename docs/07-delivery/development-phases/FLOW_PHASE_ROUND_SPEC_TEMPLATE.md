# FLOW PXX RXX — Implementation Specification

## Metadata

- Phase: `XX`
- Round: `XX`
- Status: `DRAFT | READY | BLOCKED | COMPLETE`
- Authority source: `main`
- Implementation parent: `latest round branch`
- Previous: `NONE | FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md | NONE`
- Planned execution: `YYYY-MM-DD HH:mm Asia/Bangkok`
- Owner merge control: `YES`
- Agent merge allowed: `NO`

> Workflow mechanics are governed by `FLOW_MERGE_POLICY.md`. Policy/specification authority is read from current `main`; implementation lineage comes from the latest round branch.

## 1. Phase Objective

Describe the outcome the complete six-round phase must achieve.

## 2. Phase Scope

Define the full phase boundary so this round can be evaluated in context.

### In scope

- 

### Out of scope

- 

## 3. This Round Objective

State exactly what must be implemented and completed in this round.

## 4. Preconditions

- [ ] This specification exists on current `main` before implementation starts.
- [ ] This specification is `READY` with valid Phase/Round/Previous/Next metadata.
- [ ] The planned execution slot is due when applicable.
- [ ] The latest round branch is identified and used as the implementation parent, unless this is the first round in the active chain.
- [ ] Required validation inherited from the previous round branch is not failed or unresolved when required by this specification.
- [ ] Required upstream code/configuration is present on the implementation parent branch.
- [ ] Required environment/configuration prerequisites are known.
- [ ] Scope does not depend on an undefined future round.

## 5. Architecture Scope

Document every affected layer.

### Frontend

- 

### Backend

- 

### Database

- 

### Authentication / Authorization

- 

### API / Integrations

- 

### Payment

- 

### Notifications

- 

### Audit / Observability

- 

### Infrastructure / CI

- 

## 6. Existing Files and Current Behavior

List relevant existing paths and explain what each currently does before changes begin.

| Path | Current responsibility | Required action |
|---|---|---|
|  |  |  |

## 7. Files to CREATE

| Path | Responsibility | Required contents |
|---|---|---|
|  |  |  |

## 8. Files to MODIFY

| Path | Current behavior | Required change |
|---|---|---|
|  |  |  |

## 9. Files to MOVE

| From | To | Reason |
|---|---|---|
|  |  |  |

## 10. Files to REMOVE

| Path | Reason | Replacement / migration |
|---|---|---|
|  |  |  |

## 11. Database Changes

### Tables

- 

### Columns

- 

### Constraints

- 

### Indexes

- 

### RLS / Tenant isolation

- 

### Migrations / Backfill

- 

## 12. Backend Changes

### Services / Domain logic

- 

### Server actions / Route handlers / API

- 

### Validation

- 

### Authorization

- 

### Idempotency / Concurrency

- 

## 13. Frontend Changes

### Routes / Pages

- 

### Components

- 

### State / Data fetching

- 

### User interactions

- 

### Responsive behavior

- 

### Loading / Empty / Error states

- 

## 14. Authentication and Authorization

- Roles affected:
- Permissions required:
- Route protection:
- Backend permission enforcement:
- Session requirements:

## 15. Security Requirements

Cover all security requirements relevant to this round, including tenant isolation, secret handling, input validation, data exposure, CSRF/XSS/SQL injection protections, payment safety, and privileged actions where applicable.

- 

## 16. Failure and Recovery Paths

Define expected behavior for failures instead of relying only on happy paths.

| Failure case | Expected behavior | Recovery / retry |
|---|---|---|
|  |  |  |

## 17. Dependencies

### Internal

- 

### External

- 

### Environment variables / secrets

- 

## 18. Tests

### Unit

- [ ] 

### Integration

- [ ] 

### End-to-end

- [ ] 

### Authorization / RLS / Security

- [ ] 

### Failure cases

- [ ] 

### Regression

- [ ] 

## 19. Validation Commands

Run only commands that exist for the repository/application and record actual outcomes in the PR.

```bash
# typecheck

# lint

# tests

# build
```

Record actual outcomes using only:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

## 20. PR Requirements

The PR for this round must:

- [ ] Reference this phase/round specification from `main`.
- [ ] Record the implementation parent branch and SHA.
- [ ] Record the implementation head SHA.
- [ ] Contain only the intended round scope or clearly document unavoidable related changes.
- [ ] Explain database/configuration/environment changes.
- [ ] Include test and validation results.
- [ ] Identify known limitations or deferred work.
- [ ] Preserve required checks without weakening, renaming, suppressing, or hiding them.
- [ ] Remain owner-controlled for merge.

The development agent must not merge the PR or enable automatic merge.

## 21. Definition of Done

- [ ] All required implementation in this specification is complete on the round branch.
- [ ] No required scope is silently deferred.
- [ ] Required tests pass or truthful blockers are recorded.
- [ ] Required CI/check outcomes are recorded.
- [ ] Security and permission requirements are verified.
- [ ] Database migrations are safe and documented where applicable.
- [ ] UI states and failure paths are implemented where applicable.
- [ ] Documentation/configuration affected by the round is updated.
- [ ] The implementation PR is created or updated for owner review/integration.
- [ ] A new round branch exists for this round and is the implementation lineage tip when the round completes.

Round status before owner integration:

```text
PXX/RXX = IMPLEMENTED ON ROUND BRANCH / PR OPEN
```

Owner merge is not required for the next round branch to be created.

## 22. Handoff to Next Round

Summarize the branch state the next round is expected to inherit.

### Completed state

- 

### Known follow-up

- 

### Implementation parent for next round

```text
<this round branch>
```

### Required next specification

```text
FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md
```

The next scheduled execution must re-read current `main` for policy/spec authority, then create a new round branch from this latest round branch if the exact `Next` specification is present and authorized.

## 23. Development Gate

```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```

Before the next round begins, verify that the exact file named in `Next` exists on current `main`, is authorized, and the latest round branch is available as the implementation parent. Do not infer or invent the next implementation scope.

Merge mechanics and branch progression are governed by `FLOW_MERGE_POLICY.md`. The development agent creates branches and PRs only; the owner controls integration.
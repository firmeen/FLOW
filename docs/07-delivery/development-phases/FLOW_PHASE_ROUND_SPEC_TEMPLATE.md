# FLOW PXX RXX — Implementation Specification

## Metadata

- Phase: `XX`
- Round: `XX`
- Status: `DRAFT | READY | BLOCKED | COMPLETE`
- Target branch: `main`
- Previous: `NONE | FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md | NONE`
- Planned execution: `YYYY-MM-DD HH:mm Asia/Bangkok`
- Owner approval required: `YES`

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

- [ ] Previous round PR is merged, or this is the first allowed round.
- [ ] Required CI/checks from the previous round passed.
- [ ] This specification exists on `main` before implementation starts.
- [ ] Required upstream code/configuration is present.
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

## 20. PR Requirements

The PR for this round must:

- [ ] Target `main` unless an explicit repository policy says otherwise.
- [ ] Reference this phase/round specification.
- [ ] Contain only the intended round scope or clearly document unavoidable related changes.
- [ ] Explain database/configuration/environment changes.
- [ ] Include test and validation results.
- [ ] Identify known limitations or deferred work.
- [ ] Pass required CI before merge.
- [ ] Be merged before the next round may start.

## 21. Definition of Done

- [ ] All required implementation in this specification is complete.
- [ ] No required scope is silently deferred.
- [ ] Required tests pass.
- [ ] Required CI passes.
- [ ] Security and permission requirements are verified.
- [ ] Database migrations are safe and documented where applicable.
- [ ] UI states and failure paths are implemented where applicable.
- [ ] Documentation/configuration affected by the round is updated.
- [ ] PR is ready for owner review and merge.

## 22. Handoff to Next Round

Summarize the repository state the next round is expected to inherit.

### Completed state

- 

### Known follow-up

- 

### Required next specification

```text
FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md
```

## 23. Development Gate

```text
NO SPEC = NO DEVELOPMENT
NO MERGE = NO NEXT ROUND
FAILED REQUIRED CI = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
NO NEXT PHASE SPEC = STOP
```

Before the next round begins, verify that the exact file named in `Next` exists on `main`. If it does not exist, stop and notify the owner. Do not infer or invent the next implementation scope.

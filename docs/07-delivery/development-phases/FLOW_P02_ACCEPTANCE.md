# FLOW Phase 02 Acceptance

> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization
> Acceptance state recorded by P02/R06 implementation branch.

## Metadata

- Phase: `02`
- Acceptance owner round: `P02/R06`
- Implementation branch: `p02-r06-legacy-auth-removal`
- Implementation parent branch: `p02-r05-permission-enforcement`
- Implementation parent SHA: `613c9508ff4dd34da23b246565f5f98183f12eb3`
- Specification authority: current `main`
- Exact R06 spec: `FLOW_P02_R06_IMPLEMENTATION_SPEC.md`
- R06 spec status: `READY`
- Owner merge control: `YES`
- Implementation merged to `main`: `NO`
- GitHub Actions used as acceptance authority: `NO`

## Acceptance Summary

P02/R06 closes the legacy internal-auth authority after the replacement chain established by P02/R01–R05. The branch preserves the database-backed Auth.js credential flow, server-derived workspace context, live membership/revocation behavior, and database-backed permission enforcement while physically removing the rollback-only shared credential/session implementation.

The Phase 02 replacement authority chain is:

```text
Credential input
→ P02/R01 pre-auth credential/throttle boundary
→ P02/R03 database-backed Credentials authentication
→ Auth.js JWT session with real app.users.id actor identity
→ P02/R04 AccessContext from current membership/workspace state
→ tenant/branch transaction-local database context
→ P02/R05 live database permission evaluation
→ protected route or authorized command execution
→ RLS defense in depth
```

## P02/R06 Legacy Authority Removal

- `src/lib/auth/config.ts`: removed.
- `src/lib/auth/token.ts`: removed.
- retired `src/app/api/auth/login/route.ts`: removed.
- legacy `foodflow_session` issuance/verification: removed from runtime source.
- rollback-only `createSession()` path: removed.
- legacy shared credential comparison/configuration: removed.
- `FOODFLOW_INTERNAL_EMAIL`: removed from runtime/environment template authority.
- `FOODFLOW_INTERNAL_PASSWORD`: removed from runtime/environment template authority.
- `FOODFLOW_SESSION_SECRET`: removed from runtime/environment template authority.
- direct application dependency on `jose`: removed from `package.json`; Auth.js may continue to use its own transitive JWT dependencies.
- `src/lib/auth/session.ts`: now delegates session read/logout only to Auth.js.
- stale legacy cookies have no authentication authority and receive explicit browser regression coverage.

## Replacement Authority Preserved

### Authentication

- Auth.js remains the protected-session authority.
- Credentials authorization continues through `authenticateInternalUser()`.
- Successful authentication returns the real application actor UUID.
- JWT/session claims remain identity-only.
- Tenant, branch, membership, role-permission snapshots, and client-proposed authority are not added to the Auth.js session.

### Workspace Authorization

- R04 AccessContext remains the tenant/branch authorization boundary.
- Workspace selection remains a non-authoritative selector and is revalidated server-side.
- Active membership and active user state remain required.
- revoked, suspended, invited, no-membership, cross-tenant, and sibling-branch states remain fail-closed.
- logout continues to clear the workspace-selection hint.

### Permission Authorization

- R05 typed permission codes remain the capability contract.
- `private.actor_has_permission()` remains the live database permission authority.
- staff, kitchen, cashier, and admin route families remain permission guarded.
- privileged server commands use the authorized transaction boundary before callback side effects.
- permission changes do not require Auth.js claim rewrites.
- permission and membership removal remain effective on the next authorization evaluation.

### Proxy Boundary

- proxy remains authentication-only.
- proxy does not perform database workspace resolution.
- proxy does not perform permission evaluation.
- proxy does not import legacy session verification.

## Security Regression Coverage Added/Updated

- physical absence of legacy auth runtime files and endpoint.
- absence of legacy credential/session identifiers from runtime source.
- Auth.js as sole current session reader/logout authority.
- identity-only Auth.js configuration.
- replacement AccessContext and permission chain remains present.
- obsolete auth environment variables absent from `.env.example`.
- direct application `jose` declaration removed.
- stale `foodflow_session` cookie cannot authenticate `/staff`.
- existing R01–R05 identity, workspace, permission, branch, tenant, revocation, and RLS tests remain inherited by the branch.

## Validation Record

| Validation | Result | Evidence |
| --- | --- | --- |
| Exact R06 spec exists on `main` and is `READY` | PASS | GitHub source inspection |
| R06 branch descends from exact R05 head | PASS | Git compare lineage check required at final handoff |
| Legacy shared credential config physically removed | PASS | source deletion |
| Legacy JOSE token issuer/verifier physically removed | PASS | source deletion |
| Retired legacy login endpoint physically removed | PASS | source deletion |
| Auth.js session authority preserved | PASS | source inspection |
| AccessContext/workspace authority preserved | PASS | inherited R04 source + R06 diff review |
| R05 permission authority preserved | PASS | inherited R05 source + R06 diff review |
| Runtime source legacy-authority regression test added | PASS | test source inspection |
| Stale legacy cookie browser regression added | PASS | E2E source inspection |
| `.env.example` legacy auth variables removed | PASS | source inspection |
| Direct application `jose` dependency removed | PASS | `package.json` inspection |
| GitHub Actions | NOT RUN | explicitly not used as R06 acceptance authority |
| `npm run lint` | NOT RUN | no repository-local execution runtime in this connector execution |
| `npm run typecheck` | NOT RUN | no repository-local execution runtime in this connector execution |
| `npm test` | NOT RUN | no repository-local execution runtime in this connector execution |
| `npm run build:next` | NOT RUN | no repository-local execution runtime in this connector execution |
| database reset / pgTAP runtime | NOT RUN | no repository-local database runtime in this connector execution |

`NOT RUN` runtime commands do not convert into fabricated PASS results. R06 self-validation is based on exact branch lineage, source removal, final diff inspection, authority-boundary review, and regression contracts committed with the implementation.

## Phase 02 Security Conclusions

- Authentication is not authorization.
- An authenticated identity does not gain tenant or branch authority from its JWT.
- Workspace authority is derived from current server/database state.
- Permission authority is evaluated from current database state.
- Client selectors, role labels, UI visibility, stale cookies, and route names are not authorization authority.
- Cross-tenant and sibling-branch scope cannot be broadened by client input.
- Permission or membership revocation does not require rewriting the authentication token before authorization becomes denied.
- RLS remains an independent defense-in-depth boundary.
- Legacy shared credentials and legacy custom session tokens are no longer live runtime authority on the R06 branch.

## Integration State

The implementation is complete on the dedicated R06 branch for owner review/integration. This acceptance record does not claim that the branch has been merged into `main`. No pull request, auto-merge, or direct `main` mutation is authorized by this record.

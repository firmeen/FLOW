# FLOW Deployment and CI Baseline

## Application deployment

- Vercel project: `flow`
- Application root: `apps/web/next-flow`
- Framework/runtime application: Next.js
- Preview deployments: expected for pull requests through the existing Vercel GitHub integration
- Main deployment: expected after merge to `main`
- Repository-owned configuration: application source, package scripts, lockfile, GitHub Actions workflows and this runbook
- Externally configured in Vercel: project linkage, project root, environment variables, secrets, domains and account/team permissions

Do not commit Vercel tokens, project secrets, production environment values or copied dashboard credentials.

Do not add `vercel.json` or change root/build settings unless current deployment evidence proves repository-owned configuration is required.

## Stable repository CI contexts

Every pull request targeting `main` is expected to report these repository-owned contexts:

- `Phase/Round Gate`
- `Repository Integrity`
- `Dependency Integrity`
- `Next Flow Quality`
- `Supabase Database Quality`

`Phase/Round Gate` and `Repository Integrity` always perform their real validation.

The other three contexts always report, but their expensive work runs only when deterministic in-workflow scope classification marks that surface applicable. A workflow file changing itself is included in its own applicability rules so workflow changes cannot self-skip validation.

## Repository topology

FLOW currently supports no retained Git submodules. The R05 baseline removes unmanaged legacy gitlinks and intentionally keeps `.gitmodules` absent. `Repository Integrity` fails if a mode-160000 entry or tracked `.gitmodules` is introduced without a separately approved repository contract.

Removing a gitlink from FLOW does not delete or modify any external repository that the gitlink once referenced.

## Supabase retry policy

Database CI retries only when the first local Supabase startup failure matches explicitly transient infrastructure signatures such as registry/rate-limit, timeout, connection-reset or temporary network failures. Deterministic migration/SQL failures are surfaced immediately and are not retried as infrastructure noise.

Database semantics, migrations, RLS behavior and production/linked Supabase state are not changed by this retry classification.

## Failure handling

1. Treat a red stable repository context as merge-blocking until its root cause is understood.
2. Do not bypass failed application/database/security validation merely to obtain a green PR.
3. For Vercel failure, verify project `flow`, root `apps/web/next-flow`, build output and external environment configuration without exposing secret values.
4. Record actual Preview and post-merge `main` deployment status in the implementation PR handoff.
5. Final `main` branch protection/ruleset activation remains Phase 01 / Round 06 scope.

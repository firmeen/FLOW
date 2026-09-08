# Security Policy

FLOW treats authentication, authorization, tenant/branch isolation, customer capability boundaries, payment integrity and secret handling as release gates rather than UI concerns.

The detailed architecture baseline is documented in:

- `docs/06-architecture/security.md`
- `docs/07-delivery/rebaseline/ARCHITECTURE_BASELINE.md`
- `docs/07-delivery/rebaseline/SYSTEM_DECISIONS.md`

## Reporting

Report suspected vulnerabilities, credential exposure, cross-tenant access, payment integrity issues or data incidents privately to the repository owner. Do not publish exploitable details in a public Issue or Pull Request before the concern is triaged.

## Repository handling rules

- Never commit credentials, database passwords, API secrets, bearer tokens, customer personal data or confidential merchant data.
- Do not paste secrets into Issues, PR descriptions, review comments, screenshots, logs or documentation.
- Keep `.env` values outside Git; commit only non-secret templates such as `.env.example`.
- `NEXT_PUBLIC_*` values are browser-visible by design and must never contain server credentials.
- Preview/Test and Production credentials must remain separate.
- Historical migrations are immutable evidence; security/schema corrections use forward migrations.

## Application security baseline

- Internal identity is resolved server-side through Auth.js and database-backed access context.
- Permissions are enforced at route/command boundaries; hiding a control in the UI is not authorization.
- Transactional business operations carry trusted tenant/branch/actor context into the database.
- RLS remains defense in depth and must include negative cross-tenant/cross-branch coverage.
- Customer table capability is a separate, scoped security boundary from staff identity.
- Browser/demo state is never authoritative for production business workflow state.
- Mutating endpoints must preserve input validation, same-origin/CSRF protections where applicable, idempotency/concurrency contracts and safe error responses.

## Acceptance

Security-sensitive changes are not accepted solely because the application builds. Run the applicable permission, RLS, database runtime, concurrency, browser acceptance and dependency/security checks defined by the active rebaseline delivery policy before merge.

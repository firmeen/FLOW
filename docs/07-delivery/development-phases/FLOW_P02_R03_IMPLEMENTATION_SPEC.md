# FLOW P02 R03 — Implementation Specification

> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization
> Round 03 — Auth.js Credentials Authentication + Session Authority Cutover
> Revision — High-impact database-backed authentication and Auth.js session authority contract

---

## Metadata
- Phase: `02`
- Round: `03`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P02_R02_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P02_R04_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible scheduled slot after R03 spec is present on main`
- Current planning scope: `PHASE 02 / ROUND 03 ONLY`
- Implementation parent: `latest P02/R02 implementation lineage tip`
- Expected implementation parent branch: `p02-r02-auth-fixtures`
- Observed R02 branch head at specification authoring: `726568c18392f36d6b686c049c25bf1c885fcf73`
- Observed R02 implementation PR: `#59`
- Recommended implementation branch: `p02-r03-authjs-session-cutover`
- Recommended implementation PR title: `feat(auth): cut internal identity to Auth.js credentials sessions`
- Owner merge control for implementation: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Live Auth.js authentication cutover in this round: `YES`
- Legacy shared-auth code physical removal in this round: `NO — reserved for P02/R06`
- Workspace / AccessContext productization in this round: `NO — reserved for P02/R04`
- Route / command permission cutover in this round: `NO — reserved for P02/R05`
- Production database destructive mutation: `NO`

---

# 0. Specification Intent
- Convert internal human login from shared environment credentials to database-backed identity.
- Make Auth.js the authoritative internal session mechanism for newly authenticated users.
- Reuse the credential boundary created by R01.
- Reuse the deterministic identity fixtures created by R02.
- Keep authentication separate from authorization.
- Authenticate a real `app.users.id`.
- Do not choose tenant during credential verification.
- Do not choose branch during credential verification.
- Do not infer workspace from password validity.
- Do not physically remove legacy auth source yet.
- Do not broaden route permissions yet.
- Stop issuing the custom legacy session from the live login path.
- Preserve a controlled source-level rollback path until R06.
- Keep Auth.js session claims minimal.
- Keep authentication errors generic to the browser.
- Run dummy password verification for no-candidate paths.
- Wire login throttling into live authentication.
- Clear throttle state after successful authentication.
- Record failed login attempts atomically.
- Avoid holding DB transactions open during scrypt.
- Keep credential material server-only.
- Never put password hash into Auth.js token/session.
- Never put password hash into browser-visible data.
- Never log raw passwords.
- Never log auth secrets.
- Make logout use Auth.js authority.
- Preserve login-page redirect UX where safe.
- Preserve customer public-entry behavior.
- Preserve coarse protection for internal staff routes.
- Leave workspace resolution to R04.
- Leave permission-specific route enforcement to R05.
- Leave physical legacy cleanup to R06.

# 1. Current Repository State Observed for Authoring
- Current `main` observed at authoring: `c8bf5d84030b52f3030146ea4c1b4ab4630a5730`.
- `FLOW_P02_R02_IMPLEMENTATION_SPEC.md` exists on `main`.
- R02 specification status is `READY`.
- R02 specification observed line count is `2,159`.
- R02 implementation branch exists as `p02-r02-auth-fixtures`.
- R02 branch head observed at authoring is `726568c18392f36d6b686c049c25bf1c885fcf73`.
- R02 branch is materially ahead of its R01 implementation anchor.
- R02 implementation PR exists as `#59`.
- R02 implementation PR is open.
- R02 implementation contains deterministic credential fixtures.
- R02 implementation contains deterministic tenant fixtures.
- R02 implementation contains deterministic branch fixtures.
- R02 implementation contains authorization personas.
- R02 implementation contains SQL authorization tests.
- R02 implementation contains server integration tests.
- R02 implementation includes `owner.a@flow.test`.
- R02 implementation includes `staff.a1@flow.test`.
- R02 implementation includes `staff.a2@flow.test`.
- R02 implementation includes `kitchen.a1@flow.test`.
- R02 implementation includes `cashier.a2@flow.test`.
- R02 implementation includes `staff.b1@flow.test`.
- R02 implementation includes a credential-valid no-membership user.
- R02 implementation includes disabled-credential denial.
- R02 implementation includes no-credential denial.
- R02 implementation retains suspended-user denial.
- R02 implementation retains invited/suspended/revoked membership denial.
- R02 integration consumes the real R01 credential repository.
- R02 integration consumes the real R01 password verifier.
- R02 integration proves authentication eligibility can exist without workspace authority.
- R03 can therefore be specified from real R02 code state.

# 2. Current Live Authentication Baseline
- Live login endpoint is `src/app/api/auth/login/route.ts`.
- Live login endpoint accepts JSON email/password.
- Live login currently calls `getInternalAuthConfig()`.
- Live login currently calls `credentialsMatch()`.
- Live login currently calls custom `createSession()`.
- Current custom cookie is `foodflow_session`.
- Current custom session duration is eight hours.
- Current custom identity is `foodflow-internal`.
- Current custom token uses JOSE.
- Current custom token algorithm is HS256.
- Current custom issuer is `foodflow`.
- Current custom audience is `foodflow-internal`.
- Current proxy reads `foodflow_session`.
- Current proxy verifies the custom token directly.
- Current proxy protects `/staff/:path*`.
- Current proxy protects `/kitchen/:path*`.
- Current proxy protects `/cashier/:path*`.
- Current proxy protects `/admin/:path*`.
- Current login form posts directly to `/api/auth/login`.
- Current logout endpoint deletes the custom cookie.
- Current auth library exports legacy config/session/token modules.
- Current legacy development fallback credential remains in source.
- `.env.example` labels FOODFLOW internal auth as temporary.
- `.env.example` already contains `AUTH_SECRET`.
- `.env.example` already contains `AUTH_TRUST_HOST=true`.
- `next-auth@5.0.0-beta.32` is already installed.
- `@auth/core@0.41.3` is already installed.
- R03 must not reinstall Auth.js packages.
- R03 must not upgrade Auth.js only for convenience.
- Installed package types are implementation authority.
- Next.js version is `16.3.0`.
- Implementation must read relevant local Next.js docs before proxy/route edits.

# 3. R01 Authentication Primitives Available to R03
- `normalizeLoginEmail(input)` exists.
- R01 normalization trims whitespace.
- R01 normalization lowercases email.
- R01 input errors are typed internally.
- `findActiveCredentialCandidateByEmail(email)` exists.
- Credential lookup runs through auth transaction.
- Credential lookup uses `flow_authenticator`.
- Credential lookup returns only eligible active user credentials.
- Disabled credentials are excluded.
- Suspended users are excluded.
- Candidate includes real `userId`.
- Candidate includes `normalizedEmail`.
- Candidate includes `passwordHash` server-side only.
- Candidate includes algorithm `scrypt-v1`.
- Candidate includes `passwordChangedAt`.
- Candidate contains no tenant authority.
- Candidate contains no branch authority.
- `verifyPassword()` exists.
- Password verification uses Node scrypt.
- Password verification uses timing-safe comparison.
- `performDummyPasswordVerification()` exists.
- Dummy verification runs the KDF path.
- `readLoginThrottle()` exists.
- `recordLoginFailure()` exists.
- `clearLoginFailures()` exists.
- Throttle persistence is server-side.
- Throttle mutation is atomic at DB boundary.
- Auth DB role is transaction-local.
- R03 must reuse these primitives.
- R03 must not duplicate credential SQL in provider code.
- R03 must not duplicate scrypt implementation.
- R03 must not replace DB throttling with process memory.
- R03 must not broaden pre-auth direct table access.

# 4. R02 Deterministic Identity Contract Available to R03
- Tenant A ID is stable.
- Tenant B ID is stable.
- Branch A1 ID is stable.
- Branch A2 ID is stable.
- Branch B1 ID is stable.
- Owner A user ID is stable.
- Staff A1 user ID is stable.
- Staff A2 user ID is stable.
- Kitchen A1 user ID is stable.
- Cashier A2 user ID is stable.
- Staff B1 user ID is stable.
- No-membership user ID is stable.
- Disabled-credential user ID is stable.
- No-credential user ID is stable.
- Suspended user ID is stable.
- Existing inactive membership personas remain stable.
- Owner A email is stable.
- Staff A1 email is stable.
- Staff A2 email is stable.
- Kitchen A1 email is stable.
- Cashier A2 email is stable.
- Staff B1 email is stable.
- No-membership email is stable.
- Positive test passwords are stable synthetic fixtures.
- R03 tests should import `tests/fixtures/identity.ts`.
- Do not copy fixture constants into new application modules.
- Do not create production-looking fixture identities.
- Do not create a second credential fixture system.

# 5. Phase 02 Objective
- Replace temporary shared internal identity with real database users.
- Make Auth.js the internal session authority.
- Resolve workspace from active membership after authentication.
- Resolve tenant context after authentication.
- Resolve branch context after authentication.
- Enforce permissions after AccessContext exists.
- Keep RLS as defense in depth.
- Handle inactive states fail-closed.
- Remove temporary legacy auth only after replacement is proven.
- Preserve customer public access.
- Preserve tenant isolation.
- Preserve branch isolation.
- Preserve least privilege.
- Preserve deterministic testability.

# 6. Phase 02 Round Decomposition
- R01 owns identity and pre-auth boundary.
- R02 owns deterministic credentials and authorization contracts.
- R03 owns Auth.js credential authentication.
- R03 owns session authority cutover.
- R04 owns workspace and AccessContext resolution.
- R04 owns revocation/membership-change semantics.
- R05 owns route permission enforcement.
- R05 owns command permission enforcement.
- R06 owns physical legacy auth removal.
- R06 owns final security acceptance.
- R03 must consume R01 primitives.
- R03 must consume R02 fixtures.
- R03 must not implement R04.
- R03 must not implement R05.
- R03 must not implement R06.

# 7. R03 High-Impact Objective
- Make one database user ID the authenticated subject.
- Make Auth.js issue the authoritative session.
- Make Auth.js validate the authoritative session.
- Make Credentials provider call the R01 identity service.
- Make throttle enforcement live.
- Make unknown-user path run dummy KDF.
- Make wrong-password path record throttle failure.
- Make success path clear throttle state.
- Make blocked subjects fail generically.
- Replace custom-cookie reliance in protected-route authentication.
- Keep a source-level compatibility boundary until R06.
- Keep session free of tenant authority.
- Keep session free of branch authority.
- Keep session free of final permission authority.
- Keep membership selection out of login.
- Tie session to real user UUID.
- Make authenticated actor consumable by R04.
- Make session retrieval reusable server-side.
- Make logout use Auth.js authority.
- Keep login redirect deterministic.
- Reject legacy shared credentials after cutover.
- Reject stale legacy cookie as authority.
- Test suspended/disabled/no-credential paths.
- Test valid no-membership authentication.

# 8. Definition of Authentication Success
- Email passes project login input validation.
- Password passes input bounds.
- Throttle subject is not blocked.
- Credential repository returns an eligible candidate.
- Password verification returns true.
- Auth.js authorize returns minimal user object.
- Auth.js user ID equals real `app.users.id`.
- Auth.js user email equals normalized DB login email.
- Auth.js session is established.
- No tenant is selected during login.
- No branch is selected during login.
- No role list is session authority.
- No permission list is session authority.
- No credential hash enters token/session.
- Failure throttle state is cleared on successful verification.
- Browser sees only success behavior.
- Protected coarse gate recognizes Auth.js session.
- R04 can later resolve workspace from session actor ID.

# 9. Definition of Authentication Failure
- Invalid request shape fails safely.
- Invalid email fails generically.
- Oversized password fails safely.
- Unknown email does not reveal account absence.
- Unknown email runs dummy KDF.
- Suspended user does not authenticate.
- Disabled credential does not authenticate.
- Missing credential does not authenticate.
- Wrong password does not authenticate.
- Unsupported encoding fails closed.
- Malformed encoding fails closed.
- Blocked throttle subject does not authenticate.
- DB failure does not trigger legacy fallback.
- Throttle failure does not bypass throttling.
- Auth.js configuration failure does not trigger legacy fallback.
- Session issuance failure does not return success.
- Browser error remains generic.
- No status-specific identity leak.
- No credential encoding leak.
- No DB exception leak.

# 10. Hard Entry Gate
- This exact R03 spec must exist on current `main`.
- Status must be `READY`.
- Previous must be R02 spec.
- Next must be R04 spec.
- Current merge policy must be re-read.
- Development README must be re-read.
- Applicable `AGENTS.md` must be re-read.
- Relevant local Next.js docs must be read.
- Installed Auth.js types must be inspected.
- Latest R02 implementation branch must be identified.
- R03 must branch from latest R02 lineage tip.
- R03 must not branch from stale R01 code.
- R03 must not branch from `main` merely because R02 PR is unmerged.
- R02 deterministic fixtures must exist on parent.
- R01 credential repository must exist on parent.
- R01 password verifier must exist on parent.
- R01 throttle primitives must exist on parent.
- R02 no-membership positive credential must exist.
- Do not create duplicate R03 implementation branch.

# 11. Stop Conditions Before R03 Code
- Stop if exact R03 spec is absent from `main`.
- Stop if R03 status is not READY.
- Stop if latest R02 lineage cannot be identified.
- Stop if R02 lacks deterministic credentials.
- Stop if R01 candidate repository is missing.
- Stop if R01 verifier is missing.
- Stop if R01 throttle primitives are missing.
- Stop if Auth.js packages are unexpectedly missing.
- Stop if production DB mutation would be required.
- Stop if workspace UI becomes required.
- Stop if permission-route cutover becomes required.
- Stop if physical legacy deletion becomes required to continue.
- Stop if unrelated product work becomes required.
- Report exact blocker.
- Do not silently broaden scope.

# 12. In Scope — Auth.js Core Configuration
- Define one canonical server Auth.js configuration.
- Configure one internal Credentials provider.
- Use installed `next-auth` API behavior.
- Use `AUTH_SECRET` as session secret authority.
- Use `AUTH_TRUST_HOST` only according to installed behavior.
- Do not enable OAuth.
- Do not enable magic links.
- Do not add a DB session adapter by default.
- Prefer minimal supported session strategy.
- Make real user ID available in server session.
- Make normalized email available when safe.
- Keep tenant out of session authority.
- Keep branch out of session authority.
- Keep role arrays out of session authority.
- Keep permission arrays out of session authority.
- Keep credential state out of session authority.
- Keep password-change timestamp server-only unless explicitly needed.
- Keep Auth.js config server-only.
- Keep Credentials callback thin.
- Delegate credential logic to a server auth orchestrator.
- Avoid DB imports in client components.
- Avoid duplicate Auth.js configs.

# 13. In Scope — Credentials Provider
- Provider receives email and password only.
- Provider tolerates missing credentials object safely.
- Provider validates email type.
- Provider validates password type.
- Provider delegates email normalization to R01 helper.
- Provider delegates credential lookup to R01 repository.
- Provider delegates password verification to R01 verifier.
- Provider invokes dummy KDF when candidate is absent.
- Provider checks throttle before accepting candidate.
- Provider records failed attempts.
- Provider clears failed attempts on success.
- Provider returns minimal Auth.js user.
- Returned ID is real user UUID.
- Returned email is normalized email.
- Returned user excludes password hash.
- Returned user excludes tenant ID.
- Returned user excludes branch ID.
- Returned user excludes role IDs.
- Returned user excludes permission codes.
- Provider failure remains generic.
- Provider must not reinterpret infrastructure failure as success.
- Provider must never use legacy `credentialsMatch()` fallback.

# 14. In Scope — Authentication Service Orchestrator
- Create a focused server-only service.
- Keep provider callback small.
- Own throttle subject derivation.
- Own throttle read.
- Own candidate lookup.
- Own dummy verification.
- Own real verification.
- Own failed-attempt recording.
- Own success clearing.
- Own safe result mapping.
- Avoid one large DB transaction.
- Avoid KDF inside DB transaction.
- Failure recording uses short independent transaction.
- Success clear uses short independent transaction.
- Return deterministic internal result type.
- Keep outward browser failure generic.
- Make service independently testable.
- Do not create a generic workflow engine.

# 15. In Scope — Throttle Subject Derivation
- Derive stable digest from normalized login identifier.
- Never hash password into throttle subject.
- Never use session token as throttle subject.
- Do not make throttle key tenant-dependent.
- Do not make throttle key branch-dependent.
- Browser must not submit the digest as authority.
- Generate digest server-side.
- Use a cryptographic digest with fixed-length output.
- Output must satisfy R01 digest pattern.
- Normalize before hashing.
- Case variants must produce same subject after normalization.
- Surrounding whitespace variants must produce same subject.
- Different emails should produce different fixture digests.
- Avoid new secret unless threat model justifies it.
- Do not log digest unnecessarily.

# 16. In Scope — Auth.js Route Surface
- Add canonical Auth.js catch-all route expected by installed version.
- Export handlers exactly as installed package requires.
- Do not keep two live session issuers.
- Decide whether `/api/auth/login` is retired or a compatibility wrapper.
- If wrapper remains, it delegates only to new auth flow.
- Wrapper must not call legacy `createSession()`.
- Preserve login UX.
- Make logout compatible with Auth.js sign-out.
- If `/api/auth/logout` remains, it delegates to Auth.js authority.
- R06 may delete obsolete endpoints later.
- PR must record exact live endpoints.
- Follow Auth.js CSRF semantics.
- Do not invent conflicting custom CSRF tokens.
- Constrain redirect/callback URLs.
- Reject external redirect targets.
- Preserve safe local `next` path.

# 17. In Scope — Login UI Cutover
- Keep existing visual design unless API integration requires narrow change.
- Keep email field.
- Keep password field.
- Keep loading state.
- Keep generic inline error.
- Replace direct legacy session issuance flow.
- Prefer Auth.js sign-in API supported by installed version.
- Avoid exposing provider internals to UI.
- Preserve safe `nextPath` redirect.
- Sanitize next path as local route.
- Reject arbitrary origin redirect.
- Do not reveal account existence.
- Do not reveal suspension state.
- Do not reveal disabled credential state.
- Do not reveal throttle count.
- Development prefill must not preserve legacy shared authority.
- Test credentials remain test-only.

# 18. In Scope — Session Authority Cutover
- Auth.js session becomes authoritative for new internal logins.
- Protected coarse gate must read Auth.js auth state.
- Server code needing only authentication uses canonical Auth.js server helper.
- Live login must stop issuing `foodflow_session`.
- Legacy cookie recognition is not preferred after cutover.
- Physical legacy code remains until R06.
- Legacy cookie must not override unauthenticated Auth.js result.
- Session subject is real user UUID.
- Session lifetime is explicit.
- Session cookie security follows Auth.js secure defaults/config.
- Do not mirror Auth.js token into custom cookie.
- Do not create parallel identity cookie.
- Do not store tenant in session as final authority.
- Do not store branch in session as final authority.
- R04 derives AccessContext later.
- Session callbacks remain minimal.
- Token callbacks remain minimal.
- Session serialization must be tested.

# 19. In Scope — Proxy / Protected Route Coarse Gate
- Update proxy auth source from custom JOSE to Auth.js-compatible check.
- Preserve protected route matchers.
- `/staff/*` remains authentication-protected.
- `/kitchen/*` remains authentication-protected.
- `/cashier/*` remains authentication-protected.
- `/admin/*` remains authentication-protected.
- Do not enforce staff permissions in R03.
- Do not enforce kitchen permissions in R03.
- Do not enforce cashier permissions in R03.
- Do not enforce admin permissions in R03.
- R05 owns permission-specific routing.
- Unauthenticated user redirects to login.
- Redirect preserves safe local requested path.
- Authenticated no-membership user remains only authenticated in R03.
- R04 handles no-workspace state later.
- Do not embed role names in proxy.
- Avoid edge-incompatible DB queries.
- Follow installed Auth.js proxy pattern.
- Read Next.js 16.3 local docs.

# 20. In Scope — Logout
- Live logout invalidates Auth.js session.
- Browser must no longer depend on deleting only legacy cookie.
- Logout may clear legacy cookie as transition cleanup.
- Legacy cookie cleanup is not authority.
- Logout behavior remains deterministic.
- Logout must not expose token.
- Logout requires no tenant ID.
- Logout requires no branch ID.
- Logout works when already signed out.
- Repeated logout is idempotent to user.
- Protected route after logout redirects to login.
- Stale legacy cookie must not restore auth.

# 21. Out of Scope — Workspace / AccessContext
- No workspace chooser page.
- No multi-workspace UI.
- No tenant selection in Credentials authorize.
- No branch selection in Credentials authorize.
- No final tenant claim authority in session.
- No final branch claim authority in session.
- No active membership selection during login.
- No revocation product flow.
- No membership-change invalidation design beyond basic auth.
- No current-workspace cookie design.
- R04 owns these concerns.

# 22. Out of Scope — Route / Command Authorization
- No per-route permission matrix enforcement.
- No staff permission guard.
- No kitchen permission guard.
- No cashier permission guard.
- No admin permission guard.
- No command permission decorators.
- No server-action authorization framework.
- No permission cache.
- No permission snapshot in session.
- No role snapshot in session.
- R05 owns these concerns.

# 23. Out of Scope — Legacy Physical Removal
- Do not delete `src/lib/auth/config.ts` solely due cutover.
- Do not delete `src/lib/auth/session.ts` solely due cutover.
- Do not delete `src/lib/auth/token.ts` solely due cutover.
- Do not remove JOSE solely in R03.
- Do not remove all FOODFLOW legacy env examples solely in R03.
- Do not delete legacy tests without replacement.
- Mark obsolete paths for R06.
- R06 performs final physical removal.
- R03 may remove live imports from legacy modules.
- R03 may add narrow deprecation comments.
- R03 may clear stale legacy cookie on login/logout.

# 24. Out of Scope — Product Features
- No customer auth.
- No customer profile.
- No cart work.
- No order work.
- No staff workflow expansion.
- No kitchen feature expansion.
- No payment feature expansion.
- No realtime expansion.
- No notifications expansion.
- No voice expansion.
- No unrelated UI redesign.
- No unrelated dependency modernization.
- No production DB reset.
- No production secret rotation.

# 25. Expected Files to CREATE
- `apps/web/next-flow/src/auth.ts`
- Responsibility: canonical Auth.js server configuration.
- Export only server auth primitives supported by installed version.
- Keep Credentials provider definition here or in one focused server module.
- Do not duplicate configuration elsewhere.
- `apps/web/next-flow/src/app/api/auth/[...nextauth]/route.ts`
- Responsibility: Auth.js HTTP handler adapter.
- Export exact installed-version handlers.
- Do not add business logic into route adapter.
- `apps/web/next-flow/src/modules/identity/server/authenticate-internal-user.ts`
- Responsibility: authentication orchestration.
- Own throttle/candidate/verifier composition.
- Return minimal safe result.
- `apps/web/next-flow/src/modules/identity/server/throttle-subject.ts`
- Responsibility: deterministic throttle digest if separate helper is justified.
- May be folded into orchestrator if cleaner.
- `apps/web/next-flow/tests/unit/identity-authenticate-internal-user.test.ts`
- Responsibility: service-level auth behavior.
- Mock boundaries without weakening semantics.
- `apps/web/next-flow/tests/unit/identity-throttle-subject.test.ts`
- Responsibility: digest determinism if helper is separate.
- `apps/web/next-flow/tests/integration/authjs-credentials-authentication.test.ts`
- Responsibility: DB-backed credential flow against R02 fixtures.
- `apps/web/next-flow/tests/integration/authjs-session.test.ts`
- Responsibility: authoritative session behavior and legacy-cookie regression.
- If an equivalent canonical file already exists at implementation time, reuse it.
- Do not create duplicate abstractions only to satisfy names in this section.

# 26. Expected Files to MODIFY
- `apps/web/next-flow/src/app/(auth)/login/login-form.tsx`
- Switch live login from legacy session endpoint to Auth.js-backed path.
- Preserve UX and safe redirect.
- `apps/web/next-flow/src/app/api/auth/login/route.ts`
- Stop issuing custom legacy session.
- Retain only as compatibility wrapper if justified.
- `apps/web/next-flow/src/app/api/auth/logout/route.ts`
- Delegate to Auth.js authority if retained.
- Optionally clear stale legacy cookie.
- `apps/web/next-flow/src/proxy.ts`
- Replace legacy cookie verification with Auth.js coarse gate.
- Preserve route matcher scope.
- `apps/web/next-flow/src/modules/identity/server/index.ts`
- Export new auth service only if useful.
- `apps/web/next-flow/src/lib/auth/index.ts`
- Stop presenting legacy auth as live primary surface.
- Preserve required legacy exports until R06.
- `apps/web/next-flow/.env.example`
- Clarify Auth.js authority.
- Keep legacy vars marked temporary/rollback-only if retained.
- `apps/web/next-flow/tests/integration/auth-session.test.ts`
- Extend/replace legacy-only assertions with Auth.js authority tests.
- Preserve explicit legacy regression checks.
- `apps/web/next-flow/package.json`
- Modify scripts only if new integration tests require discovery.
- No dependency addition by default.
- `.github/workflows/stable-quality-gates.yml`
- Modify only for narrow test discovery if required.
- No workflow redesign.

# 27. Files NOT to MODIFY by Default
- `supabase/migrations/20260822120000_p02_r01_identity_pre_auth_boundary.sql`
- Treat R01 migration as inherited authority.
- `supabase/tests/database/p02_r01_identity_pre_auth_boundary.test.sql`
- Preserve R01 security assertions.
- `supabase/tests/database/p02_r02_identity_authorization_fixtures.test.sql`
- Preserve R02 fixture/authorization assertions.
- `supabase/seed.sql`
- R02 already establishes deterministic credentials.
- `apps/web/next-flow/src/server/db/authentication-transaction.ts`
- Preserve transaction-local pre-auth role.
- `apps/web/next-flow/src/server/db/transaction.ts`
- Preserve tenant transaction semantics.
- `apps/web/next-flow/src/modules/identity/server/credential-repository.ts`
- Reuse candidate lookup contract.
- `apps/web/next-flow/src/modules/identity/server/password-verifier.ts`
- Reuse scrypt contract.
- `apps/web/next-flow/src/modules/identity/server/login-throttle.ts`
- Reuse throttle functions.
- `apps/web/next-flow/tests/fixtures/identity.ts`
- Reuse stable fixture constants.
- Modify inherited files only for a concrete integration defect.
- Explain any inherited-contract change in PR.

# 28. Files to MOVE
- No file move required by default.
- Do not reorganize auth directories to mimic external tutorials.
- Do not move identity server modules into route folders.
- Do not move generated DB types.
- Do not move R02 fixtures.
- Reuse any existing canonical Auth.js file if discovered.

# 29. Files to REMOVE
- No physical legacy source removal required in R03.
- Do not remove JOSE dependency in R03 by default.
- Do not remove legacy config/session/token files in R03 by default.
- Do not remove R02 fixtures.
- Do not remove R01 throttle functions.
- Do not remove `flow_authenticator`.
- Physical cleanup is R06 scope.

# 30. Database Change Policy
- Default schema change: `NO`.
- R01 owns credential schema.
- R01 owns throttle schema.
- R02 owns deterministic fixture data.
- Auth.js Credentials does not inherently require new DB tables.
- Do not add adapter tables by default.
- Prefer Auth.js token/session strategy that needs no new schema.
- Do not create duplicate users table.
- Do not create duplicate credentials table.
- Do not add tenant column to credential table.
- Do not add branch column to credential table.
- Do not add permissions to credential table.
- Do not add session data to credential rows.
- Any schema change requires explicit PR rationale.
- Any migration must be forward-only.
- Never rewrite historical migrations.
- Production DB mutation remains prohibited.

# 31. Auth.js Session Strategy Decision
- Inspect installed `next-auth@5.0.0-beta.32`.
- Inspect installed `@auth/core@0.41.3`.
- Choose simplest supported session strategy.
- Preferred strategy is Auth.js JWT session unless current package behavior requires otherwise.
- Do not implement custom JOSE beside Auth.js.
- Session subject maps to real user UUID.
- Session user ID remains stable.
- Session email may be normalized email.
- Session excludes password hash.
- Session excludes raw password.
- Session excludes throttle digest.
- Session excludes DB URL.
- Session excludes AUTH_SECRET.
- Session excludes FOODFLOW legacy secret.
- Session excludes permission array as authority.
- Session excludes tenant/branch as authority.
- Session max age must be explicit or intentionally inherited.
- Session rotation behavior must be understood.
- Session callbacks must be deterministic.
- Token callbacks must be deterministic.
- Browser-visible session must stay minimal.

# 32. Canonical Auth.js User Shape
- `id` = real `app.users.id`.
- `email` = normalized email.
- `name` may be display-only if safely available.
- Do not broaden pre-auth DB reads only for name.
- Do not include password hash.
- Do not include algorithm.
- Do not include passwordChangedAt in browser session.
- Do not include tenant ID.
- Do not include branch ID.
- Do not include membership ID.
- Do not include role ID.
- Do not include permission array.
- Do not include throttle state.
- Do not include credential disabled state.
- Do not include internal DB role.
- User object must be serializable per installed Auth.js types.

# 33. Credentials Input Contract
- Credentials object may be absent.
- Email may be absent.
- Password may be absent.
- Email may be non-string.
- Password may be non-string.
- Email may contain whitespace.
- Email may contain uppercase.
- Email may be empty.
- Password may be empty.
- Password may exceed maximum.
- Malformed input must not crash provider.
- Malformed input should avoid unnecessary DB calls.
- Empty password fails.
- Empty email fails.
- Normalization uses R01 helper.
- UI validation is not security authority.
- Server validation is mandatory.
- Browser failure remains generic.

# 34. Throttle Evaluation Order
- Normalize identifier.
- Derive throttle subject digest.
- Read throttle state.
- If blocked, reject authentication.
- Apply safe timing discipline for blocked/no-candidate paths.
- Lookup candidate.
- If no candidate, execute dummy password verification.
- If candidate exists, verify real password.
- On failure, record one failed attempt.
- On success, clear failure state.
- Only then return authenticated user.
- Do not issue session before verification.
- Do not record failure after success.
- Do not hold DB transaction during scrypt.
- Do not let later exceptions silently erase failure accounting.

# 35. Blocked Login Semantics
- `isBlocked=true` prevents authentication.
- Blocked state must not reveal account existence.
- Browser must not receive failure count.
- Browser must not receive exact block expiry by default.
- Internal logging may record blocked boolean.
- Blocked request does not clear state.
- Blocked request does not create session.
- Blocked request does not fall back to legacy auth.
- Test explicit observed times where possible.
- Test exact expiry boundary.
- After expiry normal verification may resume.
- Successful verification after expiry may clear state.

# 36. Unknown User Timing Discipline
- Unknown lookup returns no candidate.
- Unknown path must execute dummy verifier.
- Use R01 dummy KDF primitive.
- Do not short-circuit immediately on missing candidate.
- Do not log raw unknown email by default.
- Browser error matches wrong-password class.
- Do not claim perfect network constant-time behavior.
- Prevent obvious no-KDF timing oracle.
- Unit tests assert dummy verifier invocation.

# 37. Wrong Password Semantics
- Candidate exists.
- Real verifier returns false.
- Record one failure.
- Return generic rejection.
- Do not expose user ID.
- Do not expose normalized email confirmation.
- Do not expose remaining attempts.
- Do not create Auth.js user.
- Do not create Auth.js session.
- Repeated failures eventually block.
- Atomic DB function handles concurrent increments.
- Do not read-modify-write count in application.

# 38. Suspended User Semantics
- R01 lookup returns no candidate for suspended user.
- R03 treats it as generic invalid credentials.
- Execute dummy KDF.
- Do not query membership to explain status.
- Do not expose suspension.
- Do not create session.
- Do not fall back to legacy auth.
- Test R02 suspended fixture.

# 39. Disabled Credential Semantics
- R01 lookup returns no candidate.
- Execute dummy KDF.
- Browser sees generic rejection.
- No session is created.
- Do not re-enable credential.
- No password reset workflow.
- No direct credential table query.
- Test R02 disabled fixture.

# 40. Missing Credential Semantics
- Active user without credential returns no candidate.
- Execute dummy KDF.
- Browser sees generic rejection.
- No session.
- Do not reveal user existence.
- Test R02 no-credential fixture.

# 41. No-Membership User Semantics
- Credential lookup returns eligible candidate.
- Password verification succeeds.
- Authentication may succeed.
- Auth.js user ID equals no-membership user UUID.
- Do not reject only because membership absent.
- Keep authentication separate from authorization.
- Coarse proxy may treat user as authenticated.
- R04 handles no-workspace state.
- Do not synthesize membership.
- Do not infer Tenant A from fixture naming.
- Test valid Auth.js session with no membership authority.

# 42. Successful Persona — Owner A
- Email: `owner.a@flow.test`.
- Password comes from R02 test fixture.
- Real user ID comes from R02 fixture.
- Credential repository must return candidate.
- Password verifier must return true.
- Auth.js session subject equals owner UUID.
- Session must not include manager role as authority.
- Session must not include Tenant A as authority.
- Wrong password must fail.
- Uppercase/space email must normalize.

# 43. Successful Persona — Staff A1
- Email: `staff.a1@flow.test`.
- Real user ID comes from R02 fixture.
- Valid password authenticates.
- Session excludes Branch A1 authority.
- Session excludes staff permission array.
- R04 later resolves Branch A1 membership.
- R05 later enforces staff permissions.
- Wrong password fails.

# 44. Successful Persona — Staff A2
- Email: `staff.a2@flow.test`.
- Valid password authenticates.
- Session subject equals Staff A2 UUID.
- Session excludes Branch A2 authority.
- Login does not infer sibling branches.
- R04 later resolves membership.
- Wrong password fails.

# 45. Successful Persona — Kitchen A1
- Email: `kitchen.a1@flow.test`.
- Valid password authenticates.
- Session subject equals Kitchen A1 UUID.
- Session excludes kitchen permissions.
- Provider does not call permission helper.
- R04 resolves branch later.
- R05 enforces kitchen route later.
- Wrong password fails.

# 46. Successful Persona — Cashier A2
- Email: `cashier.a2@flow.test`.
- Valid password authenticates.
- Session subject equals Cashier A2 UUID.
- Session excludes payment permissions.
- Provider does not query payment tables.
- R04 resolves branch later.
- R05 enforces cashier route later.
- Wrong password fails.

# 47. Successful Persona — Staff B1
- Email: `staff.b1@flow.test`.
- Valid password authenticates.
- Session subject equals Tenant B staff UUID.
- Login does not choose Tenant B explicitly.
- Session excludes tenant authority.
- R04 resolves Tenant B workspace later.
- Wrong password fails.

# 48. Legacy Shared Credential Cutover Rule
- `FOODFLOW_INTERNAL_EMAIL` stops being primary identity authority.
- `FOODFLOW_INTERNAL_PASSWORD` stops being primary password authority.
- `FOODFLOW_SESSION_SECRET` stops being live session-signing authority.
- New live path must not call `credentialsMatch()`.
- New live path must not call legacy `createSession()`.
- Proxy must not rely on legacy `verifySession()` as authority.
- Configured shared credential must not authenticate without DB credential.
- Development fallback `admin@foodflow.local` must not be live authority.
- Legacy source may remain for R06 cleanup.
- Successful Auth.js login may clear stale legacy cookie.
- Legacy cookie must not override failed Auth.js state.
- Add legacy credential rejection test.
- R06 removes code/env/dependency later.

# 49. Auth.js Secret Contract
- `AUTH_SECRET` is server-only.
- `.env.example` keeps placeholder only.
- No production fallback secret.
- Missing production secret fails safely.
- Preview uses independent secret.
- Local development follows project secret policy.
- Do not automatically reuse legacy session secret.
- Never log AUTH_SECRET.
- Never expose AUTH_SECRET to client.
- Never prefix AUTH_SECRET with NEXT_PUBLIC.
- Secret rotation productization is outside R03.

# 50. Redirect Safety Contract
- `next` must be same-origin local path.
- Reject absolute external URL.
- Reject protocol-relative URL.
- Reject javascript scheme.
- Invalid path falls back to safe internal route.
- Preserve query only for safe local path.
- Avoid redirect loop to login.
- Successful sign-in uses sanitized destination.
- Failed sign-in remains on login UI.
- Proxy stores only safe requested path.
- Password must never appear in redirect URL.

# 51. Server / Client Boundary
- Credential repository remains server-only.
- Password verifier remains server-only.
- Auth orchestrator remains server-only.
- Auth.js secret remains server-only.
- Database URL remains server-only.
- Throttle state remains server-only.
- Client login sends password only to server auth endpoint.
- Client must not import identity server modules.
- Client bundle must not include test passwords.
- Client bundle must not include DB IDs solely for auth.
- Client bundle must not include AUTH_SECRET.
- Client bundle must not include legacy session secret.
- Browser session exposes minimal safe identity only.

# 52. Error Taxonomy
- Preserve existing typed identity errors.
- Add orchestration error only if useful.
- Distinguish invalid input internally.
- Distinguish credential rejection internally.
- Distinguish blocked state internally.
- Distinguish DB failure internally.
- Distinguish throttle failure internally.
- Distinguish Auth.js configuration failure internally.
- Browser gets small generic error set.
- Never expose EmailNotFound error.
- Never expose SuspendedUser error.
- Never expose DisabledCredential error.
- Never expose DB stack.
- Never expose Auth.js secret/config details.
- Never expose credential encoding.

# 53. Logging Requirements
- Never log raw password.
- Never log password hash.
- Never log scrypt salt.
- Never log derived key.
- Never log AUTH_SECRET.
- Never log FOODFLOW session secret.
- Never log DATABASE_URL.
- Never log full Auth.js token.
- Never log full legacy token.
- Avoid raw login email in routine logs.
- Prefer correlation ID if available.
- Safe field: operation name.
- Safe field: generic outcome class.
- Safe field: blocked boolean.
- Safe field: internal error class.
- Do not log account existence.

# 54. CSRF and Request Integrity
- Follow installed Auth.js Credentials CSRF semantics.
- Do not invent a second conflicting CSRF system.
- Compatibility route must not bypass Auth.js integrity controls.
- Credential submit remains POST.
- Do not accept passwords by GET.
- Do not put password in URL.
- Do not put password in redirect query.
- Do not put credential in analytics.
- Validate content type if custom endpoint remains.
- Malformed JSON fails safely if custom endpoint remains.
- Tests target actual live login path.

# 55. Cookie Requirements
- Auth.js owns authoritative session cookie.
- Do not create second authoritative custom cookie.
- Authoritative cookie must be HttpOnly according to Auth.js defaults.
- Secure in production.
- SameSite appropriate for same-origin app.
- Cookie path covers protected routes.
- Cookie value contains no plaintext credential.
- Legacy cookie is not authoritative after cutover.
- Login may clear stale legacy cookie.
- Logout may clear stale legacy cookie.
- Proxy must not trust stale legacy cookie.
- Add stale-legacy-cookie-only rejection test.
- Avoid hard-coding Auth.js cookie name unless installed API requires it.

# 56. Session Expiration
- Define intended session max age.
- Prefer approximately current eight-hour internal UX unless security design chooses otherwise.
- Document chosen max age.
- Expired Auth.js session fails coarse gate.
- Expired session must not fall back to legacy cookie.
- Session refresh follows Auth.js behavior.
- Do not invent refresh token flow.
- Do not add remember-me UI.
- Do not add device-session management.
- Test expiry where practical.

# 57. Password-Changed Semantics
- R01 candidate includes `passwordChangedAt`.
- Do not expose it to browser.
- Use for invalidation only if implementation has clear need.
- Keep any use server/token-only.
- Do not add complexity only because field exists.
- R04/R06 may handle broader revocation semantics.
- No password-change UI in R03.
- No password reset in R03.
- No credential rotation migration in R03.

# 58. Database Transaction Boundaries
- Throttle read uses short auth transaction.
- Candidate lookup uses short auth transaction.
- Password KDF runs outside DB transaction.
- Failure record uses short auth transaction.
- Success clear uses short auth transaction.
- Session issuance does not hold DB transaction.
- No tenant transaction during credential lookup.
- No actor transaction before identity is known.
- No long transaction across redirect callback.
- No session-level DB role mutation.
- Preserve `SET LOCAL ROLE flow_authenticator` semantics.
- Regression test context leakage if transaction code changes.

# 59. Concurrency Requirements
- Concurrent wrong passwords must not lose increments.
- R03 relies on atomic R01 throttle function.
- Do not cache failure count in memory.
- Do not read then write failure count in app.
- Concurrent success/failure must follow safe DB semantics.
- Session is issued only for verified request.
- Duplicate client submit must not corrupt authority.
- Client duplicate-submit prevention is UX only.
- Server correctness must stand independently.
- Logout remains idempotent.

# 60. Idempotency Requirements
- Credential lookup is read-only.
- Dummy KDF has no persistent side effect.
- Wrong password increments once per authorize attempt.
- Avoid double failure recording across service/provider catches.
- Successful login clears failure state once.
- Repeated clear is harmless.
- Session callbacks do not mutate credentials.
- Session reads do not alter throttle.
- Repeated logout is safe.
- Compatibility retries do not issue legacy session.
- Add test for duplicate failure accounting.

# 61. Performance Requirements
- Do not expand membership graph during login.
- Do not load permission catalog during login.
- Do not load all branches during login.
- Do not query tenant tables during credential lookup.
- One candidate lookup per normal authorize attempt.
- One real KDF per candidate attempt.
- One dummy KDF per no-candidate attempt.
- One throttle read per authorize attempt.
- One throttle write on failure or clear on success.
- Keep DB transactions short.
- Use Node crypto scrypt.
- Do not cache credential hashes.
- Keep session claims small.
- Keep proxy auth check inexpensive.

# 62. Failure Case — DATABASE_URL Unavailable
- Authentication must not succeed.
- Do not fall back to legacy shared credentials.
- Browser receives generic unavailable/failure behavior.
- Internal log may classify DB unavailable.
- No password is logged.
- No session is issued.
- Retry only when infrastructure recovers.

# 63. Failure Case — AUTH_SECRET Missing
- Auth.js configuration must fail safely.
- Do not hard-code fallback secret.
- Do not reuse legacy secret silently.
- Do not issue a session.
- Browser must not see secret/config details.
- Production startup/runtime should surface safe operator error.

# 64. Failure Case — Credential Repository Throws
- No session is issued.
- No legacy credential fallback.
- Preserve internal error category.
- Browser receives generic failure.
- Do not pretend user simply has wrong password if operational handling needs distinction internally.
- Do not leak DB exception.

# 65. Failure Case — Throttle Read Throws
- Fail closed.
- Do not bypass throttle.
- Do not authenticate.
- Do not create session.
- Browser sees generic failure.
- Log safe throttle error category.

# 66. Failure Case — Failure Recording Throws
- Do not silently claim secure failure accounting succeeded.
- Do not issue a session for wrong password regardless.
- Surface safe internal operational failure.
- Browser remains generic.
- Do not retry in a way that double-counts without idempotency design.

# 67. Failure Case — Success Clear Throws
- Decide fail-closed vs proceed with explicit security rationale.
- Preferred default is fail-closed for deterministic throttle integrity.
- Do not silently ignore persistent security-state error.
- No legacy fallback.
- PR must record chosen behavior.
- Tests must cover chosen behavior.

# 68. Failure Case — Password Verifier Throws
- Do not create session.
- Do not expose encoding error.
- Do not downgrade algorithm.
- Do not try legacy password matcher.
- Browser sees generic failure.
- Internal error category remains safe.

# 69. Failure Case — Auth.js Handler Throws
- Do not issue legacy session.
- Browser sees generic auth failure.
- Do not expose stack/secret.
- Preserve safe operator evidence.
- Retry only through normal user action or infrastructure recovery.

# 70. Failure Case — Proxy Auth Helper Throws
- Fail closed to unauthenticated or safe error path.
- Never trust legacy cookie as fallback.
- Never query credentials in proxy.
- Avoid redirect loop.
- Preserve safe requested path where possible.

# 71. Failure Case — Logout Handler Throws
- Do not expose token.
- Do not expose secret.
- Do not create new session.
- Return safe error/redirect behavior.
- Repeated retry must remain safe.

# 72. Failure Case — Malformed next Path
- Reject external origin.
- Reject unsafe scheme.
- Use safe default internal route.
- Do not include credentials in redirect.
- Avoid login self-loop.

# 73. Failure Case — Legacy Cookie Only
- Treat as unauthenticated after preferred cutover.
- Redirect protected routes to login.
- Do not resurrect old fixed user ID.
- Logout may clear cookie.
- Add regression test.

# 74. Failure Case — Tampered Auth.js Session
- Treat as unauthenticated.
- Do not parse user ID from unverified client value.
- Do not fall back to legacy cookie.
- Do not expose verification details.
- Add session rejection test.

# 75. Rollback Strategy
- R03 changes live auth authority.
- Keep source-level legacy code until R06.
- Rollback is explicit source-controlled owner action.
- Never automatic runtime fallback.
- Stale legacy cookie is not rollback mechanism.
- R02 DB credentials remain testable.
- Default R03 has no destructive DB migration.
- Rollback is primarily application-level.
- PR must describe live switch points.

# 76. Suggested Authentication Service API
```ts
export type AuthenticateInternalUserResult =
  | { status: "authenticated"; user: { id: string; email: string } }
  | { status: "rejected" }
  | { status: "blocked" };
```
```ts
export async function authenticateInternalUser(input: {
  email: unknown;
  password: unknown;
}): Promise<AuthenticateInternalUserResult>
```
- Exact syntax may differ.
- Result must not expose hash.
- Result must not expose tenant.
- Result must not expose branch.
- Result must not expose membership.
- Provider maps success to Auth.js user.
- Provider maps rejection/blocked generically.
- Infrastructure errors remain distinct internally.

# 77. Suggested Throttle Subject API
```ts
export function createLoginThrottleSubject(normalizedEmail: string): string
```
- Return 64 lowercase hex chars when SHA-256 is used.
- Input must follow canonical normalization.
- Do not accept browser-provided digest.
- Test deterministic output.
- Test normalized case/space equivalence.
- Keep helper server-only if used only by auth internals.

# 78. Suggested Auth.js Configuration Shape
```ts
const authConfig = {
  providers: [Credentials({ authorize: async (credentials) => {/* delegate */} })],
  callbacks: {
    jwt: async (...) => {/* persist real user id minimally */},
    session: async (...) => {/* expose real user id minimally */},
  },
};
```
- Exact exports follow installed package.
- Do not copy stale v4 examples blindly.
- Do not configure OAuth.
- Keep callbacks minimal.
- Keep auth service separate from provider wiring.

# 79. Session Type Augmentation
- Add focused module augmentation if required for `session.user.id`.
- Prefer existing project type path if present.
- Do not add tenant to session types in R03.
- Do not add branch to session types in R03.
- Do not add permissions to session types in R03.
- Keep user ID as string.
- Successful internal user email should be normalized.
- Ensure declaration is included by tsconfig.
- Do not use global `any` to bypass types.

# 80. Existing Login Endpoint Decision
- Option A: login form uses Auth.js signIn directly.
- Option B: custom login route delegates to new Auth.js/auth service path.
- Choose simplest installed-version-safe option.
- Neither option may call `credentialsMatch()`.
- Neither option may call legacy `createSession()`.
- Neither option may issue `foodflow_session`.
- PR records chosen option.
- Tests target chosen live path.
- R06 may delete compatibility endpoint.

# 81. Existing Logout Endpoint Decision
- Option A: UI uses Auth.js signOut directly.
- Option B: custom logout route delegates to Auth.js signOut.
- Compatibility endpoint may clear legacy cookie.
- Compatibility endpoint is not authority.
- Choose simplest supported path.
- PR records chosen path.
- Test protected route after logout.

# 82. Existing Proxy Decision
- Use Auth.js-supported proxy/middleware wrapper.
- Avoid manual Auth.js cookie parsing.
- Avoid custom Auth.js token decryption.
- Avoid DB queries in edge/proxy if incompatible.
- Coarse gate checks auth only.
- Keep matcher unchanged unless framework syntax requires change.
- Preserve safe redirect.
- PR records runtime pattern.
- R05 adds permission-aware enforcement later.

# 83. Development Fixture Behavior
- R02 test credentials belong to tests.
- Do not display all test passwords in production UI.
- Do not ship production demo account.
- Reassess legacy development credential prefill.
- Local prefill must not remain legacy auth authority.
- Prefer fixture knowledge in test helpers.
- Remove login-page dependency on legacy config if present.
- Do not add new hard-coded production fallback.
- `.env.example` contains no real password.

# 84. Environment Variable Changes
- `AUTH_SECRET` becomes required live session authority.
- `AUTH_TRUST_HOST` follows installed Auth.js behavior.
- `APP_URL` remains app origin.
- `DATABASE_URL` remains credential lookup runtime DB.
- `DATABASE_DIRECT_URL` remains tooling-only.
- `FOODFLOW_INTERNAL_EMAIL` becomes legacy/rollback-only if retained.
- `FOODFLOW_INTERNAL_PASSWORD` becomes legacy/rollback-only if retained.
- `FOODFLOW_SESSION_SECRET` becomes legacy/rollback-only if retained.
- R06 removes obsolete legacy vars later.
- Do not add OAuth client IDs.
- Do not add SMTP secrets.
- Do not add password pepper by default.
- Document local setup without secrets.

# 85. Dependency Policy
- Default no new dependency.
- `next-auth` already installed.
- `@auth/core` already installed.
- JOSE remains until R06 if legacy code still imports it.
- Node crypto exists.
- Kysely exists.
- Vitest exists.
- Do not add bcrypt.
- Do not add argon2.
- Do not add another session library.
- Do not add auth validation package only for convenience.
- Lockfile remains unchanged by default.
- Any dependency change requires PR justification.

# 86. Database Role Requirements
- `flow_authenticator` remains NOLOGIN.
- `flow_authenticator` remains NOBYPASSRLS.
- Provider does not use DB owner for direct credential reads.
- Credential lookup stays behind approved function.
- Throttle stays behind approved functions.
- No direct credential-table select grant.
- No direct throttle-table select grant.
- No broad user-table select grant.
- No domain-table grants to pre-auth role.
- Session callbacks do not misuse pre-auth role for tenant operations.
- R04 uses authenticated actor for workspace queries.

# 87. RLS Requirements
- Do not weaken R01 RLS/privilege boundary.
- Do not weaken R04 RLS baseline.
- Do not add BYPASSRLS.
- Do not add broad grants for callbacks.
- Login needs no tenant RLS context.
- No actor context exists before credential verification.
- Auth.js user ID becomes actor candidate after login.
- No tenant context fabricated during login.
- R02 authorization tests remain valid.
- R04 self-elevation tests remain valid.
- No-membership user proves auth/RLS separation.

# 88. SECURITY DEFINER Requirements
- Do not create new SECURITY DEFINER function by default.
- Reuse R01 auth functions.
- If unavoidable, fixed search_path is mandatory.
- Revoke public execute.
- Grant least privilege.
- Avoid dynamic SQL.
- Return minimal data.
- Add negative privilege test.
- Prefer application composition over DB surface expansion.

# 89. Authentication / Authorization Separation
- Authentication asks who proved valid credential.
- Authorization asks what actor may do.
- R03 owns authentication.
- R04/R05 own authorization behavior.
- Credentials provider does not require role.
- Credentials provider does not require branch.
- Provider does not require staff permission.
- Provider does not require admin permission.
- No-membership fixture may authenticate.
- Suspended user cannot authenticate due candidate eligibility.
- Disabled credential cannot authenticate.
- Membership state is not role gate in provider.
- Tests must reflect inherited contract.

# 90. Session Claim Policy
- User subject = real user UUID.
- Email = normalized email.
- Optional name = display-only.
- No tenant ID.
- No branch ID.
- No restaurant ID.
- No membership ID.
- No role code.
- No permission array.
- No password hash.
- No credential algorithm.
- No throttle digest.
- No blocked flag.
- No internal DB role.
- No legacy fixed user ID.

# 91. Session Consumer Contract
- Server can obtain authenticated user ID.
- Server can distinguish unauthenticated.
- Server must not treat session existence as full authorization.
- R04 can accept authenticated user ID.
- R05 combines actor + AccessContext + permission checks later.
- UI may display generic authenticated identity.
- UI must not assume workspace from session alone.
- Proxy may use session for coarse auth only.
- Domain commands must not be authorized only by session existence.

# 92. Legacy Cookie Transition Matrix
- No cookie => unauthenticated.
- Valid legacy cookie only => unauthenticated after preferred cutover.
- Invalid legacy cookie only => unauthenticated.
- Valid Auth.js session only => authenticated.
- Auth.js session + stale legacy cookie => Auth.js governs.
- Expired Auth.js + valid legacy cookie => unauthenticated.
- Logout clears Auth.js authority.
- Logout may clear stale legacy cookie.
- Successful login does not issue `foodflow_session`.
- Failed login issues no session.

# 93. Credentials Provider Test — Valid Owner
- Input owner fixture email/password.
- Expected authenticated.
- Expected real owner user ID.
- Expected normalized owner email.
- Expected no password hash in result.
- Expected throttle clear on success.

# 94. Credentials Provider Test — Valid Staff A1
- Input Staff A1 fixture email/password.
- Expected authenticated.
- Expected real Staff A1 user ID.
- Expected no branch claim authority.
- Expected no permission array.
- Expected throttle clear.

# 95. Credentials Provider Test — Valid Kitchen
- Input Kitchen A1 fixture email/password.
- Expected authenticated.
- Expected real Kitchen A1 user ID.
- Expected no kitchen permission array in session.
- Expected no tenant claim authority.
- Expected throttle clear.

# 96. Credentials Provider Test — Valid Cashier
- Input Cashier A2 fixture email/password.
- Expected authenticated.
- Expected real Cashier A2 user ID.
- Expected no payment permission claims.
- Expected no branch claim authority.
- Expected throttle clear.

# 97. Credentials Provider Test — Valid Tenant B Staff
- Input Staff B1 fixture email/password.
- Expected authenticated.
- Expected Tenant B staff user UUID.
- Expected no Tenant B claim authority in session.
- R04 resolves workspace later.
- Wrong password still rejects.

# 98. Credentials Provider Test — Valid No-Membership User
- Input no-membership fixture email/password.
- Expected authenticated identity.
- Expected real no-membership UUID.
- Expected no tenant/branch authority.
- Provider must not query membership as gate.
- R04 handles no workspace later.

# 99. Credentials Provider Test — Wrong Password
- Candidate exists.
- Real verifier returns false.
- Expected rejected.
- Expected one failure record.
- Expected no session.
- Expected generic outward error.

# 100. Credentials Provider Test — Unknown Email
- Candidate absent.
- Dummy verifier invoked.
- Expected rejected.
- Expected no account-existence leak.
- Expected failure accounting according to policy.
- Expected no session.

# 101. Credentials Provider Test — Suspended User
- Candidate absent due status.
- Dummy verifier invoked.
- Expected rejected.
- Expected no suspension leak.
- Expected no session.

# 102. Credentials Provider Test — Disabled Credential
- Candidate absent due disabled credential.
- Dummy verifier invoked.
- Expected rejected.
- Expected no credential-state leak.
- Expected no session.

# 103. Credentials Provider Test — Missing Credential
- Candidate absent.
- Dummy verifier invoked.
- Expected rejected.
- Expected no user-existence leak.
- Expected no session.

# 104. Credentials Provider Test — Invalid Input
- Null credentials rejected safely.
- Missing email rejected safely.
- Missing password rejected safely.
- Non-string email rejected safely.
- Non-string password rejected safely.
- Empty email rejected safely.
- Empty password rejected safely.
- Oversized email rejected safely.
- Oversized password rejected safely.
- No crash.
- No session.

# 105. Credentials Provider Test — Blocked Subject
- Throttle reports blocked.
- Expected no authentication.
- Expected no session.
- Expected generic outward error.
- Expected no legacy fallback.
- Expected no throttle clear.

# 106. Authentication Service Unit Tests
- Candidate lookup not called for structurally invalid email when avoidable.
- Throttle evaluated for valid normalized identifier.
- Dummy verifier called when candidate null.
- Real verifier called when candidate exists.
- Failure recorder called exactly once for wrong password.
- Failure recorder behavior for no-candidate follows policy.
- Success clear called exactly once after valid password.
- Success clear not called on failure.
- Service returns real user ID on success.
- Service returns normalized email.
- Service never returns hash.
- Service never returns tenant/branch.
- DB errors remain safe internal errors.
- Throttle errors remain safe internal errors.
- Duplicate failure accounting is prevented.

# 107. Throttle Subject Unit Tests
- Owner email produces expected fixed-length digest.
- Same normalized email is deterministic.
- Uppercase/whitespace normalization yields same digest.
- Different fixture emails yield different digest.
- Empty normalized input is rejected upstream.
- Output matches R01 digest regex.
- Browser cannot supply authoritative digest.
- Helper does not log email.

# 108. Auth.js Callback Unit Tests
- JWT callback preserves real user ID.
- JWT callback does not preserve password hash.
- JWT callback does not store tenant ID.
- JWT callback does not store branch ID.
- JWT callback does not store permissions.
- Session callback exposes real user ID.
- Session callback exposes normalized email only as identity.
- Missing/invalid subject fails safely.
- Arbitrary client actor ID cannot override token subject.
- Callback does not query credential table.
- Callback does not mutate throttle state.

# 109. Auth.js Route Integration Tests
- Valid owner credential creates session.
- Valid staff credential creates session.
- Valid kitchen credential creates session.
- Valid cashier credential creates session.
- Valid Tenant B staff credential creates session.
- Valid no-membership credential creates session.
- Wrong password creates no session.
- Unknown email creates no session.
- Suspended user creates no session.
- Disabled credential creates no session.
- Missing credential creates no session.
- Blocked subject creates no session.
- Malformed request creates no session.
- Successful session can be retrieved.
- Session ID matches fixture user ID.
- Logout invalidates session.
- Tampered session rejected.
- Legacy cookie alone rejected.

# 110. Login UI Integration Tests
- Email field required.
- Password field required.
- Submit disabled/loading during request.
- Generic error on invalid credentials.
- No account-state-specific text.
- Successful sign-in redirects to safe next path.
- External next path rejected.
- Loading state resets on failure.
- Network failure displays generic error.
- Password never appears in URL.
- Browser never receives password hash.
- Login response does not grant tenant/branch authority.
- Legacy shared credential no longer silently works.

# 111. Proxy Integration Tests
- Unauthenticated `/staff` redirects.
- Unauthenticated `/kitchen` redirects.
- Unauthenticated `/cashier` redirects.
- Unauthenticated `/admin` redirects.
- Auth.js-authenticated owner passes coarse gate.
- Auth.js-authenticated staff passes coarse gate.
- Auth.js-authenticated no-membership user follows documented coarse-auth behavior.
- Legacy cookie only cannot pass.
- Tampered Auth.js session cannot pass.
- Redirect preserves safe path.
- Proxy does not evaluate permissions.
- Proxy does not query credentials.

# 112. Logout Integration Tests
- Authenticated user can sign out.
- Session absent after sign-out.
- Protected route redirects after sign-out.
- Repeated sign-out safe.
- Stale legacy cookie may be cleared.
- Logout needs no membership.
- Logout exposes no token.
- Logout creates no new session.

# 113. Database Regression Tests
- R01 credential lookup tests remain valid.
- R01 throttle tests remain valid.
- R01 least-privilege tests remain valid.
- R02 deterministic fixture tests remain valid.
- R02 membership tests remain valid.
- R02 permission tests remain valid.
- R02 cross-tenant tests remain valid.
- R02 cross-branch tests remain valid.
- R04 actor/RLS baseline remains valid.
- No broad grant is added.
- No historical migration edited.
- Clean reset reproduces fixtures.

# 114. Security Negative Matrix — Client Data
- Client cannot read password hash.
- Client cannot read raw password after submission.
- Client cannot read AUTH_SECRET.
- Client cannot read DATABASE_URL.
- Client cannot inject authoritative actor ID.
- Client cannot inject tenant authority at login.
- Client cannot inject branch authority at login.
- Client cannot inject role authority at login.
- Client cannot inject permission authority at login.

# 115. Security Negative Matrix — Legacy Authority
- Legacy shared email/password cannot create authoritative session.
- Legacy fallback dev credential cannot create authoritative session.
- Legacy cookie alone cannot authenticate protected route.
- Legacy token cannot override Auth.js unauthenticated state.
- Legacy fixed user ID cannot appear as new session subject.
- Legacy session secret is not new session authority.

# 116. Security Negative Matrix — Database Privilege
- `flow_authenticator` cannot directly read credential table.
- `flow_authenticator` cannot directly read throttle table.
- `flow_authenticator` cannot broadly read users.
- `flow_authenticator` cannot read FoodFlow orders.
- `flow_authenticator` cannot read payments.
- `flow_authenticator` cannot read audit events.
- Approved credential lookup remains executable.
- Approved throttle functions remain executable.
- No BYPASSRLS.

# 117. Security Negative Matrix — Identity Enumeration
- Unknown email does not receive unique message.
- Suspended email does not receive unique message.
- Disabled credential does not receive unique message.
- Missing credential does not receive unique message.
- Wrong password receives same generic class.
- Blocked state does not reveal account existence.
- Logs avoid account-existence detail in normal path.

# 118. Security Negative Matrix — Session Claims
- Session contains no password.
- Session contains no hash.
- Session contains no credential algorithm.
- Session contains no throttle digest.
- Session contains no tenant authority.
- Session contains no branch authority.
- Session contains no role authority.
- Session contains no permission authority.
- Session contains real user ID only as identity authority.

# 119. R02 Fixture Consumption Rules
- Import TypeScript fixture constants from `tests/fixtures/identity.ts`.
- Avoid duplicating UUID literals in new Node tests.
- SQL tests may continue stable literals when needed.
- Keep passwords only in test code.
- Do not move test passwords to application source.
- Do not expose test passwords in production login UI.
- Preserve Tenant A/B isolation.
- Preserve Branch A1/A2 separation.
- Preserve no-membership persona.

# 120. Test Isolation Rules
- Tests must not depend on order.
- Throttle tests isolate mutated subject.
- Do not use real user emails.
- Use deterministic fixture identities.
- Avoid persistent session state between tests.
- Destroy DB runtime after DB integration suite.
- Clear cookies/session client state between auth tests.
- Parallel tests must not share throttle subject unless intentional.
- Cleanup must not broaden DB privileges.

# 121. Throttle Test Cleanup
- Use approved server clear helper where possible.
- Do not grant application direct delete on throttle table.
- SQL setup may use existing test owner conventions.
- Clean blocked state after threshold tests.
- Do not contaminate valid-login tests.
- Use unique digest when isolation requires.
- Do not weaken grants for cleanup convenience.

# 122. Infrastructure Failure Tests
- Mock candidate repository failure.
- Mock throttle-read failure.
- Mock failure-record failure.
- Mock success-clear failure.
- Mock password verifier error.
- Mock missing Auth.js configuration where practical.
- Assert no authenticated result.
- Assert no legacy fallback.
- Assert generic outward behavior.
- Assert secrets absent from error strings.
- Assert password absent from logs if logger tested.

# 123. Input Boundary Tests
- Email length zero.
- Email whitespace only.
- Email at configured max.
- Email over configured max.
- Password length zero.
- Password at configured max.
- Password over configured max.
- Email non-string.
- Password non-string.
- Credentials null.
- Missing email.
- Missing password.
- Unicode handling remains deterministic per R01 helper.
- Do not introduce second inconsistent validator.

# 124. Redirect Boundary Tests
- `/staff` accepted.
- `/staff?x=1` accepted.
- `/kitchen/orders` accepted.
- Absolute external URL rejected.
- Protocol-relative URL rejected.
- Javascript scheme rejected.
- Empty next uses default.
- `/login` next avoids self-loop.
- Malformed encoding fails safely.
- Query contains no password.

# 125. Session Serialization Tests
- Real user ID survives into server session.
- Normalized email survives into session identity.
- Password absent.
- Hash absent.
- Tenant ID absent.
- Branch ID absent.
- Permissions absent.
- Roles absent.
- Throttle state absent.
- Legacy `foodflow-internal` ID absent for new sessions.

# 126. Session Tamper Tests
- Modified token rejected.
- Wrong signature rejected.
- Expired token rejected.
- Missing user ID rejected or unauthenticated.
- Non-string user ID fails safely.
- Arbitrary actor injection rejected.
- Legacy token is not Auth.js authority.
- Verification failure leaks no secret.

# 127. App Router Server Usage
- Prefer server Auth.js helper in server components/routes.
- Client session is not security authority.
- Server route handlers re-check session.
- Never trust client-provided user ID.
- Never trust client email as post-login authority.
- Never pass raw token into client props.
- Follow Next.js 16.3 docs.

# 128. Auth.js Version Safety
- Inspect actual package exports.
- Inspect Credentials provider types.
- Inspect handler export pattern.
- Inspect server `auth()` support.
- Inspect proxy/middleware support.
- Inspect signIn/signOut APIs.
- Do not assume v4 API.
- Do not assume future v5 API.
- Record installed versions in PR.
- Keep lockfile compatible.

# 129. Next.js 16.3 Safety
- Read local `node_modules/next/dist/docs/`.
- Confirm proxy convention.
- Confirm route handler behavior.
- Confirm cookies/request APIs if touched.
- Avoid deprecated middleware assumptions.
- Avoid auth-page rendering surprises.
- Build must compile App Router auth routes.
- Keep client/server boundaries valid.

# 130. R03 Schema Decision Record
- Default `SCHEMA_CHANGED: NO`.
- Default `NEW_MIGRATION: NO`.
- If adapter tables become necessary, justify before implementing.
- Do not create duplicate users table.
- Do not create OAuth account tables for no OAuth provider.
- Do not add tenant/branch columns to session storage.
- Any deviation is prominent in PR.

# 131. R03 Dependency Decision Record
- Default `PACKAGE_DEPENDENCIES_CHANGED: NO`.
- Default `PACKAGE_LOCK_CHANGED: NO`.
- Auth.js already installed.
- Node crypto already installed with runtime.
- Existing tests are sufficient.
- No new hashing package.
- No new cookie package.
- No new auth package.
- Any deviation requires rationale.

# 132. R03 Live Behavior Decision Record
- `AUTHJS_LIVE_CUTOVER: YES`.
- `DATABASE_CREDENTIAL_AUTHORITY: YES`.
- `LEGACY_SHARED_CREDENTIAL_AUTHORITY: NO`.
- `LEGACY_SOURCE_PHYSICAL_REMOVAL: NO`.
- `LEGACY_COOKIE_AUTHORITY: NO` preferred.
- `WORKSPACE_RESOLUTION: NO`.
- `PERMISSION_ROUTE_CUTOVER: NO`.
- `PRODUCTION_DB_MODIFIED: NO`.
- `CUSTOMER_AUTH_CHANGED: NO`.

# 133. Implementation Order — 01
- Re-fetch current main.
- Read current policy.
- Read current README.
- Read exact R03 spec.
- Identify latest R02 branch.
- Record exact parent SHA.

# 134. Implementation Order — 02
- Read local Next.js auth/proxy docs.
- Inspect installed next-auth exports.
- Inspect installed @auth/core exports.
- Inspect current login route.
- Inspect current logout route.
- Inspect current proxy.

# 135. Implementation Order — 03
- Re-read R01 normalization helper.
- Re-read R01 credential repository.
- Re-read R01 password verifier.
- Re-read R01 throttle module.
- Re-read R02 identity fixtures.
- Re-read R02 integration tests.

# 136. Implementation Order — 04
- Define canonical Auth.js config.
- Define minimal Auth.js user/session types.
- Define session strategy.
- Define session max age.
- Define live login integration path.
- Define live logout integration path.

# 137. Implementation Order — 05
- Implement throttle subject derivation.
- Add digest tests.
- Implement auth orchestrator.
- Add orchestrator unit tests.
- Preserve no-KDF oracle mitigation.
- Preserve atomic failure recording.

# 138. Implementation Order — 06
- Wire Credentials provider.
- Add Auth.js handlers.
- Add JWT/session callbacks.
- Ensure real user ID propagation.
- Ensure minimal session claims.
- Ensure no legacy fallback.

# 139. Implementation Order — 07
- Cut login form to new flow.
- Retire legacy live session issuance.
- Sanitize redirect behavior.
- Preserve generic errors.
- Preserve loading UX.
- Add login-path integration tests.

# 140. Implementation Order — 08
- Cut logout to Auth.js.
- Clear stale legacy cookie if chosen.
- Cut proxy coarse auth to Auth.js.
- Preserve matcher routes.
- Add session/proxy/logout tests.
- Add legacy-cookie rejection tests.

# 141. Implementation Order — 09
- Run R01 regressions.
- Run R02 regressions.
- Run R04 RLS regressions.
- Run auth unit tests.
- Run auth integration tests.
- Run application quality/build.

# 142. Implementation Order — 10
- Open/update exactly one R03 PR.
- Record exact parent/head SHA.
- Record session strategy.
- Record live endpoint choices.
- Record validation results truthfully.
- Stop without merging implementation PR.

# 143. Validation Commands — Application
```bash
cd apps/web/next-flow
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build:next
```
- Use current scripts from implementation parent as authority.
- Do not fabricate outcomes.
- Record actual implementation results in PR.
- Document validation does not depend on GitHub Actions.

# 144. Validation Commands — Database
```bash
./apps/web/next-flow/node_modules/.bin/supabase start
./apps/web/next-flow/node_modules/.bin/supabase db reset --local
./apps/web/next-flow/node_modules/.bin/supabase test db --local
./apps/web/next-flow/node_modules/.bin/supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```
- R03 normally adds no schema.
- Clean reset proves inherited fixtures/RLS remain reproducible.
- R01/R02/R04 DB tests remain required implementation regressions.

# 145. Validation Commands — Generated Types
```bash
cd apps/web/next-flow
npm run db:verify-types
```
- Run generation only when current workflow requires it.
- R03 should not alter generated DB types by default.
- Unexpected generated diff in no-schema-change round must be investigated.

# 146. Validation Vocabulary
- `PASS`.
- `FAIL`.
- `NOT RUN`.
- `BLOCKED`.
- `NOT APPLICABLE`.
- Do not call unrun work PASS.
- Do not suppress implementation failures.
- These results are implementation evidence, not document validation authority.

# 147. Definition of Done — Auth.js Core
- [ ] Canonical Auth.js config exists.
- [ ] Installed API verified.
- [ ] Credentials provider is internal provider for R03.
- [ ] AUTH_SECRET is live session secret authority.
- [ ] Real DB user ID is session subject.
- [ ] Session shape minimal.
- [ ] No tenant authority in session.
- [ ] No branch authority in session.
- [ ] No permissions in session.
- [ ] No password/hash in session.

# 148. Definition of Done — Credential Verification
- [ ] R01 normalization reused.
- [ ] R01 candidate repository reused.
- [ ] R01 real verifier reused.
- [ ] R01 dummy verifier reused.
- [ ] Unknown user runs dummy KDF.
- [ ] Wrong password records failure.
- [ ] Success clears failure state.
- [ ] Blocked subject cannot authenticate.
- [ ] No legacy credential fallback.
- [ ] No long DB transaction around KDF.

# 149. Definition of Done — Live Login
- [ ] Login UI uses Auth.js-backed path.
- [ ] Legacy custom login no longer issues authoritative custom session.
- [ ] Shared env credential no longer primary authority.
- [ ] R02 fixture credentials authenticate in integration tests.
- [ ] Generic error behavior preserved.
- [ ] Safe redirect preserved.
- [ ] No password leaks to URL/log/session.

# 150. Definition of Done — Session Cutover
- [ ] Auth.js session is authoritative.
- [ ] Protected coarse gate uses Auth.js auth state.
- [ ] New login does not issue `foodflow_session`.
- [ ] Legacy cookie alone does not authenticate.
- [ ] Session contains real user ID.
- [ ] Tampered session rejected.
- [ ] Expired session rejected where practical.
- [ ] Logout invalidates Auth.js session.

# 151. Definition of Done — Scope Discipline
- [ ] No workspace chooser.
- [ ] No tenant selector.
- [ ] No branch selector.
- [ ] No final AccessContext.
- [ ] No permission-specific proxy logic.
- [ ] No command permission framework.
- [ ] No physical legacy deletion.
- [ ] No customer auth.
- [ ] No unrelated product work.
- [ ] No production DB mutation.

# 152. Definition of Done — Security
- [ ] No secret committed.
- [ ] No password logged.
- [ ] No hash logged.
- [ ] No token logged.
- [ ] No account enumeration response.
- [ ] Dummy KDF path active.
- [ ] Throttle enforced.
- [ ] flow_authenticator remains narrow.
- [ ] No broad grants.
- [ ] No tenant/permission session authority.
- [ ] Legacy cookie authority disabled.

# 153. Definition of Done — Tests
- [ ] Auth service unit tests.
- [ ] Throttle digest tests.
- [ ] Auth.js provider/integration tests.
- [ ] Session tests.
- [ ] Login live-path tests.
- [ ] Proxy coarse-gate tests.
- [ ] Logout tests.
- [ ] Legacy credential rejection test.
- [ ] Legacy cookie rejection test.
- [ ] R01 regressions.
- [ ] R02 fixture/authorization regressions.
- [ ] R04 RLS/self-elevation regressions.

# 154. Definition of Done — Quality
- [ ] Lint PASS.
- [ ] Typecheck PASS.
- [ ] Unit tests PASS.
- [ ] Integration tests PASS.
- [ ] Next build PASS.
- [ ] Clean DB reset PASS.
- [ ] SQL tests PASS.
- [ ] DB lint PASS.
- [ ] Generated type verification PASS or truthful blocker.
- [ ] PR records exact outcomes.

# 155. Implementation PR Required Metadata
- `Specification: FLOW_P02_R03_IMPLEMENTATION_SPEC.md`.
- `Phase: 02`.
- `Round: 03`.
- `Previous: FLOW_P02_R02_IMPLEMENTATION_SPEC.md`.
- `Next Specification: FLOW_P02_R04_IMPLEMENTATION_SPEC.md`.
- `IMPLEMENTATION_PARENT_BRANCH`.
- `IMPLEMENTATION_PARENT_SHA`.
- `IMPLEMENTATION_BRANCH`.
- `IMPLEMENTATION_HEAD_SHA`.
- `AUTHJS_VERSION`.
- `AUTH_CORE_VERSION`.
- `SESSION_STRATEGY`.
- `LIVE_LOGIN_PATH`.
- `LIVE_LOGOUT_PATH`.
- `PROXY_AUTH_SOURCE`.
- `LEGACY_COOKIE_AUTHORITY`.
- `SCHEMA_CHANGED`.
- `NEW_MIGRATION`.
- `PACKAGE_DEPENDENCIES_CHANGED`.
- `PRODUCTION_DB_MODIFIED`.
- `AUTHJS_LIVE_CUTOVER`.
- `LEGACY_AUTH_PHYSICALLY_REMOVED`.

# 156. Implementation PR Required Summary
- State Auth.js API pattern used.
- State Credentials provider delegation.
- State throttle-subject design.
- State blocked behavior.
- State unknown-user dummy KDF behavior.
- State session claims.
- State login cutover.
- State logout cutover.
- State proxy cutover.
- State legacy credential behavior.
- State legacy cookie behavior.
- State no-membership behavior.
- State validation results.
- State R04/R05/R06 deferrals.

# 157. Implementation PR Merge Control
- Implementation PR merge is owner-controlled.
- Development agent must not merge R03 implementation PR.
- Development agent must not enable auto-merge.
- Development agent stops after implementation/validation/PR update.
- Specification automation may merge only documentation spec PR.
- Do not confuse spec merge with implementation merge.

# 158. R04 Handoff Objective
- R04 receives stable authenticated user ID from Auth.js.
- R04 receives normalized email when needed as identity/display data.
- R04 receives no password/hash.
- R04 resolves active memberships.
- R04 resolves available tenants.
- R04 resolves available branches.
- R04 creates AccessContext.
- R04 handles no-membership session.
- R04 handles membership changes/revocation.
- R04 defines workspace selection persistence.
- R03 leaves these concerns unimplemented but enabled.

# 159. R04 Required Inherited State
- Auth.js live authentication works.
- Auth.js server session helper works.
- Session subject is real user UUID.
- DB credentials are authoritative.
- Legacy shared credentials are not live authority.
- R02 deterministic memberships remain available.
- R02 roles/permissions remain available.
- R01 DB transaction helpers remain available.
- Tenant/branch are not permanently baked into auth identity.
- Permission list is not final session authority.

# 160. R05 Future Boundary
- R05 later enforces route permissions.
- R05 later enforces command permissions.
- R03 must not preempt R05.
- Coarse authentication proxy is valid R03 output.
- R05 consumes R04 AccessContext and permission helpers.
- R03 session alone is never full authorization.

# 161. R06 Future Boundary
- R06 deletes legacy auth files.
- R06 removes unused FOODFLOW internal vars.
- R06 removes unused legacy session secret.
- R06 removes JOSE if no longer used.
- R06 removes obsolete compatibility endpoints.
- R06 performs final security acceptance.
- R03 should make R06 deletion mechanical.

# 162. Explicit Prohibitions — Auth
- NO shared env credential fallback.
- NO hard-coded Auth.js secret.
- NO OAuth provider.
- NO social login.
- NO magic link.
- NO password reset.
- NO MFA.
- NO second user table.
- NO second credential table.
- NO custom parallel session JWT.
- NO password hash in session.
- NO tenant permission snapshot in session.
- NO broad DB owner auth path.
- NO browser-provided actor authority.

# 163. Explicit Prohibitions — Scope
- NO workspace chooser.
- NO final AccessContext.
- NO route permission cutover.
- NO command permission cutover.
- NO legacy physical deletion.
- NO customer auth.
- NO order work.
- NO kitchen feature work.
- NO payment feature work.
- NO realtime feature work.
- NO voice work.
- NO unrelated UI refactor.
- NO unrelated dependency upgrade.

# 164. Explicit Prohibitions — Data / Security
- NO plaintext password storage.
- NO reversible password encryption.
- NO fast digest replacing scrypt.
- NO production password fixture.
- NO production user fixture.
- NO raw password logs.
- NO hash logs.
- NO session token logs.
- NO AUTH_SECRET logs.
- NO DATABASE_URL logs.
- NO BYPASSRLS grant.
- NO broad private-table grant.
- NO historical migration rewrite.

# 165. Explicit Prohibitions — Delivery
- NO direct implementation push to main.
- NO implementation PR merge by agent.
- NO implementation auto-merge.
- NO fabricated validation.
- NO hiding implementation failures.
- NO starting R04 implementation from this documentation task.
- NO duplicate R03 implementation branches.

# 166. File Review Checklist — Repository / Environment
- [ ] `apps/web/next-flow/package.json`.
- [ ] `apps/web/next-flow/package-lock.json`.
- [ ] `apps/web/next-flow/.env.example`.
- [ ] `apps/web/next-flow/AGENTS.md`.
- [ ] Current tsconfig.
- [ ] Current Next.js local docs.
- [ ] Installed next-auth package exports/types.
- [ ] Installed @auth/core package exports/types.

# 167. File Review Checklist — Live Auth
- [ ] `src/app/(auth)/login/page.tsx`.
- [ ] `src/app/(auth)/login/login-form.tsx`.
- [ ] `src/app/api/auth/login/route.ts`.
- [ ] `src/app/api/auth/logout/route.ts`.
- [ ] `src/lib/auth/index.ts`.
- [ ] `src/lib/auth/config.ts`.
- [ ] `src/lib/auth/session.ts`.
- [ ] `src/lib/auth/token.ts`.
- [ ] `src/proxy.ts`.

# 168. File Review Checklist — R01 Identity
- [ ] `src/modules/identity/server/index.ts`.
- [ ] `src/modules/identity/server/email.ts`.
- [ ] `src/modules/identity/server/errors.ts`.
- [ ] `src/modules/identity/server/policy.ts`.
- [ ] `src/modules/identity/server/credential-repository.ts`.
- [ ] `src/modules/identity/server/password-verifier.ts`.
- [ ] `src/modules/identity/server/login-throttle.ts`.
- [ ] `src/modules/identity/server/types.ts`.
- [ ] `src/server/db/authentication-transaction.ts`.

# 169. File Review Checklist — R02 Fixtures / Tests
- [ ] `tests/fixtures/identity.ts`.
- [ ] `tests/integration/identity-authorization-contract.test.ts`.
- [ ] `supabase/tests/database/p02_r02_identity_authorization_fixtures.test.sql`.
- [ ] `supabase/seed.sql`.
- [ ] R01 SQL auth tests.
- [ ] R04 actor/RLS tests.

# 170. Current Behavior Assertions to Re-Verify
- [ ] Login form still targets legacy route before R03 edits.
- [ ] Login route still uses legacy credential matcher before R03 edits.
- [ ] Legacy cookie remains `foodflow_session` before R03 edits.
- [ ] Proxy still verifies legacy token before R03 edits.
- [ ] Auth.js packages remain installed.
- [ ] AUTH_SECRET placeholder remains present.
- [ ] R01 repository returns real user UUID.
- [ ] R01 verifier supports scrypt-v1.
- [ ] R01 dummy verifier exists.
- [ ] R01 throttle helpers exist.
- [ ] R02 positive fixtures exist.
- [ ] R02 no-membership fixture exists.
- [ ] R02 denial fixtures exist.

# 171. Session Security Checklist
- [ ] HttpOnly authoritative cookie.
- [ ] Secure in production.
- [ ] SameSite appropriate.
- [ ] No duplicate custom authoritative cookie.
- [ ] No secret in client.
- [ ] Real user UUID claim.
- [ ] No tenant claim authority.
- [ ] No branch claim authority.
- [ ] No permission claim authority.
- [ ] No password/hash.
- [ ] Intentional expiry.
- [ ] Tamper rejection tested.
- [ ] Legacy cookie non-authoritative.

# 172. Credential Security Checklist
- [ ] Normalize with R01 helper.
- [ ] Bound password input.
- [ ] Read throttle before acceptance.
- [ ] Use R01 repository.
- [ ] Use R01 scrypt verifier.
- [ ] Use R01 dummy verifier.
- [ ] Record failure atomically.
- [ ] Clear success state.
- [ ] No direct credential table read.
- [ ] No legacy fallback.
- [ ] Generic outward errors.
- [ ] No credential logging.

# 173. Authentication / Authorization Boundary Checklist
- [ ] Provider does not query membership as login gate.
- [ ] Provider does not query permissions.
- [ ] Provider does not choose tenant.
- [ ] Provider does not choose branch.
- [ ] Session does not contain final workspace.
- [ ] No-membership user can authenticate identity.
- [ ] R04 handoff uses real actor ID.
- [ ] R05 remains permissions owner.

# 174. Failure Safety Checklist
- [ ] DB unavailable => no fallback.
- [ ] Auth secret unavailable => no fallback.
- [ ] Throttle unavailable => fail closed.
- [ ] Candidate error => no session.
- [ ] Verifier error => no session.
- [ ] Auth.js error => no legacy session.
- [ ] Proxy auth error => unauthenticated/safe.
- [ ] Logout error => no secret leak.
- [ ] Invalid redirect => safe fallback.

# 175. Test Quality Checklist
- [ ] Tests assert behavior, not trivia.
- [ ] Security tests include negative paths.
- [ ] Deterministic fixtures reused.
- [ ] No test-order dependency.
- [ ] Throttle state isolated.
- [ ] Legacy credential rejection explicit.
- [ ] Legacy cookie rejection explicit.
- [ ] Session minimality explicit.
- [ ] Cross-tenant authorization remains regression-tested.
- [ ] Document correctness does not depend on GitHub Actions.

# 176. High-Impact Code Priority
- Priority 1: database credential authority.
- Priority 2: Auth.js session authority.
- Priority 3: throttle enforcement.
- Priority 4: dummy KDF no-candidate path.
- Priority 5: real user UUID session subject.
- Priority 6: legacy live authority disabled.
- Priority 7: proxy coarse-auth cutover.
- Priority 8: logout cutover.
- Priority 9: regression coverage.
- Priority 10: clean R04 handoff.

# 177. Deferred Lower-Priority Work
- OAuth.
- MFA.
- Password reset.
- Workspace selector.
- Revocation UI.
- Permission navigation.
- Role management UI.
- Member invitation UX.
- Customer auth.
- Audit dashboard.
- Auth analytics.
- Remember-me.
- Device management.

# 178. R03 Final Acceptance Matrix — Authority
- Database credential is live authority: `YES`.
- Auth.js is session authority: `YES`.
- Real `app.users.id` is session subject: `YES`.
- Shared env credential is fallback: `NO`.
- Legacy cookie is authoritative: `NO`.
- Legacy source physically deleted: `NO`.
- Unknown user runs dummy KDF: `YES`.
- Wrong password records failure: `YES`.
- Success clears failure state: `YES`.
- Blocked subject authenticates: `NO`.

# 179. R03 Final Acceptance Matrix — Identity States
- Suspended user authenticates: `NO`.
- Disabled credential authenticates: `NO`.
- No-credential user authenticates: `NO`.
- Unknown user authenticates: `NO`.
- No-membership valid credential authenticates identity: `YES`.
- Tenant selected during login: `NO`.
- Branch selected during login: `NO`.
- Permissions stored as final session authority: `NO`.

# 180. R03 Final Acceptance Matrix — Scope
- Workspace AccessContext implemented: `NO`.
- Permission route cutover implemented: `NO`.
- Legacy auth physically removed: `NO`.
- Production DB modified: `NO`.
- New auth dependency required: `NO by default`.
- Customer auth changed: `NO`.
- Implementation merged by agent: `NO`.

# 181. R03 End State
- R03 branch contains live Auth.js Credentials authentication.
- R03 branch contains Auth.js session authority.
- R03 branch authenticates R02 deterministic fixture identities.
- R03 branch preserves authentication/authorization separation.
- R03 branch no longer uses shared legacy credentials for new login.
- R03 branch no longer uses legacy custom cookie as authoritative coarse auth.
- R03 branch retains legacy source for R06 deletion clarity.
- R03 leaves tenant/branch resolution to R04.
- R03 leaves route/command permission enforcement to R05.
- R03 leaves physical legacy cleanup to R06.
- R03 implementation PR remains owner-controlled.
- R04 can consume stable R03 session actor identity.

# 182. Required Next Specification
```text
FLOW_P02_R04_IMPLEMENTATION_SPEC.md
```
- R04 spec must be authored from actual R03 implementation state.
- Do not infer exact R04 diff before R03 exists.
- R04 consumes real Auth.js session user ID.
- R04 resolves active memberships.
- R04 resolves available workspaces.
- R04 defines AccessContext.
- R04 defines membership-change/revocation semantics.
- R04 must not reimplement password verification.

# 183. Development Gate
```text
READ CURRENT MAIN
→ VERIFY P02/R03 READY
→ IDENTIFY LATEST P02/R02 LINEAGE TIP
→ CREATE ONE P02/R03 IMPLEMENTATION BRANCH
→ IMPLEMENT AUTH.JS CREDENTIALS + SESSION CUTOVER
→ VALIDATE IMPLEMENTATION
→ OPEN/UPDATE ONE R03 IMPLEMENTATION PR
→ STOP
→ OWNER CONTROLS IMPLEMENTATION MERGE
```
- Specification authority remains `main`.
- Implementation lineage remains latest round branch.
- Documentation automation does not implement R03.
- Implementation agent does not merge R03 PR.
- Next spec task re-inspects actual state.

# 184. Final Implementation Agent Checklist — Authority
- [ ] Read current main policy.
- [ ] Read current main README.
- [ ] Read exact R03 spec.
- [ ] Confirm latest R02 branch.
- [ ] Confirm exact R02 parent SHA.
- [ ] Read Next.js 16.3 local docs.
- [ ] Inspect installed Auth.js API.
- [ ] Reuse R01 identity primitives.
- [ ] Reuse R02 fixtures.

# 185. Final Implementation Agent Checklist — Core Auth
- [ ] Implement canonical Auth.js config.
- [ ] Implement thin Credentials provider.
- [ ] Implement auth orchestrator.
- [ ] Implement throttle subject derivation.
- [ ] Enforce throttle.
- [ ] Use dummy KDF on no candidate.
- [ ] Use real scrypt verifier on candidate.
- [ ] Return real user UUID.
- [ ] Keep session claims minimal.

# 186. Final Implementation Agent Checklist — Cutover
- [ ] Cut live login authority.
- [ ] Cut live logout authority.
- [ ] Cut coarse proxy auth authority.
- [ ] Disable legacy shared credential fallback.
- [ ] Disable legacy cookie authority.
- [ ] Keep physical legacy removal for R06.
- [ ] Keep workspace work for R04.
- [ ] Keep permission route work for R05.

# 187. Final Implementation Agent Checklist — Quality
- [ ] Add unit tests.
- [ ] Add integration tests.
- [ ] Add session tests.
- [ ] Add legacy authority regressions.
- [ ] Run application validation commands.
- [ ] Run DB regressions.
- [ ] Record truthful outcomes.
- [ ] Open/update one R03 PR.
- [ ] Do not merge implementation PR.

# 188. Document Validation Contract
- Validate Phase is `02`.
- Validate Round is `03`.
- Validate Status is `READY`.
- Validate Previous is R02 spec.
- Validate Next is R04 spec.
- Validate authority source is main.
- Validate implementation parent is latest R02 lineage.
- Validate scope is Auth.js Credentials + session cutover.
- Validate R04/R05/R06 boundaries are explicit.
- Validate current code assumptions against observed R02 branch.
- Validate files are existing or clearly planned CREATE targets.
- Validate security plan is explicit.
- Validate failure plan is explicit.
- Validate test plan is explicit.
- Validate handoff is explicit.
- GitHub Actions are not document validation authority.

# 189. Document Line-Count Contract
- Final document must be at least 1,800 lines.
- Final document must be at most 2,500 lines.
- Do not pad with blank lines.
- Do not duplicate prose for count.
- Do not split sentences artificially for count.
- Every line must improve implementation precision or validation quality.
- Count final file before PR.
- Recount final file before merge.
- Record actual count in spec PR.

# 190. Additional Credential Input Cases
- Email with leading spaces.
- Email with trailing spaces.
- Email with uppercase domain.
- Email with uppercase local portion.
- Email at maximum length.
- Email above maximum length.
- Password at maximum length.
- Password above maximum length.
- Password containing Unicode.
- Password containing null-like characters as string data.
- Missing credentials object.
- Unexpected extra credential fields.
- Provider ignores untrusted extra fields.

# 191. Additional Throttle Cases
- First failure creates count one.
- Second failure increments once.
- Failure at limit blocks.
- Failure after window resets window.
- Existing active block remains active.
- Exact block expiry reopens evaluation.
- Successful auth clears state.
- Unknown user can be throttled consistently.
- Case variants share normalized subject.
- Whitespace variants share normalized subject.
- Concurrent failures rely on DB atomicity.

# 192. Additional Session Cases
- Fresh valid session resolves user ID.
- Session without email still must not invent tenant.
- Session callback cannot accept client actor override.
- Token callback cannot accept client permission override.
- Repeated session read is side-effect free.
- Session read does not query password hash.
- Session read does not modify throttle.
- Session read does not select workspace.
- Session expiry is deterministic.
- Logout after expiry remains safe.

# 193. Additional Proxy Cases
- Login route itself is not protected by proxy matcher.
- Auth.js callback route must not be trapped by internal matcher.
- Public customer routes remain unaffected.
- Protected internal route preserves same-origin redirect.
- Query parameters survive safe redirect.
- External redirect injection rejected.
- Proxy does not use FOODFLOW legacy token as fallback.
- Proxy does not fetch DB credentials.
- Proxy does not decide permissions.
- Proxy behavior is compatible with deployment runtime.

# 194. Additional Logout Cases
- Logout with valid Auth.js session.
- Logout with no Auth.js session.
- Logout with stale legacy cookie.
- Logout with Auth.js + stale legacy cookie.
- Logout repeated twice.
- Logout does not require DB credential lookup.
- Logout does not require membership lookup.
- Logout does not expose token.
- Logout does not issue replacement legacy cookie.

# 195. Additional Legacy Regression Cases
- Legacy `credentialsMatch()` has no live caller in login path.
- Legacy `createSession()` has no live caller in login path.
- Legacy `verifySession()` has no live protected-route authority.
- Legacy dev fallback does not authenticate.
- Legacy env email/password alone do not authenticate.
- Legacy secret alone cannot mint accepted Auth.js session.
- Legacy cookie alone cannot pass protected route.
- Legacy files remain source-visible for R06 removal plan.

# 196. Additional Error Redaction Cases
- Error string excludes raw password.
- Error string excludes hash.
- Error string excludes AUTH_SECRET.
- Error string excludes DB URL.
- Error string excludes full token.
- Error string excludes credential encoding.
- Browser error excludes suspended state.
- Browser error excludes disabled state.
- Browser error excludes user existence.
- Browser error excludes internal role names.

# 197. Additional Auth.js Type Safety
- Avoid `as any` for session user ID.
- Avoid unchecked credentials cast.
- Narrow credentials fields explicitly.
- Type provider user ID as string.
- Type session user extension centrally.
- Keep server result union discriminated if used.
- Type infrastructure errors safely.
- Do not serialize Date unless needed.
- Do not leak internal candidate type to client.

# 198. Additional Build Safety
- Auth.js config must compile under Next.js 16.3.
- Proxy import must be runtime-compatible.
- Route handler exports must match App Router.
- Client login form must not import server-only module.
- Server-only package boundary must remain valid.
- Test aliases must resolve.
- No circular auth import between config/provider and legacy auth index.
- Build must not require production secrets at compile time unless expected by current deployment policy.

# 199. Additional Security Review
- No open redirect.
- No account enumeration.
- No throttle bypass.
- No legacy fallback.
- No credential hash exposure.
- No direct credential table grant.
- No session role inflation.
- No tenant claim authority.
- No branch claim authority.
- No permission claim authority.
- No production fixture secrets.
- No auth debug logs with sensitive fields.

# 200. Additional R04 Handoff Requirements
- R04 can call canonical Auth.js server helper.
- R04 receives one authenticated user UUID.
- R04 does not need to parse legacy JWT.
- R04 does not need shared internal config.
- R04 can query memberships post-auth.
- R04 can distinguish no-membership user.
- R04 can later invalidate access on membership changes.
- R04 can preserve tenant/branch separation.
- R04 does not re-run password verification for each request.

# 201. Additional R05 Handoff Requirements
- R05 receives authenticated actor from Auth.js/R04.
- R05 receives AccessContext from R04.
- R05 can evaluate canonical permission codes.
- R05 need not parse legacy fixed user ID.
- R05 need not trust client role.
- R05 need not trust session permission array.
- R05 can preserve DB RLS defense in depth.

# 202. Additional R06 Handoff Requirements
- Legacy shared auth has no live authority.
- Legacy source references are easy to enumerate.
- Legacy env vars are marked obsolete.
- Legacy cookie is non-authoritative.
- Legacy JOSE path is unused by live auth.
- R06 can delete without redesigning authentication.
- R06 can remove dependency if no other consumer.
- R06 can perform final acceptance against Auth.js path.

# 203. Implementation Evidence — Required Paths
- Record Auth.js config path.
- Record Auth.js handler path.
- Record auth orchestrator path.
- Record throttle subject helper path.
- Record login UI path changed.
- Record login compatibility endpoint status.
- Record logout path changed.
- Record proxy path changed.
- Record type augmentation path if created.
- Record new test paths.

# 204. Implementation Evidence — Required Decisions
- Record session strategy.
- Record session max age.
- Record credentials-provider API pattern.
- Record login live API path.
- Record logout live API path.
- Record proxy Auth.js integration pattern.
- Record legacy cookie authority status.
- Record legacy shared credential authority status.
- Record no-membership auth behavior.
- Record success-clear failure behavior.

# 205. Implementation Evidence — Required Security Statements
- `PASSWORD_HASH_EXPOSED_TO_CLIENT: NO`.
- `PASSWORD_LOGGED: NO`.
- `AUTH_SECRET_EXPOSED: NO`.
- `LEGACY_FALLBACK_ENABLED: NO`.
- `TENANT_IN_SESSION_AS_AUTHORITY: NO`.
- `BRANCH_IN_SESSION_AS_AUTHORITY: NO`.
- `PERMISSIONS_IN_SESSION_AS_AUTHORITY: NO`.
- `DIRECT_CREDENTIAL_TABLE_GRANT: NO`.
- `BYPASSRLS_ADDED: NO`.

# 206. Implementation Evidence — Required Scope Statements
- `AUTHJS_LIVE_CUTOVER: YES`.
- `LEGACY_AUTH_PHYSICALLY_REMOVED: NO`.
- `WORKSPACE_ACCESS_CONTEXT_IMPLEMENTED: NO`.
- `ROUTE_PERMISSION_CUTOVER: NO`.
- `CUSTOMER_AUTH_CHANGED: NO`.
- `PRODUCTION_DB_MODIFIED: NO`.
- `NEW_MIGRATION: NO` by default.
- `PACKAGE_DEPENDENCIES_CHANGED: NO` by default.

# 207. Implementation Evidence — Required Validation Statements
- Lint result.
- Typecheck result.
- Unit-test result.
- Integration-test result.
- Next build result.
- DB reset result.
- DB SQL-test result.
- DB lint result.
- Generated-type verification result.
- Any blocker exactly named.

# 208. Final Document State
- Phase is P02.
- Round is R03.
- Status is READY.
- Previous is P02/R02.
- Next is P02/R04.
- Scope is Auth.js Credentials authentication + session authority cutover.
- Document validation is content/state-based.
- GitHub Actions are not document validation authority.
- Implementation parent is latest R02 branch.
- Implementation merge is owner-controlled.
- This spec authorizes no implementation work by the documentation automation.

# 209. Final Gate Summary
- R02 branch provides deterministic database credentials.
- R01 provides least-privilege credential verification primitives.
- R03 may therefore cut live login to Auth.js.
- R03 must keep authentication separate from authorization.
- R03 must disable legacy live auth authority.
- R03 must leave workspace to R04.
- R03 must leave permissions to R05.
- R03 must leave physical cleanup to R06.
- R03 implementation agent stops at PR.
- Owner controls integration.

# 210. End of Specification
- Required implementation spec filename: `FLOW_P02_R03_IMPLEMENTATION_SPEC.md`.
- Required implementation branch pattern: `p02-r03-*`.
- Recommended implementation branch: `p02-r03-authjs-session-cutover`.
- Required next spec: `FLOW_P02_R04_IMPLEMENTATION_SPEC.md`.
- Document status: `READY`.
- Document validation authority: document content + observed repository state.
- GitHub Actions validation gate for this document: `NO`.
- Implementation work performed by this specification automation: `NO`.
- Implementation PR merge by implementation agent: `NO`.

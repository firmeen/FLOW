# FLOW P03 R05 — Implementation Specification
> Phase 03 — Core Server Data Plane + Customer Capability
> Round 05 — Customer Command Idempotency, Replay Safety, Retry and Concurrency Hardening
> Revision — Establish deterministic request identity, duplicate-request deduplication, replay-result recovery, ambiguous-commit safety, and bounded retry semantics around the R04 customer command layer.

## Metadata
- Phase: `03`
- Round: `05`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P03_R04_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P03_R06_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P03 implementation slot after this specification is on main`
- Current planning scope: `PHASE 03 / ROUND 05 ONLY`
- Implementation parent: `latest completed P03/R04 implementation lineage tip`
- Expected implementation parent branch: `p03-r04-customer-command-flow`
- Observed R04 branch head at authoring: `6871194653dda3fd20c4147257a73026d1706431`
- Observed R04 implementation state: `MEANINGFUL IMPLEMENTATION PRESENT`
- Observed R04 implementation PR: `#72`
- Recommended implementation branch: `p03-r05-idempotency-replay`
- Recommended implementation PR title: `feat(customer): harden command idempotency and replay safety`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Request identity/idempotency in this round: `YES`
- Duplicate-request deduplication in this round: `YES`
- Replay-result recovery in this round: `YES`
- Ambiguous commit recovery in this round: `YES`
- Retry/concurrency policy in this round: `YES`
- Generic payment/kitchen/realtime side effects in this round: `NO`
- Phase 03 acceptance in this round: `NO — P03/R06`
- Production destructive database mutation: `NO`

# 1. Authoring State
- Current `main` remains the only policy/specification authority.
- `FLOW_P03_R04_IMPLEMENTATION_SPEC.md` exists on current `main` and is READY.
- The R04 specification points `Next` to this exact canonical filename.
- No `FLOW_P03_R05_IMPLEMENTATION_SPEC.md` existed on `main` before this document was authored.
- No `docs/p03-r05-*` duplicate specification branch was observed before authoring.
- Latest observed implementation lineage is `p03-r04-customer-command-flow`.
- Latest observed R04 head is `6871194653dda3fd20c4147257a73026d1706431`.
- R04 contains a canonical customer command module.
- R04 contains customer cart route handlers.
- R04 contains customer order submission route handling.
- R04 contains bounded request validation and command-safe error mapping.
- R04 contains source-cart locking and transaction-bound command orchestration.
- R04 contains atomic cart-to-order submission semantics.
- R04 explicitly defers generic request idempotency and replay safety to R05.
- This task is documentation/specification only.
- This task does not create the R05 implementation branch.
- This task does not alter runtime code, migrations, dependencies, workflow configuration, or hosted settings.
- This task does not merge any implementation PR.

# 2. Phase 03 Objective
- Phase 03 establishes a durable customer-facing server data plane.
- R01 establishes customer capability/session trust.
- R02 establishes customer-safe server data access.
- R03 establishes durable cart/order persistence.
- R04 establishes customer command orchestration.
- R05 makes those commands deterministic under retries, duplicates, concurrent delivery, and ambiguous network outcomes.
- R06 proves the complete customer data plane end to end.
- Phase 03 must preserve tenant isolation.
- Phase 03 must preserve branch isolation.
- Phase 03 must preserve customer ownership isolation.
- Phase 03 must preserve staff/customer authority separation.
- Phase 03 must avoid duplicate customer mutations caused by client retry or transport ambiguity.
- Phase 03 must avoid silently returning different outcomes for the same request identity.
- Phase 03 must avoid replaying stale requests against materially different command payloads.
- Phase 03 must leave payment, kitchen, realtime, and notifications to later phases unless exact future specs say otherwise.

# 3. Six-Round Phase Boundary
- R01 owns customer capability/session boundary.
- R02 owns customer database context and repository architecture.
- R03 owns durable cart/order persistence.
- R04 owns command orchestration and transaction sequencing.
- R05 owns request identity, idempotency records, duplicate detection, replay-result recovery, retry policy, and concurrency hardening around R04 commands.
- R06 owns integrated acceptance and Phase 04 handoff.
- R05 must not redesign R01 capability semantics.
- R05 must not rebuild R02 repositories.
- R05 must not replace R03 persistence architecture.
- R05 must not duplicate R04 command business logic.
- R05 must wrap/harden existing R04 command execution rather than creating parallel command paths.

# 4. Why R05 Exists Now
- R04 creates deterministic command semantics inside a single successful request/transaction.
- Real clients retry requests when connectivity is uncertain.
- Mobile networks may drop a response after the server commits.
- Browser or PWA code may issue duplicate requests due to UI double-submit or reconnect logic.
- Reverse proxies may retry in some failure modes.
- Customers may refresh immediately after submitting an order.
- Two equivalent requests may arrive concurrently.
- A response may be lost after a database commit, leaving the client uncertain whether the mutation occurred.
- Structural uniqueness alone prevents some duplicate database rows but does not provide deterministic response replay.
- Source-cart locking prevents mixed snapshots but does not define request-level identity semantics.
- R05 therefore introduces one authoritative request/replay boundary around the existing command layer.

# 5. R05 High-Impact Objective
- Define one canonical customer mutation idempotency key contract.
- Define one canonical request fingerprint contract.
- Bind each idempotency record to customer capability scope.
- Bind each idempotency record to command type.
- Bind each idempotency record to a deterministic normalized request payload fingerprint.
- Ensure exact duplicate retries return the original committed outcome.
- Ensure same key with different command/payload fails deterministically.
- Ensure concurrent first-use requests cannot both execute the mutation.
- Ensure ambiguous client outcomes can be recovered by replaying the same request identity.
- Ensure command execution and idempotency completion are transactionally coordinated where required.
- Ensure failed pre-commit attempts can be retried safely.
- Ensure committed successes do not execute the command twice.
- Ensure permanent business failures are handled consistently under replay.
- Ensure transient infrastructure failures do not become permanently cached unless policy explicitly requires it.
- Ensure the implementation remains narrow and compatible with R06 acceptance.

# 6. R04 Handoff to Preserve
- Reuse `CustomerContext` from R01.
- Reuse customer transaction composition from R02.
- Reuse cart/order repositories from R03.
- Reuse R04 commands rather than copying their logic.
- Reuse R04 HTTP request validation helpers when they remain correct.
- Reuse R04 safe transport error mapping.
- Preserve R04 source-cart lock ordering.
- Preserve R04 current-menu-availability revalidation.
- Preserve R04 atomic cart-to-order transaction semantics.
- Preserve R04 prohibition on client-supplied tenant, branch, price, currency, or subtotal authority.
- Preserve R04 prohibition on external side effects before commit.
- R05 must not reinterpret R04 internal `submission_key` as the new client request idempotency key unless actual schema semantics make that exact reuse safe and explicit.

# 7. Observed R04 Surface
- `src/modules/customer-data/server/commands/cart-commands.ts` contains cart command orchestration.
- `src/modules/customer-data/server/commands/submit-order.ts` contains order submission orchestration.
- `src/modules/customer-data/server/commands/runtime.ts` contains command runtime/context composition.
- `src/modules/customer-data/server/commands/validation.ts` contains input validation.
- `src/modules/customer-data/server/commands/errors.ts` contains command error semantics.
- `src/modules/customer-data/server/commands/http.ts` contains HTTP-safe mapping helpers.
- `src/app/api/customer/cart/route.ts` exposes cart request transport.
- `src/app/api/customer/cart/items/route.ts` exposes item mutation transport.
- `src/app/api/customer/orders/route.ts` exposes order submission transport.
- R04 migration introduces narrow customer order submission state transition support.
- R04 tests cover command flow, modifier validation, and DB submission security.
- Implementation must re-read exact latest R04 branch before changing these files.

# 8. Command Classes Covered
- create/get active cart may be naturally read/create-idempotent and requires explicit classification.
- add cart item is mutation and must be request-idempotent when transport exposes retriable client requests.
- update cart item quantity is mutation and must be request-idempotent.
- remove cart item is mutation and must be request-idempotent.
- submit order is the highest-risk customer command and must have deterministic idempotency/replay semantics.
- command-specific semantics may differ, but key/fingerprint infrastructure should be reusable.
- R05 does not require forcing every GET/read request through persistence-backed idempotency.

# 9. Idempotency Key Transport Contract
- Client mutation requests should supply an explicit idempotency key using one canonical transport.
- Prefer a dedicated HTTP header such as `Idempotency-Key` for route-handler mutations.
- Avoid placing idempotency keys in URLs.
- Avoid cookies as the command-specific request identity.
- Do not infer request identity from timestamp alone.
- Do not infer request identity from IP address.
- Do not infer request identity from cart ID alone.
- Do not infer request identity from order ID alone.
- Key format must be bounded and validated.
- Key should be opaque to the server except format/length checks.
- UUID v4 or similarly high-entropy client-generated value is acceptable.
- The server may normalize only safe formatting such as trimming if the contract explicitly permits it.
- Key comparison must be exact after canonical normalization.

# 10. Idempotency Key Scope
- Idempotency key uniqueness must not be global across every customer forever unless intentionally designed.
- Scope should include customer capability ownership or a stable customer session scope.
- Scope should include command type.
- Scope may include tenant and branch through trusted server context.
- Same raw key used by two unrelated customer capabilities must not collide.
- Same raw key used for two different commands in one capability must either be rejected or namespace-separated deterministically.
- Scope must never derive from client-supplied tenant/branch values.

# 11. Canonical Request Fingerprint
- Same idempotency key is only replay-compatible with the same semantic request.
- Build a deterministic fingerprint from validated normalized command input.
- Fingerprint must include command name/version.
- Fingerprint must include relevant entity selectors such as cart ID/item ID.
- Fingerprint must include normalized mutation payload fields.
- Fingerprint must not include trusted context fields redundantly when scope columns already bind them, unless doing so improves invariant clarity.
- Fingerprint should use a cryptographic hash such as SHA-256 over deterministic canonical serialization.
- Do not use JavaScript object insertion order implicitly as the contract.
- Define canonical field order.
- Normalize absent vs null deliberately.
- Normalize strings only according to command validation semantics.
- Never include raw capability bearer secret in persisted fingerprint source or logs.

# 12. Payload Mismatch Semantics
- Same scoped idempotency key + same fingerprint = replay candidate.
- Same scoped idempotency key + different fingerprint = conflict.
- Conflict must never execute a second mutation.
- Conflict response must be stable and safe.
- Prefer HTTP `409 Conflict` or repository-standard equivalent.
- Do not expose the original payload in the error response.
- Log only safe identifiers/digests if needed.
- Conflict remains conflict even if original request completed long ago but record is still retained.

# 13. Idempotency Record Concept
```ts
interface CustomerIdempotencyRecord {
  id: string;
  tenantId: string;
  branchId: string;
  capabilityId: string;
  command: string;
  idempotencyKey: string;
  requestFingerprint: string;
  status: "IN_PROGRESS" | "SUCCEEDED" | "FAILED_FINAL";
  responseCode: number | null;
  responseBody: unknown | null;
  resourceType: string | null;
  resourceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}
```
- This shape is conceptual.
- Implementation must reconcile exact SQL/types with current repository conventions.
- Avoid storing sensitive request bodies unnecessarily.
- Prefer storing safe replay result envelopes rather than arbitrary transport payload blobs.

# 14. Database Storage Decision
- Persistence-backed idempotency is required for cross-request and post-commit replay recovery.
- In-memory maps are insufficient across processes/deployments.
- Browser-only dedupe is insufficient.
- Redis is not required unless existing architecture already provides it and DB persistence is clearly inferior.
- PostgreSQL is the preferred baseline because command state already commits there.
- One forward-only migration may add a dedicated idempotency table/schema object.
- Historical migrations must not be rewritten.

# 15. Suggested Table Boundary
- Candidate table: `foodflow.customer_command_idempotency` or equivalent narrow name.
- Must have UUID primary key or repository-standard identifier.
- Must bind tenant_id.
- Must bind branch_id.
- Must bind customer capability/session ownership identifier.
- Must store command code.
- Must store normalized idempotency key or safe digest.
- Must store request fingerprint.
- Must store execution status.
- Must store replay-safe result fields.
- Must have created/updated timestamps.
- Must have expiry/retention timestamp if records are not permanent.
- Must have a unique constraint preventing two first executions for same scoped key.

# 16. Key Storage Strategy
- Raw idempotency keys are generally not high-value secrets but still should not be logged casually.
- Implementation may store raw bounded key if operationally acceptable.
- Prefer storing a digest if raw key does not need to be displayed.
- If digest is used, use deterministic cryptographic hashing with clear encoding.
- Do not use reversible encryption unless there is a real requirement.
- Do not use password hashing/KDF for high-entropy idempotency keys; ordinary cryptographic digest is sufficient.

# 17. Unique Constraint Contract
- Unique index must encode exact logical scope.
- Example scope: tenant + branch + capability_id + command + key_digest.
- Avoid uniqueness only on key_digest globally.
- Avoid leaving command outside uniqueness if command-specific namespaces are required.
- Database uniqueness must be the final concurrency authority.
- Application pre-checks are convenience only.

# 18. Execution State Machine
```text
ABSENT
  -> IN_PROGRESS
  -> SUCCEEDED
  -> replay SUCCEEDED result
```
- Permanent final business failure may use `FAILED_FINAL` only if replaying the same failure is correct.
- Transient infrastructure failure should generally remove/rollback the in-progress acquisition or allow safe retry.
- Do not create a stuck permanent `IN_PROGRESS` state for requests that rolled back.
- If in-progress state is committed separately, define lease/timeout recovery explicitly.
- Prefer one-transaction acquisition + command + success record when that fits command transaction semantics.

# 19. Transaction Coupling Strategy
- For database-only R04 commands, idempotency acquisition and command mutation should preferably share one database transaction.
- Unique acquisition happens before side-effecting command logic.
- Command business mutation executes only for the winning request.
- Replay result metadata is finalized before commit.
- If the transaction rolls back, both mutation and idempotency completion roll back.
- This avoids a committed IN_PROGRESS record with no mutation for ordinary failures.
- R05 must avoid nested independent transaction boundaries that break atomicity.

# 20. Replay Before Execution
- Begin customer transaction with validated CustomerContext.
- Resolve/validate idempotency key.
- Compute command fingerprint from validated input.
- Attempt to acquire the scoped record.
- If no prior record, become execution owner.
- If existing SUCCEEDED with same fingerprint, return stored result without command execution.
- If existing record has different fingerprint, return conflict.
- If existing IN_PROGRESS is observable because implementation uses separate commits, apply explicit wait/retry/recovery policy.
- Do not run R04 command before deciding ownership.

# 21. Concurrency: Two First Requests
- Two concurrent identical requests can both observe absence at application level.
- Database unique constraint must select exactly one winner.
- Losing request must re-read the existing record.
- If winner commits success, loser returns replay success.
- If winner rolls back, loser may retry acquisition according to bounded strategy.
- Do not convert uniqueness violation directly into 500.
- Do not allow both transactions to execute command logic.

# 22. Submit Order Idempotency
- Submit order is highest priority.
- Exact same submit request/key must return same committed order identity.
- Replay must never create a second order.
- Replay must never re-convert the cart.
- Replay must not fail merely because the cart is now terminal if the original keyed request succeeded.
- Idempotency lookup therefore must occur before re-running current cart-state business validation on a known successful replay.
- Same key + different cart/payload must conflict.
- Different keys submitted concurrently for same cart remain protected by R04/R03 source-cart uniqueness and locking; R05 should produce deterministic conflict/recovery semantics where possible.

# 23. Add Item Idempotency
- Same key + same add-item intent returns same resulting mutation outcome without adding another duplicate item caused by transport retry.
- Result envelope should identify affected cart/cart item or final aggregate as current API contract requires.
- Same key + different menu item, quantity, modifiers, or special request conflicts.
- Different keys represent distinct customer intents and may add separate items according to current cart model.

# 24. Update Quantity Idempotency
- Same key + same item/quantity intent replays result.
- Same key + different quantity conflicts.
- Because update is naturally convergent in some cases, still preserve request-key semantics for deterministic network replay.
- Do not rely only on current stored quantity to infer whether request already happened.

# 25. Remove Item Idempotency
- First keyed remove deletes/removes according to R04 semantics.
- Replay of same successful key must return success even if item no longer exists.
- A fresh different key against a missing item may return normal not-found according to command semantics.
- This distinction is one reason persistent replay state is necessary.

# 26. Create/Get Cart Semantics
- If the existing create/get cart command is already semantically “find active else create,” it may not require durable request records for normal use.
- Implementation must classify it explicitly.
- If POST transport is retriable and concurrent calls can create multiple active carts, add request-idempotency or enforce one-active-cart uniqueness as appropriate.
- Do not add unnecessary idempotency storage around pure reads.

# 27. Response Replay Contract
- Store enough to reproduce the safe logical response.
- Prefer a versioned command result envelope.
- Do not store framework-specific Response objects.
- Do not store headers containing secrets/cookies.
- Store status code only if transport semantics require exact replay.
- Store safe resource identifiers and command result payload.
- Reconstruct HTTP response through the current HTTP adapter.
- Ensure replay result remains valid even if mutable cart state later changes, when exact original response semantics matter.

# 28. Result Versioning
- Result envelope should have schema/version marker if persisted JSON is used.
- Future code must be able to decode records written by current version during retention window.
- Avoid tying persisted replay records to arbitrary TypeScript class serialization.
- If result schema changes incompatibly in future phase, migration or backward decoder may be needed.

# 29. Permanent Failure Replay
- Not every failure should be persisted.
- Validation failures occur before idempotency acquisition when possible and do not need persistent replay records.
- Authentication/capability failures occur before customer command transaction and do not need request records.
- Stable business failures after acquisition may be persisted only when retrying the same request should deterministically return the same failure.
- Examples may include immutable terminal-cart conflict.
- Availability failures based on mutable menu state should be evaluated carefully; caching them may prevent a legitimate later retry with same key after business state changes.
- Default toward persisting committed successes, not transient failures.

# 30. Transient Failure Policy
- Database unavailable before transaction = return unavailable; key remains reusable.
- Deadlock/serialization failure = bounded internal retry if repository policy supports it, otherwise safe client retry with same key.
- Connection loss before commit acknowledgement = client retries same key; record determines outcome.
- Application exception causing rollback = no committed success record; same key may retry.
- Do not mark unknown transaction outcome as failed without checking persistence state.

# 31. Ambiguous Commit Recovery
- Critical scenario: database commits successfully but HTTP response is lost.
- Client retries with identical key/payload.
- Server finds SUCCEEDED record.
- Server returns original result.
- Command does not execute again.
- This scenario must have an integration test.
- Where feasible simulate response loss after command transaction and then call replay path.

# 32. Database Commit Unknown to Application
- Driver/network may report an error while commit outcome is uncertain.
- Do not blindly rerun command in a new transaction using a new key.
- Same key replay is the recovery mechanism.
- If server process can query the record after uncertain commit, it may resolve internally.
- Otherwise return retryable/ambiguous-safe response instructing same-key retry through client contract.
- Never encourage generating a new key for an uncertain prior request.

# 33. Retry Ownership
- Client retries must reuse same idempotency key for the same user intent.
- New user intent must use a new key.
- Server may internally retry transaction-level transient failures without changing request identity.
- Internal retry count must be bounded.
- Retry must not broaden timeout indefinitely.
- Avoid simultaneous client + server exponential retry storms.

# 34. Retryable Error Taxonomy
- Define explicit retryable vs non-retryable command outcomes.
- Validation error = non-retryable unless request changes.
- payload/key mismatch = non-retryable with same key.
- capability expired/revoked = non-retryable without re-entry/new capability.
- business conflict may be non-retryable depending state.
- database unavailable = retryable with same key.
- transaction deadlock/serialization = retryable with same key.
- unknown commit outcome = retry with same key.
- replay success = terminal success.

# 35. HTTP Contract
- Mutation routes must require valid key where R05 applies.
- Missing key should return deterministic client error.
- Invalid key format should return deterministic client error.
- Same key/different request should return conflict.
- Successful replay should normally return same success status family as original.
- Consider optional safe response marker such as `Idempotency-Replayed: true` only if useful and non-sensitive.
- Do not expose internal database record IDs unless needed.

# 36. Client Contract
- Client generates key once when initiating mutation intent.
- Client retains same key while retrying that intent.
- Client must not regenerate key automatically after timeout until it has intentionally abandoned/replaced the prior intent.
- Client should clear/replace key after definitive success or definitive non-retryable failure.
- R05 may add minimal client helper only where current UI/client code needs it to exercise the transport contract.
- Do not redesign customer UI in this round.

# 37. API Route Integration
- `POST /api/customer/cart` classification must be explicit.
- `POST /api/customer/cart/items` or equivalent add mutation must use idempotency wrapper.
- update/remove methods on cart items must use idempotency wrapper.
- `POST /api/customer/orders` must use idempotency wrapper.
- Route layer remains thin.
- Route parses transport, validates key/body, invokes idempotent command adapter, maps result.
- Route must not query idempotency table directly if a canonical service exists.

# 38. Canonical Idempotency Service
- Introduce one server-only orchestration module around command execution.
- Candidate name: `execute-idempotent-customer-command.ts`.
- Inputs: CustomerContext, command code, idempotency key, normalized fingerprint source, transaction callback.
- Output: executed or replayed result envelope.
- It must own acquire/replay/conflict semantics.
- It must not own business rules from cart/order commands.
- It must be testable with injected repository/transaction dependencies where practical.

# 39. Idempotency Repository
- Introduce transaction-bound repository for idempotency records.
- Candidate path: `src/modules/customer-data/server/idempotency/idempotency-repository.ts`.
- Methods may include acquire/find/finalizeSuccess/deleteOrRollback semantics as required.
- Repository must be bound to trusted customer database context.
- Repository must not accept raw tenant/branch overrides.
- Repository must map uniqueness races to domain-level acquisition outcomes.

# 40. Command Code Catalog
- Use a finite typed command code catalog.
- Example: `CART_ADD_ITEM`, `CART_UPDATE_ITEM`, `CART_REMOVE_ITEM`, `ORDER_SUBMIT`.
- Keep code stable for persisted replay records.
- Avoid using arbitrary route pathname as command identifier.
- Avoid using function name reflection.
- Version command semantics separately if backward replay compatibility requires it.

# 41. Fingerprint Builder
- Centralize canonical serialization/hash logic.
- Pure function should accept validated normalized command intent.
- JSON canonicalization must be deterministic.
- Sort object keys or build ordered tuple/string explicitly.
- Preserve array order where semantic order matters.
- Sort modifier IDs only if modifier ordering is semantically irrelevant and validation already treats them as a set.
- Do not silently normalize two meaningfully different requests into same fingerprint.

# 42. Fingerprint Security
- SHA-256 is sufficient for collision resistance in this context.
- Fingerprint is not authentication.
- Fingerprint is not authorization.
- Fingerprint must not replace CustomerContext validation.
- Avoid logging full raw request body.
- Log digest prefix only if diagnostics require it.

# 43. Customer Capability Changes During Replay
- Replay request still requires a valid current customer capability/session unless product explicitly supports replay after capability expiry.
- Default: current capability must resolve and scope-match the idempotency record.
- Do not let possession of an old idempotency key bypass capability validation.
- If capability is revoked, replay should fail authorization even if prior result exists, unless R06/product policy explicitly requires receipt recovery after revocation.
- This round prioritizes authorization over convenience.

# 44. Tenant/Branch Binding
- Idempotency record tenant/branch come from trusted CustomerContext.
- Replayed request in another branch must not match.
- Replayed request in another tenant must not match.
- Client cannot choose tenant/branch in idempotency lookup.
- Cross-tenant raw key collision must not expose existence.

# 45. Table/Session Binding
- For table-bound customer flows, capability ownership already includes table scope.
- Idempotency record may store table/table-session IDs when they materially strengthen ownership or diagnostics.
- Avoid redundant nullable fields unless needed.
- If table session changes and old capability is invalid, replay should follow current capability policy.

# 46. RLS Strategy
- Idempotency records are customer-private operational state.
- `flow_customer_runtime` may receive only necessary CRUD authority through RLS or narrow functions.
- Public/anon/authenticated roles must receive no direct access.
- Staff runtime does not automatically need access.
- RLS should bind tenant/branch/current customer capability context.
- Direct cross-customer reads must fail.
- Direct cross-customer inserts must fail.
- Direct status/result tampering must fail outside narrow server path.

# 47. SECURITY DEFINER Strategy
- Prefer ordinary RLS-bound table access if sufficient.
- If atomic acquire/finalize requires SECURITY DEFINER, functions must use fixed search_path.
- Revoke execute from public/anon/authenticated and unrelated roles.
- Validate current transaction-local trusted context inside function.
- Do not accept caller-proposed tenant/branch as authority.
- Keep function surface minimal.

# 48. Database Constraints
- status CHECK constraint.
- non-empty command code.
- bounded/non-empty key digest/fingerprint storage.
- expiry after creation where retention exists.
- response fields nullable only in appropriate status.
- SUCCEEDED should require a replayable result or resource reference.
- Unique scoped key constraint.
- Optional unique resource relationship only if domain requires it.

# 49. Retention Policy
- Idempotency records should not grow unbounded forever.
- Retention must exceed realistic client retry/recovery window.
- Candidate baseline may be 24 hours or longer according to product operational needs.
- Exact value should be configuration constant, not arbitrary per request.
- Do not expire records so quickly that ambiguous order submission cannot be recovered.
- Cleanup job infrastructure is not required in R05 unless repository already has scheduler support.
- Expired records may be cleaned lazily or deferred operationally if safe.
- Document the chosen cleanup strategy.

# 50. Expired Key Reuse
- Define behavior explicitly.
- Safer default: after record expires and is cleaned, same raw key may be treated as new only if client should no longer be retrying the old intent.
- Retention window must make this practical.
- If record exists but expires_at is past, do not race delete/reinsert without locking/constraint strategy.
- Tests must cover expiry boundary if implementation supports it now.

# 51. In-Progress Records
- Preferred one-transaction approach makes externally durable IN_PROGRESS less common.
- If implementation commits IN_PROGRESS separately to serialize long-running work, it must define lease timeout and owner token.
- Long-running external work is not in current R04 scope, so separate committed lease should be avoided by default.
- Do not add distributed lease complexity without need.

# 52. Lock Ordering
- Idempotency acquisition occurs before command-specific cart lock if both occur in one transaction.
- Define one consistent ordering to prevent deadlocks.
- Suggested: idempotency unique/acquire → cart parent FOR UPDATE → command mutation → finalize replay result.
- All commands using both locks must follow same order.
- If database implementation dictates another order, document it and test concurrent paths.

# 53. Deadlock Avoidance
- Avoid acquiring multiple idempotency keys in one command.
- Avoid locking carts before idempotency record in one path and reverse in another.
- Keep transaction short.
- No external calls inside transaction.
- Do not sleep/poll inside DB transaction.
- Deadlock retry must be bounded.

# 54. Concurrent Different Keys, Same Cart
- R04 cart FOR UPDATE serializes cart mutations.
- Different keys represent different intents.
- They may execute sequentially in lock order if both remain valid.
- Submit vs edit must preserve R04 terminal-state semantics.
- If submit wins, later edit must fail normally.
- If edit wins, submit uses resulting cart state.
- Idempotency must not collapse distinct keys into one operation.

# 55. Concurrent Same Key, Same Payload
- Exactly one mutation executes.
- Other request returns replayed result after winner completes.
- If implementation cannot wait safely, loser may retry/re-read with bounded strategy.
- Do not return generic conflict for a legitimate identical replay unless unavoidable transient state; final result must be recoverable.

# 56. Concurrent Same Key, Different Payload
- Exactly one payload wins initial acquisition.
- Other payload receives deterministic mismatch conflict.
- It must never execute after winner.
- Conflict remains even if winner later succeeds.
- If winner transaction rolls back entirely and no record remains, new attempt may acquire; define this edge explicitly.

# 57. Submit with Different Keys
- Source-cart uniqueness and locking prevent duplicate committed orders from same cart.
- R05 should detect existing submitted order when second intent reaches command layer.
- Return stable business conflict or existing-order recovery according to exact R04 repository semantics.
- Do not pretend different keys are same request.
- R06 acceptance should prove no duplicate order rows.

# 58. Existing `submission_key`
- R04 uses an internal value derived from immutable order UUID to satisfy current schema submission metadata.
- That field is explicitly not yet client request identity.
- R05 must inspect whether to keep it as internal order submission metadata or repurpose/augment safely.
- Do not conflate order-level uniqueness with request replay unless database semantics fully align.
- Prefer a dedicated idempotency table if it keeps concerns clearer.

# 59. Failure Before Acquisition
- invalid capability → no idempotency record.
- invalid/missing key → no idempotency record.
- malformed JSON → no idempotency record.
- invalid command body → no idempotency record.
- same-origin/CSRF denial → no idempotency record.
- These are transport/security failures, not command execution attempts.

# 60. Failure After Acquisition Before Mutation
- If same transaction rolls back, acquisition rolls back.
- Client can retry same key.
- Do not persist false failure success state.
- Log safe transient diagnostics only.

# 61. Failure During Mutation
- Entire transaction rolls back.
- No partial cart/order change.
- No SUCCEEDED idempotency record.
- Same key may retry if failure category is retryable.
- Permanent business errors may be returned without committed idempotency record unless policy specifically caches them.

# 62. Failure During Result Finalization
- If result finalization is in same transaction, rollback mutation as well.
- Never commit business mutation without a recoverable replay record for a command that requires idempotency.
- This is a core invariant.
- Tests must inject/force finalization failure where practical.

# 63. Failure After Commit Before HTTP Response
- Mutation and success record are committed.
- Client sees network failure/timeout.
- Replay same key returns success record.
- No business mutation reruns.
- This must be explicitly tested at service/integration boundary.

# 64. Failure Reading Replay Result
- If DB unavailable during replay lookup, return retryable unavailable.
- Do not rerun command because replay lookup failed.
- Client should retry same key.
- Avoid fallback path that bypasses idempotency under storage failure.

# 65. Result Corruption/Decode Failure
- Treat as server invariant failure.
- Do not rerun mutation automatically.
- Surface safe unavailable/internal error.
- Emit high-severity diagnostic without sensitive payload.
- Preserve record for investigation.

# 66. Observability
- Log command code.
- Log safe scoped idempotency record identifier if available.
- Log replay vs execute classification.
- Log mismatch conflicts.
- Log retry count for transient transaction retries.
- Never log capability bearer token.
- Avoid full raw key in production logs; digest prefix is preferable.
- Avoid full customer free-text request bodies.

# 67. Metrics Concept
- idempotency executions count.
- replay count.
- key mismatch count.
- transient retry count.
- ambiguous outcome recovery count where measurable.
- failed finalization/invariant count.
- R05 need not introduce a new metrics vendor.
- Existing structured logs may be sufficient for baseline observability.

# 68. Abuse Resistance
- Key length bounded.
- Body size remains bounded by R04 HTTP layer.
- One client cannot use arbitrary key length to inflate indexes.
- Retention limits storage growth.
- Customer capability scope prevents one customer from enumerating another's records.
- Do not expose whether a raw key exists outside current scope.

# 69. Privacy
- Idempotency record should not store unnecessary PII.
- Customer notes/special requests should not be copied into replay table if resource/result identifiers are sufficient.
- If response body is stored, ensure it contains only already-authorized safe customer response data.
- Define retention considering privacy footprint.

# 70. Candidate Files to CREATE
- `src/modules/customer-data/server/idempotency/types.ts`
- `src/modules/customer-data/server/idempotency/fingerprint.ts`
- `src/modules/customer-data/server/idempotency/repository.ts`
- `src/modules/customer-data/server/idempotency/execute-idempotent-command.ts`
- `src/modules/customer-data/server/idempotency/index.ts`
- migration for idempotency persistence.
- unit tests for fingerprint/key/state-machine logic.
- integration tests for duplicate/concurrent/replay behavior.
- database tests for constraints/RLS/grants.
- Exact split may be consolidated when current code style makes a smaller coherent module clearer.

# 71. Candidate Files to MODIFY
- `src/modules/customer-data/server/commands/runtime.ts` for idempotent execution composition if appropriate.
- cart command adapter/wrappers, without duplicating business logic.
- submit-order adapter/wrapper.
- `commands/http.ts` for idempotency transport/error mapping.
- customer cart/items route handlers for header parsing.
- customer orders route handler for header parsing.
- customer-data index exports.
- generated DB types if schema changes.
- test discovery script/package entries only if needed.
- stable DB quality workflow scope only if migration/test discovery currently omits relevant paths; avoid unrelated workflow churn.

# 72. Files Not to Duplicate
- Do not create another CustomerContext.
- Do not create another customer transaction helper.
- Do not create duplicate cart/order repositories.
- Do not create duplicate command implementations.
- Do not create a second HTTP validation stack.
- Do not create new staff auth/permission models.

# 73. Files to MOVE
- No move required by default.
- Only move R04 code if a clear module boundary improvement is necessary and imports/tests are updated atomically.
- Avoid cosmetic directory churn.

# 74. Files to REMOVE
- No existing R04 command file should be removed by default.
- Remove ad-hoc temporary replay logic only if implementation finds it in latest branch and canonical service replaces it.
- Do not remove R04 structural locking or source-cart uniqueness protections; they remain defense in depth.

# 75. Migration Safety
- Forward-only migration.
- No destructive production reset.
- No historical migration rewrite.
- New table/index/function names deterministic.
- Existing production rows need no backfill unless current command history is intentionally enrolled.
- Prefer no backfill; idempotency begins for new R05 requests.
- Migration should be safe on fresh reset and incremental upgrade.

# 76. Existing Data
- Existing carts/orders created before R05 remain valid.
- They do not need synthetic idempotency records.
- Replay protection applies to requests after deployment.
- Do not infer fake request keys for historical orders.
- Existing R04 `submission_key` values remain intact unless a carefully justified migration changes semantics.

# 77. Indexes
- Unique scoped key index is required.
- Consider index on expires_at for cleanup.
- Consider lookup index only if not covered by unique key.
- Avoid redundant indexes.
- Index widths must remain bounded; digest storage can keep unique index compact.

# 78. Generated Types
- Any schema change must regenerate Kysely/database types through approved repository script.
- No hand-edit-only generated type drift.
- Verify generated diff matches migration.
- R06 acceptance will inherit these types.

# 79. RLS Test Matrix
- own scope can acquire.
- own scope can read replay record required by service.
- own scope cannot read another capability record.
- own scope cannot read another branch record.
- own scope cannot read another tenant record.
- customer runtime cannot alter successful record arbitrarily outside repository path if policy supports tighter control.
- public denied.
- anon denied.
- authenticated generic role denied.
- flow_customer_entry denied.
- staff flow_runtime access is not granted unless explicitly needed.

# 80. Constraint Test Matrix
- valid insert succeeds.
- duplicate scoped key denied.
- same raw key different capability succeeds as separate scope.
- same key different command behavior matches chosen uniqueness namespace.
- invalid status denied.
- malformed/null required fingerprint denied.
- SUCCEEDED missing required result fields denied if schema enforces it.
- expiry constraint valid.

# 81. Unit Test Matrix — Key Validation
- missing key.
- empty key.
- whitespace-only key.
- too-long key.
- allowed UUID/key form.
- invalid characters if restricted.
- exact normalization.

# 82. Unit Test Matrix — Fingerprint
- identical normalized input same digest.
- field-order variation cannot change digest when semantic object same.
- meaningful quantity change changes digest.
- menu item change changes digest.
- modifier change changes digest.
- special request normalization follows validation contract.
- command code change changes digest.
- cart/item selector change changes digest.

# 83. Unit Test Matrix — State Machine
- absent -> execute.
- success -> replay.
- same key/different fingerprint -> conflict.
- transient callback failure -> retryable/no committed success.
- permanent result serialization failure -> invariant handling.
- replay decoding valid.

# 84. Integration Test Matrix — Add Item
- first request executes once.
- identical replay returns same result.
- cart item count not duplicated.
- same key/different quantity conflicts.
- concurrent identical requests produce one mutation.
- cross-capability same raw key independent.

# 85. Integration Test Matrix — Update Item
- first update executes.
- replay returns original result.
- same key/different target quantity conflicts.
- concurrent same-key update executes once.
- different keys serialize under cart lock and represent distinct intents.

# 86. Integration Test Matrix — Remove Item
- first remove succeeds.
- replay succeeds after item is already gone.
- new key against missing item follows normal R04 not-found behavior.
- same key/different item ID conflicts.

# 87. Integration Test Matrix — Submit Order
- first keyed submit returns one order.
- identical replay returns same order ID/order number/status.
- only one order row exists.
- cart converted once.
- same key/different cart conflicts.
- same key/different customer note or semantic payload conflicts when included in fingerprint.
- concurrent identical submit requests execute once.
- response-loss simulation followed by replay returns committed result.

# 88. Integration Test Matrix — Different Submit Keys
- same cart with two concurrent different keys never creates two orders.
- exactly one can succeed if R04 source-cart uniqueness/locking dictates.
- loser receives stable business outcome.
- no partial second order.
- idempotency records reflect distinct intents appropriately.

# 89. Failure Injection Tests
- callback throws before mutation.
- callback throws after mutation but before finalize.
- finalization insert/update fails.
- transaction deadlock/serialization if test harness supports it.
- replay lookup DB failure.
- malformed persisted result decode.
- response lost after commit simulated at adapter boundary.

# 90. Regression Tests
- R01 capability tests remain green.
- R02 data-access isolation tests remain green.
- R03 persistence tests remain green.
- R04 command tests remain green.
- R04 DB submission security tests remain green.
- staff Auth.js/RBAC regressions remain green where current quality suite includes them.

# 91. Browser/E2E Coverage
- Double-click/double-submit order button behavior if current UI has the action wired.
- Network retry simulation if feasible.
- Refresh after ambiguous submit should recover via same key where client integration exists.
- If current UI does not yet expose these command routes, browser test may remain minimal and service/integration proof is primary.
- Do not redesign UI solely to satisfy an E2E test.

# 92. Validation Commands
- `npm ci` when package state requires install validation.
- repository lint command.
- repository typecheck command.
- application/unit tests.
- customer integration tests.
- Next.js build.
- Supabase local startup/reset for migration validation.
- database SQL/pgTAP tests.
- database lint.
- generated type verification/drift check.
- DB runtime integration suites.
- browser E2E where applicable.
- Record actual results only during implementation.

# 93. Validation Result Vocabulary
```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```
- Never fabricate PASS.
- Document validation in this authoring task is separate from future implementation validation.

# 94. Performance
- Idempotency lookup/acquire should be indexed and O(log n)-style DB lookup, not table scan.
- Fingerprint computation should be bounded by already-bounded request body.
- Replay should avoid rerunning menu/cart/order queries when stored result is sufficient.
- Keep transaction duration close to R04 baseline.
- Do not add unbounded polling.

# 95. Storage Growth
- Record size bounded.
- Avoid storing full aggregate when resource ID is enough to reconstruct safe result, unless reconstruction would change original response semantics.
- Consider compact JSONB result envelope.
- Retention/index cleanup documented.
- No blob/file storage needed.

# 96. Deployment Compatibility
- Migration must land before runtime expects idempotency table.
- Deployment ordering should follow existing migration/app release process.
- Runtime should fail closed if required idempotency storage unavailable.
- Do not silently bypass idempotency during partial rollout.
- If backwards-compatible route period is required, document exact strategy.

# 97. Rolling Deployment
- Old R04 instance may not require idempotency key while new R05 instance does.
- Mixed-version deployment can create inconsistent transport behavior.
- Prefer deployment strategy where migration is backward compatible and new runtime enables requirement atomically enough for current hosting platform.
- Do not add complex feature flags unless necessary.
- If temporary compatibility is unavoidable, it must not allow duplicate submit bypass.

# 98. Key Generation Helper
- If client/UI needs helper, use `crypto.randomUUID()` in modern browser where supported.
- Do not use Math.random.
- Server-generated key cannot reliably identify a retry that occurs before client receives it, so mutation intent key should generally originate client-side before first request.
- API documentation/test helpers should reflect this.

# 99. Key Lifecycle in UI State
- Generate once per action intent.
- Keep through pending/retry state.
- Do not generate on each fetch retry.
- On success, discard.
- On payload modification before successful send, generate a new key.
- On key mismatch error, client must not silently retry with changed payload under same key.

# 100. Security — Authorization First
- Validate customer capability before exposing replay records.
- Idempotency key is not bearer authorization.
- A guessed/stolen key alone cannot retrieve result.
- Scope lookup always includes trusted CustomerContext.
- Cross-scope queries return no useful enumeration signal.

# 101. Security — CSRF
- Preserve R04 same-origin mutation protections.
- Idempotency does not mitigate CSRF.
- Do not accept GET mutations.
- Header key does not replace origin checks.

# 102. Security — XSS
- Do not echo raw key in HTML.
- Replay JSON data follows existing safe serialization.
- Customer free text remains escaped by UI rendering.
- Idempotency store is not a new HTML template source.

# 103. Security — SQL Injection
- Use Kysely/parameterized SQL.
- Never interpolate key/fingerprint into raw SQL strings.
- Fixed command catalog, not arbitrary table/function names.

# 104. Security — Log Redaction
- raw capability token forbidden.
- password/session secrets forbidden.
- full raw idempotency key discouraged.
- full customer note/special request discouraged.
- safe command code/resource ID allowed where policy permits.

# 105. No Payment Semantics
- R05 does not make payment requests idempotent because payment execution is outside Phase 03 current scope.
- Do not introduce provider idempotency keys.
- Do not call Omise/Stripe.
- Future payment phase must define provider-specific idempotency independently while reusing general lessons as appropriate.

# 106. No Kitchen/Realtime Side Effects
- R04 has no external side effects before commit.
- R05 does not introduce kitchen ticket creation.
- R05 does not publish realtime events.
- R05 does not send notifications.
- Therefore replay result only covers current customer command result.
- Later side-effect phases will need outbox/exactly-once-at-least-once strategy separately.

# 107. Outbox Boundary
- Do not add generic outbox in R05 unless current command side effects already require it; they do not by observed R04 design.
- R06 may document future need but should not pull Phase 04 work backward.

# 108. Command Result Envelope
```ts
interface IdempotentCommandResult<T> {
  replayed: boolean;
  statusCode: number;
  data: T;
}
```
- Conceptual only.
- Transport may omit `replayed` from body if header/log is preferred.
- Persisted result should remain versioned and safe.

# 109. Domain Error Extensions
- Add explicit idempotency key required error.
- Add invalid key error.
- Add key payload mismatch error.
- Add idempotency unavailable/invariant error.
- Preserve existing customer command error taxonomy.
- Map safely to HTTP statuses.
- Avoid leaking database constraint names.

# 110. HTTP Status Guidance
- missing/invalid key: 400 or repository-standard validation status.
- payload mismatch: 409.
- replayed success: original success status.
- transient storage unavailable: 503 or current unavailable mapping.
- capability denied: existing auth/customer-context status.
- business conflict: existing R04 command status.

# 111. Repository Error Mapping
- Unique violation on scoped key is expected concurrency signal, not generic infrastructure failure.
- Decode known PostgreSQL constraint by stable constraint name if needed.
- Avoid string-matching full database messages where possible.
- Other DB errors map to existing customer data unavailable/invariant errors.

# 112. Constraint Naming
- Use deterministic explicit names for unique/check constraints.
- Tests may assert names only when repository logic depends on mapping.
- Avoid autogenerated names for critical uniqueness if application needs to classify violations.

# 113. Transaction Retry Policy
- If Kysely/current DB wrapper does not provide retry helper, implement narrow bounded retry only for recognized serialization/deadlock classes if needed.
- Do not retry arbitrary SQL errors.
- Do not retry business errors.
- Same idempotency identity persists across internal retries.
- Maximum attempts small and documented.
- Optional jitter/backoff outside transaction if practical.

# 114. PostgreSQL Error Classes
- serialization failure `40001` can be retryable.
- deadlock detected `40P01` can be retryable.
- unique violation `23505` on idempotency scoped key maps to concurrent acquisition/re-read.
- Do not broadly treat all `23xxx` constraint errors as retryable.
- Exact implementation should use available error typing safely.

# 115. Isolation Level
- Default transaction isolation may remain if unique constraints + row locks provide required invariants.
- Do not raise global isolation level without evidence.
- Submit path already uses explicit cart lock.
- R05 idempotency uniqueness adds request serialization.
- Test concurrency under actual isolation used.

# 116. Replay Lookup Timing
- Replay lookup/acquisition must occur after current CustomerContext validation but before mutable business state checks that could make a previously successful replay look invalid.
- This ordering is especially critical for submitted/converted cart replay.
- For a new key, proceed into current business validation after acquisition.

# 117. Context Revocation vs Replay
- Current capability revocation should normally deny even successful replay.
- This ensures replay store does not become a permanent unauthenticated receipt API.
- If product later requires order receipt access after table session closure, define separate customer receipt capability rather than weakening R05 scope silently.

# 118. Request Body Canonicalization
- Canonicalization operates on already parsed and validated command DTO.
- Unknown fields rejected before fingerprint.
- Numeric fields normalized to integers.
- UUIDs normalized according to validation helper.
- Free text uses existing trim/null normalization.
- Modifier list semantics must match R04 validation exactly.

# 119. Fingerprint Schema Version
- Include `v1` or equivalent marker in preimage.
- Future semantic change can introduce v2 without colliding with old records.
- Persist version or encode into command code/fingerprint source.
- Replay decoder must understand retained versions.

# 120. Idempotency Record Status Design
- `SUCCEEDED` is mandatory.
- `IN_PROGRESS` is optional depending one-transaction implementation.
- `FAILED_FINAL` is optional and should not be introduced without clear use.
- Minimize states to reduce recovery ambiguity.
- Every persisted state must have an operational recovery story.

# 121. One-Transaction Preferred Flow
```text
validate capability + request
→ begin customer transaction
→ acquire scoped idempotency record
→ if replay: return stored logical result
→ execute existing R04 command callback inside same transaction context
→ persist success result
→ commit
→ map to HTTP response
```
- Existing R04 command helpers may need refactoring to accept existing transaction/runtime rather than opening their own transaction.
- Avoid double transaction wrappers.

# 122. R04 Runtime Refactor Rule
- If R04 commands currently always create their own transaction, R05 may extract transaction-bound command cores.
- Preserve public command API behavior.
- Keep one canonical business implementation.
- Do not copy logic into idempotency service.
- Tests must prove non-idempotent core is not directly exposed to routes afterward.

# 123. Command Core Pattern
- Public route calls idempotent command facade.
- Facade validates context/key and opens transaction.
- Facade creates repositories/idempotency repository.
- Facade invokes transaction-bound command core.
- Core contains business logic and no transport concerns.
- This pattern keeps atomic record + mutation possible.

# 124. Direct Bypass Prevention
- Route modules must not call raw transaction-bound command core without idempotency for R05-covered mutations.
- Export surface should distinguish internal core from public facade.
- Server-only modules only.
- Unit/source regression test can assert route imports facade.

# 125. Cart Repository Compatibility
- Preserve parent FOR UPDATE lock semantics.
- Preserve terminal-state checks.
- Preserve price snapshot authority.
- Do not add key fields to cart rows unless truly necessary; dedicated record is cleaner.

# 126. Order Repository Compatibility
- Preserve one-cart-one-order uniqueness.
- Preserve customer ownership.
- Preserve draft/submitted transition constraints.
- Replay successful submit should return stored order result without requiring DRAFT order lookup.

# 127. Database Function Compatibility
- Preserve `private.submit_customer_order(uuid)` narrow authority unless R05 needs a transaction-bound variant.
- Do not broaden function grants.
- Idempotency transaction must call it under same customer runtime context.
- Function must execute only for winning request.

# 128. Result Reconstruction for Order
- Store order ID plus stable submitted response fields, or store a safe result envelope.
- If reconstructing from DB, ensure current customer RLS can read submitted order.
- If R03/R04 customer repository only reads DRAFT orders, R05 may add a narrow customer-owned submitted-order read needed for replay/response.
- Do not grant broad order history access beyond current capability scope.

# 129. Result Reconstruction for Cart
- Add/update/remove replay may store final cart aggregate or affected item/resource IDs.
- If current cart can mutate after original request, reconstructing later from current state would not reproduce original response.
- Decide whether exact original aggregate is required by transport contract.
- Prefer compact immutable logical result when possible.

# 130. Replay Semantics vs Current State
- Idempotency promises same logical operation outcome, not necessarily current resource snapshot unless API defines it that way.
- Document exact result per command.
- Submit order should return original order identity/state.
- Remove item can return operation success/resource ID rather than current full cart if that simplifies stable replay.
- R05 may refine R04 response DTOs for replay stability without redesigning UI.

# 131. API Response DTO Stability
- Define explicit response DTOs for covered mutations.
- Avoid returning arbitrary repository aggregates when not needed.
- Stable DTOs make replay storage smaller and versioning safer.
- Tests must lock response contract.

# 132. No Hidden Client Authority
- Idempotency key only names intent.
- It cannot select tenant/branch/table.
- It cannot select price.
- It cannot set order number.
- It cannot authorize a cart ID outside CustomerContext.
- All R01-R04 authority rules remain.

# 133. No Exactly-Once Claim Beyond Boundary
- R05 can provide effectively-once execution for database customer commands under its transaction/idempotency invariants.
- Do not claim global exactly-once delivery for future external side effects.
- Network delivery remains at-least-once/uncertain; replay layer makes outcomes deterministic.
- Wording in code/docs must be precise.

# 134. Customer Experience Recovery
- Timeout after submit should not encourage customer to start over immediately.
- Same request identity should recover prior result.
- UI may show retrying/checking state if currently wired.
- Avoid duplicate-order warning caused by deterministic replay.
- Broader UX redesign deferred.

# 135. Error Message Safety
- Key mismatch message should say request key already used for different request, without exposing original data.
- Unavailable message should advise retry same action safely.
- Never tell user to generate new key after unknown commit outcome automatically.
- Client implementation owns hidden key handling; end user need not see key.

# 136. Documentation Changes During Implementation
- Add developer-facing idempotency contract if repository API docs exist.
- Update `.env.example` only if new config genuinely needed; avoid env for fixed safe retention unless operational override justified.
- No secret required for hashing ordinary request fingerprints.
- Do not add unnecessary environment knobs.

# 137. Dependencies
- Node crypto built-ins should suffice for SHA-256/random helpers.
- No new package expected by default.
- Do not add Redis/client libraries.
- Do not add UUID package if platform `crypto.randomUUID` suffices.
- If dependency change becomes necessary, justify and run dependency integrity.

# 138. Database Privilege Boundary
- `flow_customer_runtime` receives only idempotency persistence rights needed.
- `flow_customer_entry` receives none.
- `flow_identity` receives none.
- `flow_runtime` staff rights not expanded by default.
- public/anon/authenticated none.
- service/admin database owner naturally may retain ownership privileges but application does not rely on them.

# 139. Data Integrity Under Capability Rotation
- If current CustomerContext capabilityId changes on re-entry, old idempotency records are scoped to old capability.
- New capability + same raw key is a new scope by default.
- Old successful order still exists.
- Do not use replay record to transfer ownership between capabilities.
- Future receipt/continuity feature can define explicit transfer separately.

# 140. Clock Usage
- Database timestamps preferred for persisted created/updated/expires values.
- Avoid trusting client timestamps.
- Expiry comparisons use server/database clock.
- Tests should avoid flaky wall-clock assumptions; inject/configure where practical.

# 141. Retention Constant
- Define one named constant/configuration source.
- Keep retention longer than capability request retry window when possible.
- If customer capability expires before idempotency record, authorization still gates replay.
- Retention does not extend capability authority.

# 142. Cleanup Strategy
- If no scheduler, expired rows may remain until future maintenance without affecting lookup if expiry is checked.
- Index expires_at for later cleanup.
- Optional opportunistic bounded cleanup must not add latency/race complexity.
- R05 does not need cron infrastructure.

# 143. Testing Parallelism
- Concurrency integration tests should use separate DB connections/transactions.
- Do not simulate concurrency with sequential promises that cannot overlap locks.
- Assert execution callback count where injectable.
- Assert final row counts.
- Bound test timeouts.

# 144. Test Determinism
- Use deterministic fixture CustomerContexts.
- Generate explicit keys in tests.
- Reset DB between suites according to current test harness.
- Do not rely on production data.
- Avoid sleeping except unavoidable lock coordination; use barriers/promises where possible.

# 145. Test — Replay After State Change
- Submit order first.
- Cart becomes converted.
- Replay same key.
- Must return original success, not `cart not draft`.
- This proves replay lookup ordering.

# 146. Test — Remove Replay After Deletion
- Remove item succeeds.
- Item absent.
- Replay same key.
- Must return original operation success.
- New different key gets normal current-state result.

# 147. Test — Capability Revoked
- Commit a successful keyed command.
- Revoke/expire underlying capability/table session according to R01 semantics.
- Replay attempt must follow current authorization policy and fail closed.
- It must not leak prior result cross-authority.

# 148. Test — Cross-Tenant Same Key
- Tenant A succeeds with raw key X.
- Tenant B uses raw key X.
- Tenant B must not receive Tenant A result/conflict revealing A.
- It is an independent scoped key.

# 149. Test — Cross-Branch Same Key
- Branch A succeeds key X.
- Branch A2 same capability scenario should be impossible under validated context or separate scope.
- Ensure no cross-branch replay lookup.

# 150. Test — Same Capability Different Command
- If uniqueness includes command namespace, same raw key on add-item and update-item may be independent.
- If product chooses key unique across all commands, second must conflict.
- Specification recommends command namespace included for predictable reuse isolation.
- Implementation must document exact chosen behavior.

# 151. Test — Payload Canonicalization
- Equivalent validated payload object ordering gives same digest.
- Unknown fields rejected before fingerprint.
- `null` vs omitted special request follows normalized DTO contract.
- Modifier ordering behavior explicit.

# 152. Test — Unique Race
- Two transactions try acquire same scoped key simultaneously.
- One succeeds acquisition.
- Other maps unique race to replay wait/read path.
- No uncaught SQL unique error reaches route.

# 153. Test — Finalization Rollback
- Force success-result persistence failure.
- Assert cart/order mutation rolled back.
- Retry same key can execute normally afterward.
- No orphan success business row without replay record.

# 154. Test — Unknown Commit Recovery Contract
- Exact DB-level unknown commit may be hard to simulate.
- At minimum simulate committed service result followed by transport-layer throw/drop.
- Retry same key returns stored result.
- Document limitation truthfully.

# 155. Definition of Done — Architecture
- one canonical idempotency service.
- one canonical repository/storage model.
- one canonical fingerprint implementation.
- routes use facade.
- R04 business cores reused.
- no duplicate transaction orchestration.

# 156. Definition of Done — Database
- migration forward-only.
- scoped unique constraint.
- least-privilege grants/RLS.
- generated types updated.
- pgTAP/DB tests added.
- no cross-customer visibility.
- no broad grants.

# 157. Definition of Done — Semantics
- exact retry returns exact logical result.
- same key/different payload conflicts.
- concurrent same key executes mutation once.
- submit ambiguous outcome recoverable by replay.
- remove replay remains success after deletion.
- replay cannot bypass capability authorization.

# 158. Definition of Done — Failure Safety
- transaction rollback covers idempotency + mutation.
- finalization failure cannot leave committed mutation without replay record.
- transient DB failure does not mark false success.
- replay storage failure does not bypass layer.
- retry policy bounded.

# 159. Definition of Done — Scope
- no payment provider calls.
- no kitchen ticket generation.
- no realtime publish.
- no notification send.
- no broad UI redesign.
- no Phase 03 final acceptance implementation.

# 160. PR Evidence Requirements
- exact spec filename.
- implementation parent branch/SHA.
- implementation head SHA.
- idempotency storage schema summary.
- key scope/fingerprint contract.
- retention choice.
- exact commands covered.
- concurrency results.
- ambiguous-response replay evidence.
- RLS/grant evidence.
- validation results using approved vocabulary.
- known limitations.
- R06 handoff.

# 161. Scope Declarations for Implementation PR
```text
IMPLEMENTATION_PHASE=P03
IMPLEMENTATION_ROUND=R05
CUSTOMER_IDEMPOTENCY_IMPLEMENTED: YES
REQUEST_FINGERPRINT_IMPLEMENTED: YES
DUPLICATE_REPLAY_IMPLEMENTED: YES
AMBIGUOUS_COMMIT_RECOVERY_IMPLEMENTED: YES
COMMAND_CONCURRENCY_HARDENING_IMPLEMENTED: YES
PAYMENT_EXECUTION_CHANGED: NO
KITCHEN_RUNTIME_CHANGED: NO
REALTIME_RUNTIME_CHANGED: NO
NOTIFICATION_RUNTIME_CHANGED: NO
PHASE03_ACCEPTANCE_IMPLEMENTED: NO
IMPLEMENTATION_AGENT_MERGE: NO
AUTO_MERGE: NO
```

# 162. R06 Handoff Objective
- R06 receives the complete customer authority/data plane chain.
- R06 receives replay-safe customer commands.
- R06 should not redesign idempotency.
- R06 should prove end-to-end customer entry → capability → data access → persistence → command → replay safety.
- R06 should perform final security/regression acceptance.
- R06 should produce Phase 03 acceptance record.
- R06 should define exact Phase 04 handoff.

# 163. Known Future Boundaries
- External payment idempotency belongs payment execution phase.
- Kitchen/realtime event delivery reliability belongs later operational/realtime phases.
- Notification retry/outbox belongs future notification scope.
- Cross-device account-bound customer history may require a stronger customer identity model later.
- R05 must not prebuild these.

# 164. Stop Condition — R04 Divergence
- If latest R04 branch no longer uses one transaction for commands, inspect why before applying this design.
- If command code has materially changed, adapt spec implementation while preserving idempotency invariants.
- Do not force outdated file names.
- Do not duplicate a newer canonical idempotency primitive if one already exists.

# 165. Stop Condition — Existing Idempotency Layer
- If latest lineage already contains an equivalent robust persistence-backed layer from concurrent work, audit against this spec.
- Extend/harden it rather than duplicate.
- Report conflicts before destructive replacement.

# 166. Stop Condition — External Side Effects Appeared
- If latest R04 lineage unexpectedly performs external side effects inside commands, R05 cannot claim safe replay by DB transaction alone.
- Stop and redesign side-effect boundary explicitly rather than replaying external calls.
- Do not silently duplicate payment/kitchen/notification actions.

# 167. Stop Condition — Broad Privilege Required
- If idempotency storage can only work by granting broad customer DB privileges, stop.
- Introduce narrow function/RLS design instead.
- Never weaken Phase 02/R02 security to simplify R05.

# 168. Stop Condition — Destructive Migration
- Production destructive rewrite/backfill not authorized.
- If migration requires dropping customer order data or incompatible rewrite, report blocker.
- Prefer additive forward-only design.

# 169. Document Validation Checklist
- [x] Phase 03 / Round 05 metadata canonical.
- [x] Previous is P03/R04.
- [x] Next is P03/R06.
- [x] Status READY.
- [x] main authority stated.
- [x] actual R04 branch/head evidence recorded.
- [x] idempotency scope explicit.
- [x] request fingerprint explicit.
- [x] duplicate replay explicit.
- [x] ambiguous commit recovery explicit.
- [x] concurrent same-key semantics explicit.
- [x] payload mismatch semantics explicit.
- [x] least privilege/RLS explicit.
- [x] failure/rollback explicit.
- [x] retention explicit.
- [x] validation matrices explicit.
- [x] R06 handoff explicit.
- [x] implementation merge remains owner-controlled.

# 170. Document Internal Consistency
- R05 wraps R04 rather than replacing commands.
- CustomerContext remains authority.
- idempotency key is never authorization.
- persisted replay state is scoped by trusted customer context.
- success record and business mutation are atomic where required.
- R04 structural locks remain defense in depth.
- payment/kitchen/realtime remain excluded.
- R06 remains acceptance round.

# 171. Document-Only Validation Policy
- Validate metadata, sequence, repository evidence, architecture, idempotency semantics, security, failure/recovery, tests, and handoff.
- GitHub Actions are not document-validation authority.
- Failed/queued/skipped/missing Actions do not semantically invalidate this document.
- Hosted merge enforcement may technically block documentation merge; report that separately.
- Documentation task must not alter CI/runtime to force docs merge.

# 172. Implementation Validation Policy
- Future R05 implementation must run actual applicable repository checks.
- Source audit in this spec is not runtime proof.
- Required CI failures remain implementation blockers.
- Do not fabricate PASS.
- Implementation PR remains owner-controlled.

# 173. Required Validation Families
- repository integrity.
- phase/round gate.
- dependency integrity if dependency files change.
- lint.
- typecheck.
- unit tests.
- integration tests.
- Next.js build.
- Supabase fresh/reset migration path.
- database SQL/pgTAP tests.
- DB lint.
- generated type drift verification.
- customer DB runtime integration.
- relevant E2E.

# 174. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This specification authorizes only P03/R05 implementation after it is on main.
- Future implementation must branch from latest legitimate P03/R04 implementation lineage.
- Documentation branch is never the implementation parent.
- Owner controls implementation integration.

# 175. Final Handoff to R06
- Customer capability trust from R01 remains intact.
- Customer data access substrate from R02 remains intact.
- Durable cart/order persistence from R03 remains intact.
- Customer command orchestration from R04 remains intact.
- R05 adds deterministic request identity and replay-safe command execution.
- R05 adds duplicate-request protection and ambiguous-response recovery.
- R05 adds bounded transaction retry/concurrency hardening.
- R06 can perform end-to-end acceptance without adding another command reliability layer.

# 176. Required Next Specification
```text
FLOW_P03_R06_IMPLEMENTATION_SPEC.md
```
- R06 must be authored from actual R05 implementation state.
- R05 must not infer Phase 04 implementation scope.
- No R06 implementation starts until exact R06 specification exists on current `main`.

# 177. Final Acceptance Statement
- P03/R05 is READY as an executable specification document.
- The round makes customer mutations deterministic under duplicate delivery, network retries, concurrent same-key requests, and ambiguous post-commit response loss.
- The idempotency key identifies request intent but never grants authority.
- CustomerContext remains the authorization boundary.
- Existing R04 command business logic remains canonical.
- Database uniqueness and transaction coupling provide the final request concurrency boundary.
- Phase 03 final end-to-end acceptance remains P03/R06.

# 178. Acquire API Contract
- Acquisition must return a typed outcome, not throw for ordinary duplicate detection.
- Candidate outcomes: `ACQUIRED`, `REPLAY`, `MISMATCH`, `RETRYABLE_IN_PROGRESS` only if separate durable in-progress state exists.
- `ACQUIRED` returns the transaction-bound record identifier needed for finalization.
- `REPLAY` returns decoded persisted logical result.
- `MISMATCH` includes no original payload.
- Database unique violation is translated internally into one of these outcomes.
- Callers must not inspect raw PostgreSQL errors for normal duplicate handling.

# 179. Finalize Success API Contract
- Finalize may execute only for the request that owns the acquisition within the transaction.
- It stores result schema version.
- It stores stable logical response payload or resource reference.
- It stores response status when required.
- It marks status SUCCEEDED atomically.
- It updates updated_at using database time.
- It must fail if record fingerprint/command/scope unexpectedly changed.
- Finalization failure aborts the business transaction.

# 180. Replay Decoder Contract
- Decoder validates result version.
- Decoder validates command-specific result shape.
- Decoder rejects malformed/corrupt JSON.
- Decoder must not silently coerce unknown versions.
- Decoder returns typed result to HTTP adapter.
- Corruption maps to invariant/unavailable without re-execution.

# 181. Command-Specific Result DTO — Add Item
- Persist only fields needed to represent original successful add intent.
- At minimum identify cart and affected item when current API exposes them.
- If original route returns full cart aggregate, implementation may migrate route response to stable mutation DTO if backward compatibility allows.
- Any DTO change must be explicit in tests.
- Replay must not duplicate cart item.

# 182. Command-Specific Result DTO — Update Item
- Result should identify cart item and accepted quantity, or another stable existing API result.
- Replay does not need current full cart state unless API promises it.
- This avoids replay result changing after later cart edits.

# 183. Command-Specific Result DTO — Remove Item
- Stable result should include removed item identifier and success state.
- It should not depend on querying an already deleted item.
- Replay remains successful after deletion.

# 184. Command-Specific Result DTO — Submit Order
- Store/replay order ID.
- Store/replay final order number.
- Store/replay submitted/customer status returned by API.
- Store/replay submitted timestamp if API exposes it.
- Do not recalculate order number on replay.
- Do not reload DRAFT-only repository path on replay.

# 185. Repository Acquire Algorithm — Preferred
```text
INSERT scoped key + fingerprint
ON CONFLICT DO NOTHING
if inserted -> ACQUIRED
else SELECT existing scoped row
compare fingerprint
if mismatch -> MISMATCH
if success -> REPLAY
otherwise -> handle only explicitly supported state
```
- Exact SQL/Kysely form may differ.
- Scope predicates must always include trusted tenant/branch/capability/command.
- Avoid select-then-insert without unique backstop.

# 186. Acquire Race Under One Transaction
- PostgreSQL unique index may cause loser to wait for winner transaction outcome.
- If winner commits, loser observes conflict/existing row and replays.
- If winner rolls back, loser insert may proceed.
- This behavior should be tested with separate connections.
- Avoid implementing application-level busy loops around this behavior.

# 187. Acquire Timeout Behavior
- Database lock wait must remain bounded by platform/database settings.
- R05 need not globally change lock_timeout unless evidence requires it.
- If a lock timeout is surfaced, classify as retryable with same key.
- Do not create a new key automatically.

# 188. Exact Lock Ordering Contract
```text
1. validate capability/request outside mutation transaction as appropriate
2. begin customer data transaction
3. acquire idempotency scoped-key uniqueness
4. if new execution: acquire R04 cart/order row lock
5. execute business mutation
6. finalize replay result
7. commit
```
- All R05-covered cart/order commands follow this order when both locks exist.
- This is the default deadlock prevention order.

# 189. Transaction-Bound Command Core Interface
```ts
interface CustomerCommandRuntime {
  context: CustomerDatabaseContext;
  repositories: CustomerRepositories;
  trx: DatabaseTransaction;
}
```
- Conceptual only.
- R04 command core should be callable with this runtime.
- Public facade owns transaction creation and idempotency.
- Core must not open its own transaction.

# 190. Public Facade Interface
```ts
executeIdempotentCommand<TInput, TResult>({
  command,
  idempotencyKey,
  input,
  fingerprint,
  execute,
})
```
- Facade resolves current customer context.
- Facade opens transaction once.
- Facade acquires/replays.
- Facade invokes business core only when acquired.
- Facade finalizes result.
- Facade returns executed/replayed classification.

# 191. R04 Command Refactor Acceptance
- Existing route-visible functions may remain wrappers for backward source compatibility during implementation.
- No route may bypass R05 facade afterward.
- Command business logic must exist in one location only.
- Existing R04 unit/integration tests should be adapted rather than deleted wholesale.
- Source regression should prove no second divergent path.

# 192. Database Table Minimum Columns
- `id uuid primary key`.
- `tenant_id uuid not null`.
- `branch_id uuid not null`.
- `customer_capability_id uuid not null` or exact current type.
- `command_code text not null`.
- `key_digest text not null`.
- `request_fingerprint text not null`.
- `status text not null`.
- `result_version integer null/non-null according to status`.
- `result_payload jsonb null/non-null according to status`.
- `http_status integer null/non-null according to status` when persisted.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.
- `expires_at timestamptz not null`.

# 193. Optional Columns
- restaurant_id if current customer DB context requires explicit RLS binding.
- table_id/table_session_id if needed for policy or diagnostics.
- resource_type/resource_id if result payload is intentionally minimal.
- Do not add fields without actual use.

# 194. Status Constraint Detail
- If one-transaction design is used, status may be simplified to only `SUCCEEDED` because uncommitted acquired rows are invisible until commit.
- If row exists within transaction before finalization, temporary state can still be `IN_PROGRESS` but never durable after rollback.
- Choose the smallest state model consistent with SQL flow.
- Do not add `FAILED_FINAL` by default.

# 195. Result Integrity Constraint
- SUCCEEDED row requires non-null result_version.
- SUCCEEDED row requires non-null result payload/resource reference.
- HTTP status must be valid integer range if stored.
- request fingerprint immutable after creation.
- command/scope/key digest immutable after creation.

# 196. Mutation Restrictions on Replay Records
- Customer runtime should not have arbitrary DELETE of successful records from application paths.
- Update should be restricted to finalization path if possible.
- If direct table CRUD is used, RLS with WITH CHECK must preserve same scope.
- Narrow functions may provide stronger immutability.

# 197. Retention Minimum Decision
- Implementation must choose and document exact retention.
- Baseline recommendation: at least 24 hours.
- Order submission may justify 72 hours or longer depending operational retry expectations.
- Do not invent multi-month retention without need.
- R06 must record final chosen retention.

# 198. Cleanup Operational Contract
- No cleanup scheduler is required to mark R05 complete.
- Table must remain query-correct with expired records present.
- Lookup should reject expired record according to policy.
- Future maintenance can batch delete by expires_at index.
- Do not synchronously delete large expired sets on customer request path.

# 199. Expired Existing Record Semantics
- If scoped key exists but expired and not deleted, implementation must choose deterministic handling.
- Recommended safe baseline: treat key as expired conflict/retry-window-ended rather than reusing immediately while row exists.
- This avoids delete/reinsert races.
- Cleanup later permits reuse only after retention lifecycle.
- Client normally generates fresh UUIDs, so reuse is unnecessary.

# 200. Replay Result Retention vs Order Lifetime
- Idempotency result is not permanent order history.
- After retention, customer should rely on future order/receipt access mechanism, not old request key.
- R05 must not turn idempotency table into customer history store.

# 201. Request Key Length Contract
- Define explicit maximum such as 128 characters if allowing opaque strings.
- If enforcing UUID only, parser should require canonical UUID string.
- UUID-only simplifies index/key abuse controls.
- Implementation may choose UUID v4 and document it.
- Do not accept megabyte-scale arbitrary headers.

# 202. Header Parsing Contract
- Exactly one effective idempotency key.
- Duplicate header values must be rejected or normalized deterministically; do not pick arbitrary one.
- Trim only surrounding OWS if framework returns it.
- Empty after trim is invalid.

# 203. Proxy/Header Preservation
- Confirm hosting/proxy preserves `Idempotency-Key` header.
- No special secret forwarding is needed.
- If platform strips unknown headers, choose another explicit supported header before implementation.
- Do not move key into query string as convenience without security review.

# 204. CORS/Same-Origin Compatibility
- Current customer routes are same-origin by design.
- Custom header does not require browser preflight for same-origin.
- If cross-origin client appears later, CORS policy belongs separate scope.
- Preserve R04 origin checks.

# 205. Request Fingerprint Preimage Contract
```text
FLOW-CUSTOMER-COMMAND
version=v1
command=<stable-code>
selector=<ordered normalized selectors>
payload=<canonical normalized payload>
```
- Use an unambiguous serialization delimiter/length encoding or canonical JSON.
- Avoid concatenation where field boundary collisions are possible.

# 206. Modifier Fingerprint Rules
- Use modifier identifiers, not display labels, when current command input is identifiers.
- Quantity/selection ordering must reflect R04 semantics.
- If duplicate modifier choices are rejected, canonicalizer may sort unique IDs if semantic order irrelevant.
- Tests must prove reordered equivalent modifiers either match or conflict according to chosen business semantics.

# 207. Free-Text Fingerprint Rules
- Use post-validation normalized special request/customer note.
- Do not lowercase customer text.
- Do not collapse internal whitespace unless R04 already does.
- Null and empty normalization must match existing command validator exactly.

# 208. Key Digest Contract
- If raw key digest used, preimage should include normalized key bytes only.
- SHA-256 hexadecimal or base64url output fixed length.
- Do not salt if deterministic lookup required.
- Digest is for storage/log hygiene, not password security.

# 209. Replay Classification in Logs
- `execution=executed` for winner.
- `execution=replayed` for exact duplicate success.
- `execution=mismatch` for reused key/different payload.
- `execution=retryable_failure` for transient storage path.
- Keep vocabulary small and searchable.

# 210. Correlation IDs
- Existing request correlation mechanism may be used if present.
- Idempotency key digest is not a general tracing ID.
- Do not expose full key across logs/services unnecessarily.
- R05 need not add distributed tracing vendor.

# 211. Retry Backoff Guidance
- Server-side retries only for recognized transaction transient errors.
- Suggested attempts: 2–3 total maximum.
- Backoff should be short and bounded.
- Do not sleep while holding transaction locks.
- Reopen transaction per retry attempt with same request identity.

# 212. Retry Callback Purity
- R04 command core must not perform external side effects, which is already an R04 invariant.
- Therefore transaction retry is safe with respect to external systems.
- If future code adds side effects, retry boundary must be revisited.

# 213. Unknown Outcome API Guidance
- If server cannot determine whether commit succeeded after connection error, respond with retryable safe generic error.
- Client retains same key.
- Do not return “failed” in a way that encourages new request identity.
- Documentation should describe same-key retry contract for client developers.

# 214. Client Timeout Contract
- Timeout does not mean mutation failed.
- Same-key retry is mandatory recovery path.
- Client button may remain disabled/pending while retrying.
- R05 implementation can expose helper but UI overhaul is excluded.

# 215. Double-Click Contract
- Same user action should reuse same key across duplicate event handlers if UI can double-fire.
- Disable button is UX defense but not correctness boundary.
- Server idempotency remains final protection.

# 216. Browser Refresh Contract
- If refresh occurs during pending submit and client key was only volatile memory, recovery may be lost.
- If current UI implements submission, consider sessionStorage/local state for pending request key only if security/UX appropriate.
- Do not store capability bearer secret with it.
- R05 does not require durable browser persistence when UI not yet wired.

# 217. Mutation Key Ownership in Client Code
- Key belongs to one semantic mutation attempt.
- Re-render must not generate new key for same pending attempt.
- React component state/effect dependencies must avoid regeneration loops.
- Test helper can model this even if UI not yet production-wired.

# 218. Submit Result Read Access
- If replay stores only order ID and response reconstruction queries order, implement narrow `findCustomerSubmittedOrderById` or equivalent.
- It must scope tenant/branch/capability.
- It must not expose another customer's order.
- It must not expose staff-only fields.
- Prefer stored response envelope if simpler and safer.

# 219. Cart Result Snapshot Tradeoff
- Persisting full cart response on every mutation can increase storage.
- Persisting operation result only is leaner and stable.
- R05 should prefer operation-specific DTOs.
- UI can separately refresh cart after success if needed.
- This separates replay semantics from mutable aggregate reads.

# 220. HTTP Adapter Replay Header
- Optional `Idempotency-Replayed: true` may aid diagnostics/tests.
- If implemented, original execution may omit or set false.
- Header contains no secret.
- Do not rely on header for application correctness.

# 221. HTTP Error Body Contract
- Use existing `{ ok: false, error: ... }` shape.
- Add stable public code for key mismatch.
- Do not include fingerprint/key digest.
- Retryable unavailable may include a safe retry hint without exposing internals.

# 222. Database Test — Role Grants
- Verify `flow_customer_runtime` has intended table/function privilege.
- Verify `flow_customer_entry` denied.
- Verify `flow_identity` denied.
- Verify anon/authenticated denied.
- Verify no accidental grant on broader schemas.

# 223. Database Test — Cross-Capability RLS
- Set transaction customer capability A.
- Insert/acquire A record.
- Switch to capability B in separate transaction.
- B cannot select/update A record.
- Same tenant/branch is insufficient without capability match.

# 224. Database Test — Cross-Tenant RLS
- A tenant record invisible from B tenant context.
- Insert with forged tenant denied.
- Update scope columns denied.

# 225. Database Test — Immutable Fingerprint
- Successful record fingerprint cannot be altered through normal runtime path.
- Successful record command code cannot be altered.
- Successful record scope cannot be altered.

# 226. Integration Test — Callback Counter
- Inject callback with counter where architecture allows.
- Run two identical same-key concurrent requests.
- Assert callback invoked exactly once.
- Assert both callers observe success.

# 227. Integration Test — Winner Rollback
- First transaction acquires then throws before commit.
- Second same-key attempt should eventually acquire and execute.
- No stuck durable record.
- Callback total successful execution exactly one.

# 228. Integration Test — Mismatch During Concurrency
- Request A key X payload A starts.
- Request B key X payload B races.
- Only A or B wins based on acquisition.
- Loser receives mismatch after winner scope/fingerprint becomes visible.
- No second mutation.

# 229. Integration Test — Retention Boundary
- When feasible use injected clock/database fixture to create expired record.
- Confirm expired behavior matches chosen policy.
- Avoid flaky real-time sleeps.

# 230. Integration Test — Replay Decode Version
- Persist supported v1 result.
- Replay decodes.
- Unsupported result version causes invariant error, no command re-execution.

# 231. Integration Test — Storage Unavailable
- Simulate repository failure during initial lookup/acquire.
- Command callback must not run.
- HTTP maps to unavailable/retryable.

# 232. Integration Test — Finalization Failure
- Inject finalization failure after business core mutation in same transaction.
- Transaction rollback removes mutation.
- Retry works normally.
- This is mandatory proof of atomicity.

# 233. Integration Test — Submitted Cart Replay Ordering
- First submit succeeds and converts cart.
- Replay same key reaches replay lookup before cart DRAFT validation.
- Returns original order result.
- If implementation validates cart state first, test must fail.

# 234. Source Regression — Route Coverage
- Every state-changing customer route is inventoried.
- Covered mutation routes require idempotency facade.
- No direct import of transaction-bound command core from route.
- Read-only routes exempt.

# 235. Source Regression — Command Core Single Authority
- Search for duplicate add/update/remove/submit business logic.
- Exactly one canonical core per command.
- Facade wraps rather than duplicates.

# 236. Source Regression — No External Calls
- R05-covered transaction core contains no fetch/payment/realtime/notification call.
- Preserve this before enabling transaction retry.

# 237. Generated Type Drift Acceptance
- Migration table appears in generated database types.
- column nullability/types match SQL.
- no unrelated generated drift.
- verification script passes during implementation.

# 238. Fresh Database Acceptance
- Fresh Supabase start/reset applies all migrations including R05.
- Existing R01-R04 database tests remain green.
- New idempotency pgTAP suite green.
- No production linked DB mutation used for validation.

# 239. Incremental Migration Acceptance
- Migration applies on schema containing R04 data.
- Existing carts/orders unaffected.
- No required table rewrite/backfill of large business tables.
- New indexes build acceptably for expected current scale.

# 240. Deployment Failure — App Before Migration
- If new app reaches instance before migration, idempotency storage missing.
- Must fail closed/unavailable rather than execute unprotected mutation.
- Deployment runbook/process should order migration appropriately.

# 241. Deployment Failure — Migration Before App
- New table existing while old R04 app still serves requests is backward compatible.
- Old app may still accept non-idempotent requests during rollout window.
- Minimize mixed-version window.
- Current deployment platform strategy should be documented in PR if relevant.

# 242. Compatibility Decision — Require Key Immediately
- Preferred after R05 deployment: all covered mutation routes require key.
- Do not silently synthesize server keys for missing client keys because retry identity would be lost.
- If current customer UI is not yet using routes, tests/clients must update together.

# 243. Compatibility Decision — Legacy Client
- If a real legacy client exists and cannot send key, implementation must explicitly block or design bounded transition.
- Do not maintain indefinite optional-idempotency mode.
- No evidence currently requires legacy compatibility.

# 244. Database Cleanup Future Runbook
- Document SQL pattern for deleting expired records in bounded batches if operational docs are updated.
- Do not run production cleanup from this round.
- Do not add destructive scheduled job without owner-approved operational scope.

# 245. Security Threat — Key Guessing
- High-entropy UUID prevents practical guessing.
- Even guessed key cannot authorize without CustomerContext.
- RLS provides second boundary.
- Error responses resist existence enumeration cross-scope.

# 246. Security Threat — Key Reuse Attack
- Attacker with same authorized capability could intentionally reuse key with different payload.
- Mismatch conflict prevents mutation substitution.
- Same-key replay returns original result only within authorized scope.

# 247. Security Threat — Replay After Logout/Expiry
- Customer capability validation still runs.
- Idempotency record alone cannot restore authority.
- Revoked/expired context fails closed.

# 248. Security Threat — Header Injection
- Framework parses header values.
- Bound character set/UUID parser rejects control characters.
- Never interpolate header into logs/SQL unsafely.

# 249. Security Threat — Replay Payload Data Leakage
- Stored result contains only safe customer-facing response.
- No internal DB diagnostics.
- No staff fields.
- No capability token.
- Cross-scope RLS denies access.

# 250. Failure Taxonomy — Idempotency Specific
```text
IDEMPOTENCY_KEY_REQUIRED
IDEMPOTENCY_KEY_INVALID
IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST
IDEMPOTENCY_STORE_UNAVAILABLE
IDEMPOTENCY_RESULT_INVALID
```
- Exact enum names may follow existing style.
- Public messages remain safe.
- Retry classification explicit.

# 251. Error Mapping — Required
- required/invalid key -> input error.
- mismatch -> conflict.
- store unavailable -> unavailable/retry same key.
- invalid stored result -> internal/unavailable, no execute.
- recognized transient DB transaction error -> bounded retry before public unavailable.

# 252. Business Error Interaction
- Existing R04 `CART_NOT_DRAFT`, not-found, availability, modifier validation remain canonical.
- Do not translate all business conflicts into idempotency conflicts.
- New-key request reaching terminal cart gets R04 business error.
- Same-key successful replay bypasses re-execution and gets original success.

# 253. Command Validation Ordering
```text
transport/origin/body limits
→ customer capability
→ idempotency key format
→ command DTO validation/normalization
→ fingerprint
→ idempotency acquire/replay
→ mutable business-state validation + command execution
```
- This ordering prevents invalid payload records while preserving successful replay before mutable-state rejection.

# 254. Fingerprint vs Capability Validation Ordering
- Capability must be validated before DB replay lookup.
- Fingerprint may be computed before transaction after DTO validation.
- Trusted scope comes only from CustomerContext.

# 255. Result Finalization Ordering
- Business core returns stable logical result.
- Validate/serialize result envelope.
- Persist final result.
- Only then allow transaction commit.
- HTTP conversion occurs after commit.

# 256. Serialization Failure Ordering
- If JSON serialization/result validation fails before persisted finalization, transaction rolls back.
- Do not discover unsupported result only after commit.
- Test this using invalid injected result when possible.

# 257. Operational Debug Procedure
- Given safe record ID/digest, inspect status/result version without exposing raw customer data.
- Compare command code and timestamps.
- Do not manually mutate successful record as normal recovery.
- Production repair belongs controlled ops procedure, not customer endpoint.

# 258. No Manual Replay Endpoint
- R05 does not create admin endpoint to replay customer commands.
- Normal client retry with same key is sufficient.
- Avoid privileged operational surface expansion.

# 259. No Global Deduplication
- Different customers may legitimately use same raw UUID/key by astronomical coincidence or test fixture.
- Scope isolates them.
- Different command namespaces can remain independent according to chosen contract.

# 260. No Content-Based Dedup Without Key
- Identical payload sent with different keys represents potentially distinct user intents.
- Do not dedupe only by fingerprint.
- Key + fingerprint together define replay identity.

# 261. No Time-Window Heuristic Dedup
- Do not say “same request within 5 seconds” and dedupe heuristically.
- Explicit idempotency key is deterministic.
- Time only governs retention, not intent equality.

# 262. No Client-Generated Resource ID as Sole Key
- Cart/order/resource IDs may participate in fingerprint but do not replace request key.
- Submit order resource ID is server-generated in current flow.
- Request key exists before response/resource ID.

# 263. Package/Dependency Validation
- Expected dependency additions: none.
- If package files change only test scripts, record that accurately.
- If new dependency added, Dependency Integrity required.
- Prefer built-in crypto/JSON utilities.

# 264. Environment Variables
- No new secret expected.
- Retention may be fixed code constant.
- Avoid operational env knob unless current deployment needs configurable retention.
- If added, validate bounds and document default.

# 265. Performance Acceptance Thresholds
- No unindexed scoped replay lookup.
- No N+1 business query added by replay path.
- Replay path should be cheaper than execution path.
- Same-key concurrency should wait only on DB transaction/unique lock, not app polling loop.

# 266. Resource Exhaustion Controls
- Key/header length bounded.
- Result payload bounded by known DTO.
- JSONB result cannot contain arbitrary request body.
- Retention bounded operationally.
- Index cardinality proportional to mutation count.

# 267. R06 Acceptance Evidence Required from R05
- exact idempotency table/function schema.
- exact key scope.
- exact fingerprint algorithm/version.
- exact retention.
- exact command coverage.
- exact replay result DTOs.
- concurrency proof.
- ambiguous-response proof.
- cross-scope denial proof.
- all R01-R04 regressions.

# 268. R06 Must Not Repair R05 Silently
- If R05 hands off uncovered mutation route, R06 should fail acceptance and return defect to R05 ownership.
- If same-key duplicate can execute twice, R06 should fail.
- If replay can bypass capability authorization, R06 should fail.
- If mismatch executes, R06 should fail.
- If mutation can commit without replay record, R06 should fail.

# 269. Handoff — Complete Customer Command Reliability Chain
```text
CustomerContext
→ normalized command intent
→ idempotency key + fingerprint
→ scoped acquisition
→ one transaction
→ R04 command core
→ R03 persistence
→ success result record
→ commit
→ deterministic replay on retry
```

# 270. Implementation Order
1. Re-read current main policy/spec and latest R04 branch.
2. Inventory every customer mutation route and current command transaction shape.
3. Decide exact scoped key/command/fingerprint contract.
4. Design additive idempotency schema/constraints/RLS.
5. Add migration + DB tests.
6. Regenerate DB types.
7. Add fingerprint/key/result types and unit tests.
8. Add transaction-bound idempotency repository.
9. Refactor R04 command cores only as needed for transaction injection.
10. Add canonical idempotent facade.
11. Wire route headers/facade.
12. Add concurrent/replay/failure integration tests.
13. Run full inherited validation.
14. Open one R05 implementation PR and stop.

# 271. Implementation Anti-Pattern — Separate Success Record Transaction
- Do not commit business mutation first then write replay record in a second transaction.
- Crash between commits would violate replay recovery.
- Atomicity requires shared transaction for current database-only commands.

# 272. Implementation Anti-Pattern — Precommitted Lock Row
- Do not add durable IN_PROGRESS lease table pattern unless necessary.
- Current commands are short DB transactions.
- Unique uncommitted row already serializes same key under PostgreSQL.
- Simpler one-transaction design is preferred.

# 273. Implementation Anti-Pattern — Cache-Only Idempotency
- Process memory cache fails across serverless instances/restarts.
- Edge cache/CDN is not durable command authority.
- PostgreSQL record is required baseline.

# 274. Implementation Anti-Pattern — Optional Key on Submit
- Submit route must not quietly skip idempotency when header absent after R05 cutover.
- Missing key should fail before command execution.
- Server-generated fallback key defeats retry identity.

# 275. Implementation Anti-Pattern — Fingerprint Raw JSON Text
- Raw request body formatting/key order differences would conflict incorrectly.
- Parse, validate, normalize, canonicalize semantic DTO first.

# 276. Implementation Anti-Pattern — Persist Raw Request
- Do not store customer note/modifier payload merely to compare requests.
- Store fingerprint.
- Store safe response result only.

# 277. Implementation Anti-Pattern — Replay by Re-execution
- “Retry same command and hope uniqueness prevents duplicate” is not sufficient.
- Replay must detect original success and return original logical result without business re-execution.

# 278. Implementation Anti-Pattern — Authorization After Replay
- Never lookup/reveal replay result before validating current CustomerContext.
- Idempotency store must not become unauthenticated result cache.

# 279. Implementation Anti-Pattern — Broad Retry
- Do not retry validation errors.
- Do not retry permission/capability errors.
- Do not retry arbitrary SQL constraint errors.
- Retry only known transient transaction failures.

# 280. Document Final Validation Checklist
- metadata sequence correct.
- R04 observed SHA correct.
- R04 PR evidence noted.
- scope limited to R05.
- DB storage justified.
- key transport/scope explicit.
- fingerprint/version explicit.
- success atomicity explicit.
- replay ordering explicit.
- lock ordering explicit.
- retry classes explicit.
- retention explicit.
- client behavior explicit.
- RLS/security explicit.
- tests explicit.
- deployment explicit.
- R06 handoff explicit.

# 281. Final Definition of Done
- Every covered mutation has deterministic idempotency behavior.
- Same-key same-intent mutation executes at most once and replays successfully.
- Same-key changed-intent mutation never executes and returns conflict.
- Ambiguous committed success is recoverable by same-key retry.
- Current authorization remains mandatory for replay.
- R04 command logic remains single canonical authority.
- R03 persistence invariants remain intact.
- R02 least-privilege transaction context remains intact.
- R01 capability semantics remain intact.
- All required implementation validations are truthful.
- One implementation PR is opened/updated.
- Implementation agent does not merge it.

# 282. Final Handoff Summary
- R05 converts R04 from single-request transactional correctness into retry-safe command correctness.
- The customer-facing database mutation plane now has explicit request identity.
- Replay is deterministic within retention and authorized capability scope.
- Duplicate delivery cannot duplicate covered mutations.
- Different intents remain distinct by key/fingerprint rules.
- R06 can focus on integrated acceptance rather than adding new reliability mechanics.

# 283. Required Next Specification
```text
FLOW_P03_R06_IMPLEMENTATION_SPEC.md
```
- It must be authored from actual R05 implementation state.
- Until that file exists on current `main`, R06 implementation must not begin.

# 284. Final Acceptance Statement
- P03/R05 is READY as an executable specification document.
- It defines a persistence-backed, transaction-coupled idempotency boundary for customer mutations.
- It preserves CustomerContext as authorization authority and R04 commands as business authority.
- It explicitly handles exact replay, payload mismatch, same-key concurrency, transient retry, and ambiguous post-commit response loss.
- It does not claim exactly-once semantics for future external side effects.
- Phase 03 final acceptance remains P03/R06.
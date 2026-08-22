# Archive

Controls movement of inactive but still retained records into durable, restricted, searchable storage without losing context or version history.

## Archive model
```text
Entity / Counterparty
→ Record family
→ Year / lifecycle
→ immutable or version-protected executed evidence
→ metadata/register link
```

## Required archive metadata
Record ID/type, owner, counterparty/subject, executed/effective/closed date, governing contract/case/transaction, retention class, legal-hold status, source system, archive location, checksum/hash where used, and access classification.

## Workflow
```text
Record reaches archive state → completeness check → executed/final evidence separated from drafts → metadata/register verified → permissions applied → transfer/archive → retrieval test → source-cleanup rule → retention timer/hold maintained
```

## Failure modes
Signed documents live only in personal email, drafts mixed with executed copies, amendment overwrites original, archive link breaks, or archived personal data remains broadly accessible.
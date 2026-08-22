# Consent

Controls consent only where it is an appropriate basis or operational requirement and preserves proof of what the person agreed to.

## Evidence fields
Person/account identifier, purpose, exact consent text/version, channel/context, timestamp, source/session reference, status, withdrawal date/method, downstream suppression/deletion action, and related notice/campaign.

## Workflow
```text
Purpose identified → determine whether consent is appropriate → clear granular text → collect affirmative action → store versioned evidence → use only for stated purpose → withdrawal request → suppression propagated → proof of completion
```

## Rules
Separate marketing consent from contractual acceptance or necessary service processing. Do not bundle unrelated purposes. Withdrawal must propagate to downstream marketing/communication systems; recording `withdrawn=true` in one database is insufficient if messages continue.
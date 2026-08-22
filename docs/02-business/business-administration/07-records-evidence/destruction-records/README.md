# Destruction Records

Preserves minimal proof that records were legitimately deleted or destroyed after retention expiry while avoiding retention of the deleted sensitive content itself.

## Required destruction evidence
Record class/scope, period or batch, retention authority/rule, legal-hold check, systems/storage covered, deletion/destruction method, execution date, executor/system job, reviewer/verification, exceptions/failures, backup treatment, and final status.

## Workflow
```text
Retention expiry → legal-hold/dispute/regulatory check → deletion batch defined → approval where required → deletion across primary/derived systems → backup lifecycle applied → exception retry → verification → destruction log → register/status update
```

## Control rule
The destruction log should contain enough metadata to prove the process occurred but not reproduce the personal/confidential data that was intentionally deleted.

## Failure modes
Deleting primary data while uncontrolled exports remain, deleting records under legal hold, restoring deleted data from unmanaged backups, or keeping no evidence that the scheduled deletion process actually ran.
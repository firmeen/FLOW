# Backup & Recovery

Documents actual backup coverage, retention, security, restore procedure, and test evidence so recovery promises match reality.

## Required inventory
System/data set, backup method/provider, frequency, retention, encryption, access, location, immutable/versioning features where used, dependency order, RPO/RTO targets if formally defined, restore procedure, owner, and last test.

## Test workflow
```text
Test scope → recovery objective → isolated restore environment → restore → integrity/application validation → timing measured → issues recorded → remediation → re-test → evidence archive
```

## Privacy link
Retention/deletion policies must state how backups behave. Do not promise immediate deletion from every backup if the architecture uses delayed expiry; document the real process and access restrictions.

A successful backup job is not proof that restoration works.
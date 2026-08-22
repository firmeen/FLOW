# Electronic Signature Evidence

Controls the evidence needed to support electronically signed or electronically accepted business records.

## E-sign provider evidence
Signed PDF, provider transaction/envelope ID, signer identity/email, authentication method, timestamps, audit certificate/trail, integrity/hash information where available, and completion/status record.

## Click-through evidence
Account/user, legal/customer context, exact terms/document version, acceptance text, timestamp, source/session/event ID, and immutable copy/hash/reference to accepted content.

## Workflow
```text
Transaction assurance requirement → approved electronic method → identity/authority validation → document presented → signature/affirmative acceptance → provider/system evidence captured → completed document validated → register/archive
```

## Control rule
Evidence should prove **who**, **what version**, **when**, **how**, and with what integrity. A database boolean such as `accepted=true` without the accepted version and event context is incomplete.
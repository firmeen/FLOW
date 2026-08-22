# Security and Compliance Documents Supporting Business Contracts

## Purpose
Security documents are not only technical policies. For a SaaS business they support customer contracts, DPAs, enterprise questionnaires, incident response, vendor reviews, insurance, and due diligence.

## Policy families
Maintain policies that reflect actual practice:
- Information Security Policy;
- Access Control Policy;
- Password/MFA Standard;
- Secure Development Policy;
- Change and Release Management;
- Backup and Restore Policy;
- Business Continuity/Disaster Recovery;
- Incident Response Plan;
- Vulnerability and Patch Management;
- Logging and Monitoring Policy;
- Vendor Security Review;
- Data Classification Standard;
- Retention and Deletion Standard.

## Evidence requirement
A policy without execution evidence is weak.

Examples:
- policy says quarterly access review → keep quarterly review records;
- policy says backups are tested → keep restore-test evidence;
- policy says critical incidents are reviewed → retain post-incident review;
- policy says terminated users lose access → connect HR offboarding to access logs;
- policy says vendor risk is reviewed → retain vendor review record.

## Customer security questionnaire workflow

```text
Customer questionnaire received
→ assign owner
→ answer from current policies/system evidence
→ engineering/security validates technical claims
→ legal validates contractual implications
→ deviations/escalations approved
→ final response stored with date/version
→ commitments added to contract register if binding
```

Never answer “Yes” to a security control merely because it sounds desirable.

## Security schedule / annex
Enterprise customer contracts may include a security exhibit. It should be checked against actual controls and technical architecture.

Common areas:
- encryption;
- identity/access;
- logging;
- vulnerability management;
- backups;
- incident notification;
- subprocessors;
- data location;
- personnel controls;
- secure development;
- business continuity.

## Access review evidence
Recommended register:
`system | user | role | business reason | owner | granted date | last review | revoke date`

Critical systems include GitHub, cloud, production database, payment provider, accounting, banking, customer admin, and document storage.

## Change management evidence
For material production changes retain:
- issue/change reference;
- owner;
- risk;
- review/approval;
- test evidence;
- deployment time;
- rollback method;
- result;
- incident link if failed.

## Business continuity and disaster recovery
Documents should answer:
- which services are critical;
- dependencies;
- backup/recovery approach;
- responsible contacts;
- communication path;
- recovery priorities;
- manual fallback;
- test schedule.

## Common failures
- policy says controls exist but no evidence;
- customer contract contains stronger security promise than reality;
- production access has no owner/review date;
- incident process omits legal/privacy notification analysis;
- backup exists but restore has never been tested.

# Contractors, Freelancers, SOW, Acceptance and Handover

## Purpose
This document family prevents outsourced development/design/consulting work from becoming a loose collection of chats, invoices, and source files with unclear ownership or acceptance.

## Core document stack

```text
Contractor Agreement
→ NDA/confidentiality provisions
→ Statement of Work (SOW)
→ Security/data-access requirements
→ Milestone/deliverable evidence
→ Change Requests
→ Acceptance record
→ Invoice/WHT/payment packet
→ Final handover
→ Access revocation
→ Archive
```

## Contractor Agreement
Should establish the general legal relationship, including:
- independent contractor status;
- services framework;
- confidentiality;
- IP ownership/licensing;
- third-party/open-source disclosure;
- security obligations;
- payment mechanics;
- warranties/representations appropriate to scope;
- termination;
- return/deletion of company/customer information;
- dispute/governing terms.

## Statement of Work
Each project or material assignment should specify:
- objective;
- exact deliverables;
- out-of-scope items;
- dependencies;
- milestones;
- timeline;
- repository/environment;
- technical/documentation requirements;
- acceptance criteria;
- fees/milestone payments;
- change-control process;
- warranty/bug-fix period where agreed;
- final handover requirements.

## Access before work
Use least privilege. Document access request and owner approval for:
- repository;
- dev/staging/production;
- customer data;
- cloud;
- design systems;
- project documents.

Production/customer-data access should be separately justified rather than automatically granted because the contractor is a developer.

## Change request
If scope changes:

```text
Change identified
→ contractor estimates impact
→ FLOW reviews cost/time/security/IP impact
→ written Change Request approved
→ SOW/budget updated
→ work proceeds
```

Avoid “small extras” accumulating into unpaid or disputed scope.

## Acceptance
Before approving final milestone:
- deliverable exists in company-controlled location;
- code/design/source files delivered;
- tests/acceptance criteria met;
- critical defects documented;
- documentation complete;
- licenses/dependencies disclosed;
- credentials transferred;
- IP terms satisfied.

Record approver and acceptance date.

## Invoice and payment

```text
Milestone accepted
→ contractor invoice received
→ WHT/tax treatment reviewed
→ payment voucher approved
→ net payment made
→ WHT certificate/filing handled as applicable
→ accounting posted
→ bank reconciliation
```

## Final handover
Checklist:
- repository commits/branches merged or transferred;
- source/design files;
- build/deploy instructions;
- environment/config documentation without exposing secrets in Git;
- API/integration documentation;
- outstanding issue list;
- admin/account ownership transferred;
- company/customer data returned/deleted;
- access revoked;
- final IP confirmation.

## Common failures
- contractor invoice accepted as proof project is complete;
- source code sits in contractor-owned account;
- editable design files never delivered;
- no IP assignment;
- contractor uses unknown third-party code;
- production access remains after project ends;
- scope changes exist only in chat.

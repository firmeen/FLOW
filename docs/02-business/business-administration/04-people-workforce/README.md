# 04 — People & Workforce

This group covers the full documentary lifecycle of employees, contractors, freelancers, and other people who create work for or gain access to FLOW.

## Substructure

```text
04-people-workforce/
├── employees/
│   ├── offer-employment/
│   ├── job-descriptions/
│   ├── confidentiality-ip/
│   ├── payroll/
│   ├── equipment-access/
│   ├── policy-acknowledgements/
│   └── exit-offboarding/
└── contractors/
    ├── contractor-agreements/
    ├── statement-of-work/
    ├── nda/
    ├── ip-assignment/
    ├── deliverable-acceptance/
    ├── invoices-payments/
    └── handover-offboarding/
```

# A. Employee Lifecycle

## Pre-hire approval

Before an offer is issued, the business should document:

- approved role;
- hiring manager;
- employment type;
- compensation range;
- start date target;
- budget approval;
- reporting line;
- access level likely required;
- equipment requirement.

## Offer and employment agreement

The employment pack should distinguish commercial offer from legally operative employment terms. Topics commonly requiring clear treatment include:

- legal employer;
- position and duties;
- place/mode of work;
- working schedule where applicable;
- salary and payment timing;
- probation if used;
- leave/benefits;
- confidentiality;
- intellectual property;
- company systems/equipment;
- policies;
- conflicts/outside work;
- termination provisions consistent with applicable law.

Final forms should be reviewed for current Thai labour requirements.

## Job description

The job description should be specific enough to establish expectations without trying to become a complete employment contract. It should cover purpose, responsibilities, decision authority, systems/access, reporting line, required competencies, and material security/data responsibilities.

## Employee privacy notice

Explain what employee/applicant data is collected, why, who receives it, retention, and rights/contact route. Employee records should be stored separately from ordinary project documentation.

## Confidentiality and IP

For engineering/design/product roles, explicitly cover:

- company confidential information;
- credentials/source code;
- customer/vendor confidential information;
- work product ownership;
- pre-existing IP disclosure;
- open-source/third-party code restrictions;
- invention disclosure;
- return/deletion at exit.

## Access and equipment onboarding

```text
employment effective
→ manager confirms access profile
→ company email/identity created
→ MFA enrolled
→ GitHub/cloud/SaaS roles provisioned
→ device issued
→ equipment custody acknowledged
→ security/policy acknowledgements completed
→ access register updated
```

Grant least privilege. “Works in engineering” does not automatically mean billing, production database, payroll, domain registrar, and bank access.

## Payroll document chain

```text
employment terms
→ attendance/leave/variable-pay inputs
→ payroll calculation
→ reviewer approval
→ statutory/tax deductions
→ payslip/payroll register
→ bank payment
→ accounting entry
→ tax/social-security filing evidence where applicable
→ reconciliation
```

# B. Changes During Employment

Formalize material changes such as:

- salary adjustment;
- title/role change;
- reporting-line change;
- work-location change;
- bonus/commission plan;
- promotion;
- access elevation;
- disciplinary action where required.

Do not depend only on chat messages for a compensation or employment-status change.

# C. Employee Exit

Exit should be a coordinated legal, payroll, security, finance, and knowledge-transfer event.

```text
resignation/termination initiated
→ legal/HR requirements checked
→ last day confirmed
→ payroll/final payment calculated
→ company property inventoried
→ work/credential handover
→ customer/vendor responsibilities reassigned
→ access disabled/revoked
→ bank/payment/admin authority removed if any
→ final documents issued
→ employee file archived under retention schedule
```

## Access revocation checklist

Review at minimum:

- company email;
- GitHub;
- cloud providers;
- Vercel/Supabase/GCP or other infrastructure;
- domain registrar/DNS;
- password manager;
- payment providers;
- banking/accounting systems;
- CRM/support tools;
- social-media/business accounts;
- shared drives;
- local device tokens/SSH/API keys.

Rotate shared secrets where exposure is possible.

# D. Contractors and Freelancers

## Contractor Agreement

Distinguish contractor from employee structure carefully with professional advice. The agreement should define legal parties, independent relationship, scope mechanism, fees, confidentiality, IP, security, data access, warranties where agreed, termination, and handover.

## Statement of Work

Every meaningful engagement should have a SOW containing:

```text
SOW ID
Project / objective
Deliverables
Out of scope
Dependencies
Milestones
Timeline
Acceptance criteria
Fees / payment milestones
Change-request process
Repository/environment
Security/data constraints
Documentation requirement
Handover requirement
Warranty/bug-fix period if any
```

## Contractor onboarding

```text
agreement + SOW signed
→ identity/payment/tax details collected securely
→ NDA/IP terms confirmed
→ least-privilege accounts created
→ repository/environment scope granted
→ data access restricted
→ project owner assigned
→ deliverable tracking begins
```

## Deliverable acceptance

Acceptance should create evidence beyond “invoice received.” Record:

- deliverable ID;
- repository/PR/release/design link;
- acceptance criteria tested;
- defects/exceptions;
- accepted/rejected/conditionally accepted status;
- approver;
- date;
- payment milestone released.

## Contractor invoice/payment

Connect:

```text
SOW milestone
→ deliverable acceptance
→ invoice
→ tax/WHT review
→ payment approval
→ payment
→ certificate/filing if applicable
→ accounting
```

## Handover/offboarding

Before final closure confirm:

- source code pushed to company repository;
- branches/PRs documented;
- design/source files transferred;
- credentials returned/revoked;
- deployment/runbook documentation delivered;
- third-party components disclosed;
- outstanding bugs listed;
- company/customer data deleted from contractor-controlled systems as required;
- IP obligations confirmed;
- final invoice resolved.

# E. NDA

Use NDA when material confidential information will be disclosed before another agreement contains adequate confidentiality protections. Track counterparty, purpose, term/survival, signed date, and storage location.

# F. Common failure modes

- developer paid but source code remains only in personal repository;
- no IP assignment for core product work;
- contractor has production database access after project ends;
- compensation change is not reflected in payroll records;
- employee owns critical company SaaS account personally;
- shared passwords prevent reliable access revocation;
- equipment is not returned or custody not documented;
- final contractor invoice paid before handover is complete;
- confidential employee files stored in source repository.

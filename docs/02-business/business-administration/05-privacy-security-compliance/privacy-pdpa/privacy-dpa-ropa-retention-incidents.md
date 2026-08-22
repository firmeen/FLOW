# Privacy, PDPA, DPA, ROPA, Retention and Incidents

## Purpose
This document family governs how FLOW handles personal data as a SaaS company and how written privacy commitments connect to real systems, customers, vendors, employees, and incident procedures.

## 1. Role mapping first
Before drafting notices or DPA clauses, identify FLOW's role for each processing activity.

Typical examples:
- FLOW account/billing/sales contacts: FLOW may act as controller for its own business administration.
- Merchant end-customer data processed inside FoodFlow/JobFlow/CareFlow: FLOW may act as processor when the merchant determines purposes and means at the business level.
- Employee/applicant data: FLOW acts for its own employment administration.
- Product analytics/marketing activities: role depends on actual purpose and implementation.

Do not use one blanket statement saying FLOW is always controller or always processor.

## 2. Privacy Notice
A notice should describe the actual operation in understandable language.

Recommended elements:
- controller identity/contact;
- categories of personal data;
- source of data;
- purposes;
- legal basis where applicable;
- recipients/subprocessors;
- international transfer where applicable;
- retention principles;
- rights and request channel;
- required vs optional data;
- consequences if data is not supplied;
- contact/escalation route.

Separate notices may be more accurate for:
- website visitors;
- merchant owners/staff;
- job applicants/employees;
- end consumers where FLOW acts independently.

## 3. Data Processing Agreement (DPA)
Use where FLOW processes personal data for a business customer under the customer's instructions.

Core topics:
- subject matter/duration;
- nature and purpose;
- data categories/data subjects;
- documented instructions;
- confidentiality;
- security measures;
- subprocessors;
- assistance with rights requests;
- incident/breach support;
- audit/information rights;
- return/deletion;
- international transfer requirements.

## 4. ROPA / Processing Inventory
Maintain a live register, not a one-time compliance document.

Recommended fields:
`activity | owner | system | purpose | controller/processor role | data subjects | data fields/categories | legal basis where relevant | recipients | subprocessors | country/location | retention | security classification | rights path | deletion method`

When engineering adds a new integration or feature that changes personal-data use, privacy documentation should be reviewed.

## 5. Subprocessor register
Track cloud, email, messaging, analytics, storage, authentication, support, and other vendors processing personal data.

Fields:
- vendor;
- service;
- data categories;
- role;
- location;
- DPA/terms link;
- transfer mechanism/review if relevant;
- security review;
- start/end date;
- customer notice mechanism if contract requires it.

## 6. Data retention schedule
Retention must map business/legal purpose to system behavior.

Example categories:
- accounting/tax evidence;
- customer contract records;
- active account data;
- audit logs;
- security logs;
- support tickets;
- employee records;
- marketing leads;
- backups.

Each rule should state:
`record type → owner → active retention → archive retention → legal exception → deletion/anonymization method → system responsible`

## 7. Data-subject request workflow

```text
Request received
→ log case
→ verify requester appropriately
→ identify right/request type
→ search relevant systems
→ assess exceptions/legal obligations
→ coordinate with customer-controller if FLOW is processor
→ perform action
→ respond
→ retain evidence of completion
```

Do not delete data immediately just because a user asks; first determine legal role, retention obligations, and whether the request should be handled by the merchant/controller.

## 8. Consent evidence
Where consent is actually relied on, store:
- exact wording/version;
- purpose;
- date/time;
- channel/source;
- user/account reference;
- withdrawal status/date.

Service acceptance and marketing consent should not be silently combined if they serve different legal purposes.

## 9. Data incident/breach workflow

```text
Detection
→ open incident record
→ preserve evidence
→ contain exposure
→ identify systems/data/data subjects
→ determine controller/processor role
→ contractual notification analysis
→ PDPA/legal notification assessment
→ affected customer/controller communication if required
→ remediation
→ root-cause review
→ close with evidence
```

Incident record should capture facts, not speculation. Legal/privacy advisers determine notification duties for material cases.

## 10. Customer termination connection
When SaaS service ends:
- determine export window;
- customer authorizes/request export;
- deactivate accounts;
- begin contractual retention/deletion timeline;
- preserve legally required records separately;
- process backups under documented schedule;
- obtain deletion confirmation where process provides it;
- update subprocessor/system records if tenant is removed.

## 11. Contact points
Typical participants:
- FLOW business/privacy owner;
- engineering/security;
- customer controller/privacy contact;
- cloud/subprocessor support;
- lawyer/privacy adviser;
- PDPC/regulatory contact when required by law.

## Common failures
- generic privacy policy not matching systems;
- no DPA for processor relationship;
- consent recorded without version;
- deleted active data remains indefinitely in exports/backups with no policy;
- security incident handled technically but no privacy assessment;
- subprocessor added by engineering without register/contract review.

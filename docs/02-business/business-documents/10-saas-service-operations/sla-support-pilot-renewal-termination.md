# SaaS Service Operations: SLA, Support, Pilot, Renewal and Termination

## Purpose
This document family governs what happens after contract signature. It translates legal commitments into day-to-day service delivery, support, incident handling, pilot operation, renewal, suspension, and exit.

## SLA
The SLA should define measurable service commitments and their boundaries.

Core fields:
- covered service;
- availability target;
- measurement method and period;
- excluded downtime;
- maintenance windows;
- incident severity definitions;
- response/communication targets;
- support hours/timezone;
- escalation channels;
- customer obligations;
- service-credit mechanics if offered.

Do not promise 100% uptime. Define exclusions for planned maintenance, customer systems, external networks, third-party providers, emergency security work, and force majeure as appropriate.

## Support Policy
Separate ordinary subscription support from paid implementation/professional services.

### Typical included support
- account/access assistance;
- bug investigation;
- standard configuration guidance;
- incident communication.

### Typical separately scoped services
- data migration;
- on-site training;
- custom report;
- bespoke integration;
- custom development;
- unusual after-hours rollout.

## Ticket evidence
For material tickets retain:
- ticket ID;
- customer;
- affected environment/branch;
- problem statement;
- severity;
- timestamps;
- actions/communications;
- workaround;
- resolution;
- linked incident/bug/change;
- SLA assessment.

## Pilot/Beta Agreement
Use during controlled MVP deployment where features, controls, or support are not yet full production maturity.

Define:
- objective;
- test branch/location;
- start/end date;
- features included;
- known limitations;
- use of real vs test data;
- staff verification duties;
- fallback process;
- support contacts;
- fee/free status;
- feedback rights;
- confidentiality;
- data handling;
- termination;
- conversion to paid production.

For FoodFlow pilot, explicitly document who verifies critical order, price, payment, refund/cancellation, and kitchen/service exceptions before relying on automated state.

## Incident management

```text
Detection
→ Triage
→ Severity assignment
→ Containment/mitigation
→ Customer/internal communication
→ Restoration
→ Evidence preservation
→ Root cause analysis when appropriate
→ Corrective action
→ SLA/service-credit assessment
→ Closure
```

## Planned maintenance
Maintain:
- maintenance ID;
- reason;
- affected service;
- planned start/end;
- customer notice;
- rollback plan;
- actual result;
- incident link if maintenance causes disruption.

## Renewal

```text
Renewal window approaching
→ contract register alert
→ check current scope/price/discount
→ review payment status
→ review customer changes
→ send contractual notice/renewal proposal if needed
→ sign new Order Form/amendment if required
→ update billing schedule and entitlement
→ archive renewal evidence
```

## Suspension
Never suspend ad hoc. Use documented triggers and approvals.
Possible triggers:
- non-payment;
- serious security risk;
- unlawful/abusive use;
- material breach;
- emergency protective action.

Record reason, authority, notice, scope, date/time, restoration conditions, and final outcome.

## Termination / customer exit

```text
notice received/issued
→ validate notice and effective date
→ freeze future renewal
→ calculate final billing/refund/credit
→ determine support/access period
→ customer data export process
→ revoke access at effective time
→ retention/deletion schedule activated
→ integrations/secrets disabled
→ final financial reconciliation
→ termination confirmation
→ contract/register archived
```

## Data exit
Contract, DPA, and retention schedule must align on:
- export format;
- export window;
- who can request export;
- deletion timing;
- backup handling;
- legal retention exceptions;
- confirmation evidence.

## Common failures
- SLA terms exist but operations never measure them;
- pilot customer thinks system is production-guaranteed;
- renewal happens without checking discount expiry;
- account suspended without contract notice path;
- cancellation stops billing but does not revoke access;
- access revoked but data deletion/retention never occurs.

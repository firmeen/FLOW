# Logging & Monitoring

Defines which security/operational events are logged, how long logs are retained, who may access them, and how alerts link to investigations.

## Event classes
Authentication and privileged login, role/permission changes, configuration changes, exports/deletions, payment/refund verification, sensitive admin actions, API/webhook failures, security signals, system errors, and incident-relevant events.

## Controls
Time synchronization, structured identifiers, sensitive-data minimization, access restriction, tamper resistance/append-only properties where appropriate, retention, alert thresholds, alert ownership, suppression/tuning record, and incident linkage.

## Validation
Periodically test that critical events actually produce usable logs and that alerts reach a responsible person. A logging policy with uncollected or unreadable logs is not effective.
# Privacy Retention & Deletion

Defines record/data-category-specific retention triggers, active/archive periods, legal holds, backup treatment, deletion/anonymization methods, and completion evidence.

## Required fields
Data/record class, business/legal purpose, trigger date, active-retention rule, archive-retention rule, system owner, systems/copies, backup behavior, legal-hold override, deletion/anonymization method, reviewer, and proof/log reference.

## Workflow
```text
Retention rule approved → system mapping → trigger occurs → active period → archive/restricted state → legal-hold check → deletion/anonymization job → verification across primary/derived systems → exception handling → minimal destruction evidence
```

## Important distinction
Customer termination does not automatically mean immediate deletion of every record. Accounting, tax, dispute, security, fraud, or contractual evidence may have separate justified retention. Separate service data from records retained for those purposes.
# Naming & Versioning

Controls document IDs, file names, version numbers, effective dates, status labels, numbering sequences, and supersession rules.

## Durable naming rule
Folder names describe business responsibility. Git history records revisions. Do not create durable folders named `*-v2`, `*-new`, `*-final`, `*-latest`, or similar revision-state labels.

## Required rules
- deterministic document IDs by document family;
- clear distinction between template version and executed-instance ID;
- controlled status vocabulary;
- effective/review dates separated from file modified time;
- no silent replacement of executed evidence;
- issued numbering sequences never recycled;
- voided/cancelled numbers retained with status;
- every amendment or replacement links to the prior record.

## Validation before naming
Check sibling-name uniqueness, scope accuracy, overlap with another owner, repository taxonomy, expected future growth, and whether the name remains understandable without historical context.

## Workflow
```text
Need identified → choose existing family or justify new one → assign ID/name → check collision → assign version/status → review → publish/execute → register → supersede/archive previous version when applicable
```

## Failure modes
Conflicting `final` copies, duplicate invoice numbers, template version confused with contract instance, old policy still presented as current, folder names encoding migration history, or a replacement record that cannot be traced to the original.
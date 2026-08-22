# Vendor Termination

Controls safe retirement of a supplier, including cancellation deadlines, recurring payments, data export/deletion, credentials, integrations, and final accounting.

## Workflow
```text
Retire decision → contract/fees/notice checked → replacement/migration plan → export/backup required data → cancel account/contract → recurring payment stopped → API/integration migration → vendor deletion confirmation where required → credentials revoked → final invoice/payment/reconciliation → vendor/subprocessor registers updated → archive
```

## Completion gate
Termination is incomplete while production API keys remain valid, recurring card charges continue, necessary data is trapped at the vendor, or the subprocessor register still shows the vendor active.
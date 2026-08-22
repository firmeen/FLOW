# Bank Accounts

Maintains the lifecycle and control record for each corporate bank account.

## Required register fields
Bank/branch, account purpose, currency, legal account holder, opening authority/resolution, KYC approval, authorized users/signatories, limits, statement method, accounting ledger mapping, reconciliation owner, opening/effective date, status, and closure date/evidence. Sensitive account details remain in secure systems.

## Lifecycle
```text
Need approved → bank selected → current corporate/KYC pack → authority evidence → application → account opened → users/limits configured → ledger created → payment controls activated → periodic review/reconciliation → closure approval → final reconciliation → access revoked/archive
```

## Validation
Confirm account ownership matches the company, permissions match the authority matrix, settlement providers point to the intended account, and closed accounts are removed from payment instructions and integrations.
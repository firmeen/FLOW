# Bank Signatories & Users

Controls who may access, prepare, approve, or sign banking instructions and the evidence supporting that authority.

## Matrix fields
Person/role, bank/account scope, maker/viewer/approver/signatory permission, transaction limit, joint-approval requirement, authority source, effective date, review date, MFA/token custody reference, and revocation date.

## Change workflow
```text
Role/authority change → corporate approval/resolution if required → bank change request → bank confirmation → internal authority register update → device/token/access review → test/verification → old authority revoked
```

## Critical triggers
Director/employee departure, finance-role change, lost device/token, bank-account change, suspected compromise, new transaction threshold, or organizational restructuring.

A former employee or director remaining active at the bank is a critical control defect.
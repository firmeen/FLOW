# Employee Payroll Records

Controls the evidence chain from effective employment terms to payroll calculation, approval, payment, statutory/tax action, accounting, and reconciliation.

## Inputs
Employee master, effective salary/compensation amendments, attendance/leave/variable-pay inputs, bonus/commission approvals, taxable benefits where relevant, deductions, bank details in secure storage, and statutory/tax parameters.

## Workflow
```text
Inputs locked → payroll calculation → exception review → approval → deductions/statutory/tax → payslips/register → bank payment → filing/remittance → accounting posting → payroll/bank/control-account reconciliation → archive
```

## Controls
Sensitive payroll details never belong in Git. Compensation changes must have an effective approval record. Manual adjustments require reason and reviewer. Final payroll on exit must reconcile to termination/resignation date and all approved amounts.
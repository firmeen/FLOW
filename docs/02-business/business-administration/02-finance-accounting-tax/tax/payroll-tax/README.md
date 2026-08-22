# Payroll Tax

Connects employee master/compensation data, payroll calculations, taxable compensation, deductions, payments, statutory/tax filings, and accounting evidence.

## Inputs
Effective employment/compensation terms, attendance/leave/variable-pay inputs, taxable benefits where relevant, employee tax data in secure storage, prior-period adjustments, and statutory requirements.

## Workflow
```text
Payroll inputs locked → calculation → reviewer approval → tax/statutory deductions → net payroll → payslip/register → bank payment → filing/remittance → accounting → reconciliation → archive
```

## Controls
Compensation changes must be formally effective before payroll use; sensitive payroll data never belongs in Git; filing/payment status must reconcile to payroll and ledger totals.
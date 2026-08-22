# Revenue Sharing

Controls calculations and settlement when FLOW and a partner share defined revenue.

## Contract definition must specify
Gross or net revenue base, taxes, refunds/credits, payment-provider fees, discounts, chargebacks, earning event, attribution rules, reporting period, settlement date, minimum thresholds, currency/FX rules, audit rights, clawbacks, dispute window, and termination tail.

## Settlement workflow
```text
Period closes → eligible transactions extracted → exclusions/adjustments → calculation → partner statement → finance review → dispute/approval → payment → tax/WHT treatment → accounting → reconciliation → archive
```

## Control rule
Do not use an undefined concept such as “revenue” in settlement logic; the agreement and calculation model must use the same explicit basis.
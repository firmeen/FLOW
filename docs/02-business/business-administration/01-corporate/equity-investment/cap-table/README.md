# Cap Table

Maintains the management model of ownership and dilution while reconciling it to legally effective share records.

## Required dimensions
Holder, share class/type, issued shares, ownership %, fully diluted view where used, acquisition/issuance event, effective date, consideration, certificate/register reference, vesting/options/convertibles if applicable, and version/date.

## Version rule
Create a cap-table version tied to each legal ownership event. Preserve historical versions for diligence and transaction reconstruction.

## Reconciliation
```text
Transaction document → corporate approval → funds/consideration → statutory/share register → certificate/evidence → cap table
```

If the spreadsheet cannot be reconciled to the share register and transaction evidence, treat it as an exception, not as authoritative truth.
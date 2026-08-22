# Payment Responsibility Model

Defines responsibilities among Customer, Merchant, FLOW, and the gateway/acquirer/bank before a payment method goes live.

## Questions to answer
Who is merchant of record; who contracts with the payer; whose bank account receives settlement; who performs KYC; who can refund/void; who manages chargebacks; who bears provider fees; who issues receipt/tax evidence; who stores credentials; what card/account/payment data FLOW can see; and whether FLOW only relays technical status or receives/holds/routes funds.

## Required artifact
A signed-off responsibility matrix and funds/data-flow diagram with legal, finance/accounting, product/engineering, privacy/security, and payment-provider review according to risk.

## Trigger
New provider/method, marketplace/reseller model, merchant payout feature, stored value, split settlement, pooled funds, or any change to who receives or controls money.
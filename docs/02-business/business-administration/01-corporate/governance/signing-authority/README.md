# Signing Authority

Defines who may legally or operationally sign specific classes of documents for FLOW and under what thresholds or preconditions.

## Authority matrix fields
Document/transaction type, monetary threshold, business owner, mandatory reviewers, authorized signatory, joint-signature requirement if any, validity period, delegation source, and evidence required after signing.

## Covered examples
Customer MSA/order form, NDA, vendor agreement, cloud commitment, employment/contractor agreement, bank instruction, payment-provider form, refund/credit authorization, investment/share documents, and regulatory submissions.

## Workflow
```text
Document ready → deviations/materiality checked → approval matrix applied → signatory authority verified as of signing date → signature obtained → executed copy validated → register updated
```

A person's job title alone is not proof of authority.